import { hashPassword, makeToken, generateId } from "./store.js";
import { selectExamQuestions } from "../data/mock-questions.js";

const SUPPORTED_ROUTE_IDS = new Set(["A", "B"]);

function normalizeRouteId(routeId) {
  const normalized = String(routeId || "")
    .trim()
    .toUpperCase();
  return SUPPORTED_ROUTE_IDS.has(normalized) ? normalized : null;
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function publicUser(user) {
  return {
    user_id: user.user_id,
    username: user.username,
    email: user.email,
    is_creator: Boolean(user.is_creator),
    created_at: user.created_at,
  };
}

function rulesForRoute(store, routeId) {
  return store.rules.filter((rule) => rule.routeId === "ALL" || rule.routeId === routeId);
}

function validateRouteShape(route, routeId) {
  if (!route || typeof route !== "object") {
    return "route is required";
  }
  if (!route.startPose || typeof route.startPose !== "object") {
    return "route.startPose is required";
  }
  if (
    !Number.isFinite(Number(route.startPose.x)) ||
    !Number.isFinite(Number(route.startPose.y)) ||
    !Number.isFinite(Number(route.startPose.headingDeg))
  ) {
    return "route.startPose must include numeric x, y and headingDeg";
  }
  if (!Array.isArray(route.path) || route.path.length < 2) {
    return "route.path must include at least 2 points";
  }
  if (!Array.isArray(route.checkpoints)) {
    return "route.checkpoints must be an array";
  }
  if (route.routeId && String(route.routeId).toUpperCase() !== routeId) {
    return "route.routeId must match route_id";
  }
  return null;
}

function mapMetadata(record) {
  return {
    map_id: record.map_id,
    route_id: record.route_id,
    name: record.name,
    version: record.version,
    created_by: record.created_by,
    created_at: record.created_at,
    published_at: record.published_at,
  };
}

function normalizeMapName(name, fallbackName) {
  const normalized = String(name || "").trim();
  return (normalized || fallbackName).slice(0, 120);
}

function parsePositiveInteger(value, fallback, min = 0, max = Number.POSITIVE_INFINITY) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const rounded = Math.floor(parsed);
  if (rounded < min) {
    return min;
  }
  if (rounded > max) {
    return max;
  }
  return rounded;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function parseSupabaseError(payload, fallback) {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  return payload.message || payload.error || payload.hint || fallback;
}

function unique(values) {
  return [...new Set(values)];
}

export function createSupabaseService(store) {
  const url = String(process.env.SUPABASE_URL || "").trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  const restBase = `${url.replace(/\/+$/, "")}/rest/v1`;
  const baseHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
  const creatorEmail = String(process.env.CREATOR_EMAIL || "")
    .trim()
    .toLowerCase();
  const simActiveTtlSec = Math.max(5 * 60, Number(process.env.SIM_ACTIVE_TTL_SEC || 900));
  const simCleanupMinIntervalSec = Math.max(15, Number(process.env.SIM_CLEANUP_MIN_INTERVAL_SEC || 60));
  let lastSimCleanupAtMs = 0;

  async function request(path, { method = "GET", params = null, body = undefined, prefer = null } = {}) {
    const requestUrl = new URL(`${restBase}/${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value == null || value === "") {
          continue;
        }
        requestUrl.searchParams.append(key, String(value));
      }
    }

    const headers = { ...baseHeaders };
    if (prefer) {
      headers.Prefer = prefer;
    }

    const response = await fetch(requestUrl, {
      method,
      headers,
      body: body == null ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const error = new Error(parseSupabaseError(payload, `supabase ${response.status}`));
      error.status = response.status;
      throw error;
    }

    return payload;
  }

  async function selectRows(table, filters = {}, options = {}) {
    const { select = "*", order = null, limit = null, offset = null } = options;
    const params = { select, ...filters };
    if (order) {
      params.order = order;
    }
    if (Number.isFinite(limit) && Number(limit) > 0) {
      params.limit = Math.max(1, Math.floor(Number(limit)));
    }
    if (Number.isFinite(offset) && Number(offset) >= 0) {
      params.offset = Math.max(0, Math.floor(Number(offset)));
    }
    const rows = await request(table, { params });
    return asArray(rows);
  }

  async function insertRows(table, rows, options = {}) {
    const { upsert = false, onConflict = null, returning = true } = options;
    const preferParts = [];
    if (upsert) {
      preferParts.push("resolution=merge-duplicates");
    }
    preferParts.push(returning ? "return=representation" : "return=minimal");
    const params = {};
    if (onConflict) {
      params.on_conflict = onConflict;
    }
    const payload = await request(table, {
      method: "POST",
      params,
      body: rows,
      prefer: preferParts.join(","),
    });
    return asArray(payload);
  }

  async function patchRows(table, filters, values, options = {}) {
    const { returning = true } = options;
    const payload = await request(table, {
      method: "PATCH",
      params: filters,
      body: values,
      prefer: returning ? "return=representation" : "return=minimal",
    });
    return asArray(payload);
  }

  async function deleteRows(table, filters) {
    await request(table, {
      method: "DELETE",
      params: filters,
      prefer: "return=minimal",
    });
  }

  async function mapUsernames(userIds) {
    const ids = unique(userIds.filter(Boolean));
    if (!ids.length) {
      return new Map();
    }
    const rows = await selectRows(
      "app_users",
      {
        user_id: `in.(${ids.join(",")})`,
      },
      { select: "user_id,username" },
    );
    const map = new Map();
    for (const row of rows) {
      map.set(row.user_id, row.username);
    }
    return map;
  }

  async function resolveRoute(routeId) {
    const normalizedRouteId = normalizeRouteId(routeId);
    if (!normalizedRouteId) {
      return null;
    }

    const activeRows = await selectRows(
      "active_route_maps",
      { route_id: `eq.${normalizedRouteId}` },
      { select: "route_id,map_id,updated_at", limit: 1 },
    );

    if (activeRows.length > 0 && activeRows[0].map_id) {
      const mapRows = await selectRows("maps", { map_id: `eq.${activeRows[0].map_id}` }, { select: "*", limit: 1 });
      if (mapRows.length > 0 && mapRows[0].route) {
        return cloneJson(mapRows[0].route);
      }
    }

    return store.routes[normalizedRouteId] ? cloneJson(store.routes[normalizedRouteId]) : null;
  }

  async function getActiveRoutePayload(routeId) {
    const normalizedRouteId = normalizeRouteId(routeId);
    if (!normalizedRouteId) {
      return null;
    }

    const route = await resolveRoute(normalizedRouteId);
    if (!route) {
      return null;
    }

    const activeRows = await selectRows(
      "active_route_maps",
      { route_id: `eq.${normalizedRouteId}` },
      { select: "route_id,map_id,updated_at", limit: 1 },
    );
    const active = activeRows[0];
    let map = null;
    if (active?.map_id) {
      const mapRows = await selectRows("maps", { map_id: `eq.${active.map_id}` }, { select: "*", limit: 1 });
      if (mapRows.length) {
        map = mapMetadata(mapRows[0]);
      }
    }

    return {
      route_id: normalizedRouteId,
      source: map ? "published_map" : "default_mock",
      map,
      route,
    };
  }

  async function getAllActiveRoutesPayload() {
    return {
      routes: {
        A: await getActiveRoutePayload("A"),
        B: await getActiveRoutePayload("B"),
      },
    };
  }

  function staleCutoffIso(ttlSec = simActiveTtlSec) {
    const parsed = Number(ttlSec);
    const effectiveTtlSec = Number.isFinite(parsed) && parsed > 0 ? Math.max(5 * 60, parsed) : simActiveTtlSec;
    const cutoffMs = Date.now() - effectiveTtlSec * 1000;
    return {
      effectiveTtlSec,
      cutoffIso: new Date(cutoffMs).toISOString(),
    };
  }

  function parseCleanupRemovedCount(payload) {
    if (Number.isFinite(Number(payload))) {
      return Math.max(0, Math.round(Number(payload)));
    }
    if (Array.isArray(payload) && payload.length > 0) {
      return parseCleanupRemovedCount(payload[0]);
    }
    if (payload && typeof payload === "object") {
      for (const [key, value] of Object.entries(payload)) {
        if (key.includes("cleanup_stale_sim_active_sessions") && Number.isFinite(Number(value))) {
          return Math.max(0, Math.round(Number(value)));
        }
      }
    }
    return null;
  }

  async function cleanupStaleSimActiveSessions(ttlSec = simActiveTtlSec, options = {}) {
    const { force = false } = options;
    const { effectiveTtlSec, cutoffIso } = staleCutoffIso(ttlSec);
    const nowMs = Date.now();
    if (!force && nowMs - lastSimCleanupAtMs < simCleanupMinIntervalSec * 1000) {
      return {
        removed: 0,
        ttl_sec: effectiveTtlSec,
        min_interval_sec: simCleanupMinIntervalSec,
        skipped: true,
        reason: "throttled",
      };
    }
    lastSimCleanupAtMs = nowMs;

    const maxAgeMinutes = Math.max(1, Math.ceil(effectiveTtlSec / 60));
    try {
      const rpcPayload = await request("rpc/cleanup_stale_sim_active_sessions", {
        method: "POST",
        body: { max_age_minutes: maxAgeMinutes },
      });
      const removed = parseCleanupRemovedCount(rpcPayload);
      if (removed != null) {
        return {
          removed,
          ttl_sec: effectiveTtlSec,
          min_interval_sec: simCleanupMinIntervalSec,
          skipped: false,
          via: "rpc",
        };
      }
    } catch {
      // Fallback for environments where the SQL helper function is not available yet.
    }

    const staleRows = await selectRows("sim_active_sessions", {
      last_seen_at: `lt.${cutoffIso}`,
    });
    if (staleRows.length) {
      await deleteRows("sim_active_sessions", {
        last_seen_at: `lt.${cutoffIso}`,
      });
    }
    return {
      removed: staleRows.length,
      ttl_sec: effectiveTtlSec,
      min_interval_sec: simCleanupMinIntervalSec,
      skipped: false,
      via: "rest",
    };
  }

  async function createRouteMapRecord(user, payload) {
    if (!user?.is_creator) {
      return { status: 403, error: "creator permissions required" };
    }

    const routeId = normalizeRouteId(payload?.route_id);
    if (!routeId) {
      return { status: 400, error: "invalid route_id" };
    }

    const route = cloneJson(payload?.route);
    const shapeError = validateRouteShape(route, routeId);
    if (shapeError) {
      return { status: 400, error: shapeError };
    }
    route.routeId = routeId;
    route.unit = route.unit || "meters";

    const lastVersion = await selectRows(
      "maps",
      { route_id: `eq.${routeId}` },
      { select: "version", order: "version.desc", limit: 1 },
    );
    const version = (Number(lastVersion[0]?.version) || 0) + 1;
    const now = new Date().toISOString();
    const defaultName = `Route ${routeId} v${version}`;

    const mapRecord = {
      map_id: generateId("map"),
      route_id: routeId,
      name: normalizeMapName(payload?.name, defaultName),
      version,
      route,
      created_by: user.user_id,
      created_at: now,
      published_at: now,
    };

    const [created] = await insertRows("maps", [mapRecord], { returning: true });
    return { status: 201, data: created };
  }

  async function activateRouteMapRecord(record) {
    const now = new Date().toISOString();
    await insertRows(
      "active_route_maps",
      [{ route_id: record.route_id, map_id: record.map_id, updated_at: now }],
      {
        upsert: true,
        onConflict: "route_id",
        returning: false,
      },
    );
    await patchRows("maps", { map_id: `eq.${record.map_id}` }, { published_at: now }, { returning: false });
    return now;
  }

  return {
    enabled: true,

    async registerUser(payload) {
      try {
        const { username, email, password } = payload ?? {};
        if (!username || !email || !password) {
          return { status: 400, error: "username, email and password are required" };
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedUsername = String(username).trim();
        if (!normalizedUsername) {
          return { status: 400, error: "username, email and password are required" };
        }

        const duplicated = await selectRows(
          "app_users",
          {
            or: `(email.eq.${normalizedEmail},username.eq.${normalizedUsername})`,
          },
          { select: "user_id", limit: 1 },
        );
        if (duplicated.length) {
          return { status: 409, error: "username or email already exists" };
        }

        const firstUser = await selectRows("app_users", {}, { select: "user_id", order: "created_at.asc", limit: 1 });
        const isCreator = creatorEmail ? creatorEmail === normalizedEmail : firstUser.length === 0;
        const user = {
          user_id: generateId("usr"),
          username: normalizedUsername,
          email: normalizedEmail,
          is_creator: isCreator,
          password_hash: hashPassword(password),
          created_at: new Date().toISOString(),
        };

        const [created] = await insertRows("app_users", [user], { returning: true });
        const token = makeToken();
        await insertRows(
          "auth_tokens",
          [
            {
              token,
              user_id: created.user_id,
              created_at: new Date().toISOString(),
            },
          ],
          { returning: false },
        );

        return {
          status: 201,
          data: {
            token,
            user: publicUser(created),
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async loginUser(payload) {
      try {
        const { email, password } = payload ?? {};
        if (!email || !password) {
          return { status: 400, error: "email and password are required" };
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const passwordHash = hashPassword(password);

        const users = await selectRows(
          "app_users",
          {
            email: `eq.${normalizedEmail}`,
            password_hash: `eq.${passwordHash}`,
          },
          { select: "*", limit: 1 },
        );
        if (!users.length) {
          return { status: 401, error: "invalid credentials" };
        }

        const user = users[0];
        const token = makeToken();
        await insertRows(
          "auth_tokens",
          [{ token, user_id: user.user_id, created_at: new Date().toISOString() }],
          { returning: false },
        );

        return {
          status: 200,
          data: {
            token,
            user: publicUser(user),
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async authenticate(req) {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
          return null;
        }
        const token = authHeader.slice("Bearer ".length);
        const tokenRows = await selectRows("auth_tokens", { token: `eq.${token}` }, { select: "token,user_id", limit: 1 });
        if (!tokenRows.length) {
          return null;
        }
        const userRows = await selectRows("app_users", { user_id: `eq.${tokenRows[0].user_id}` }, { select: "*", limit: 1 });
        return userRows[0] ?? null;
      } catch {
        return null;
      }
    },

    async createExamAttempt(user) {
      const selectedQuestions = selectExamQuestions(store.questionBank, store.examConfig.questionCount);
      const draftId = generateId("exam_draft");
      const now = new Date().toISOString();

      await insertRows(
        "exam_drafts",
        [
          {
            attempt_id: draftId,
            user_id: user.user_id,
            question_ids: selectedQuestions.map((question) => question.id),
            started_at: now,
          },
        ],
        { returning: false },
      );

      const questions = selectedQuestions.map((question) => ({
        id: question.id,
        topic: question.topic,
        stemEs: question.stemEs,
        stemEn: question.stemEn,
        optionsEs: question.optionsEs,
        optionsEn: question.optionsEn,
        debugCorrectOption: question.correctOption,
      }));

      return {
        attempt_id: draftId,
        config: store.examConfig,
        questions,
      };
    },

    async submitExamAttempt(user, attemptId, payload) {
      try {
        const draftRows = await selectRows(
          "exam_drafts",
          {
            attempt_id: `eq.${attemptId}`,
            user_id: `eq.${user.user_id}`,
          },
          { select: "*", limit: 1 },
        );
        if (!draftRows.length) {
          return { status: 404, error: "exam attempt not found" };
        }

        const draft = draftRows[0];
        const answers = payload?.answers ?? {};
        const durationSec = Number(payload?.duration_sec) > 0 ? Number(payload.duration_sec) : 0;

        const questions = asArray(draft.question_ids)
          .map((id) => store.questionBank.find((question) => question.id === id))
          .filter(Boolean);

        let correctCount = 0;
        for (const question of questions) {
          if (answers[question.id] === question.correctOption) {
            correctCount += 1;
          }
        }

        const total = questions.length;
        const scorePct = total > 0 ? Number(((correctCount / total) * 100).toFixed(2)) : 0;
        const attemptRecord = {
          attempt_id: generateId("exam_attempt"),
          draft_id: draft.attempt_id,
          user_id: user.user_id,
          score_pct: scorePct,
          correct_count: correctCount,
          duration_sec: durationSec,
          passed: scorePct >= store.examConfig.passThresholdPct,
          created_at: new Date().toISOString(),
        };

        await insertRows("exam_attempts", [attemptRecord], { returning: false });
        await deleteRows("exam_drafts", { attempt_id: `eq.${attemptId}` });

        return {
          status: 200,
          data: attemptRecord,
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async startSimSession(user, payload) {
      try {
        await cleanupStaleSimActiveSessions();
        const routeId = normalizeRouteId(payload?.route_id);
        const route = await resolveRoute(routeId);
        if (!routeId || !route) {
          return { status: 400, error: "invalid route_id" };
        }

        await deleteRows("sim_active_sessions", { user_id: `eq.${user.user_id}` });
        const now = new Date().toISOString();
        const sessionId = generateId("sim_active");
        const heartbeatToken = makeToken();
        await insertRows(
          "sim_active_sessions",
          [
            {
              session_id: sessionId,
              user_id: user.user_id,
              route_id: routeId,
              heartbeat_token: heartbeatToken,
              events: [],
              started_at: now,
              last_seen_at: now,
            },
          ],
          { returning: false },
        );

        return {
          status: 201,
          data: {
            session_id: sessionId,
            heartbeat_token: heartbeatToken,
            route,
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async appendSimEvents(user, sessionId, payload) {
      try {
        const rows = await selectRows(
          "sim_active_sessions",
          {
            session_id: `eq.${sessionId}`,
            user_id: `eq.${user.user_id}`,
          },
          { select: "*", limit: 1 },
        );
        if (!rows.length) {
          return { status: 404, error: "sim session not found" };
        }

        const session = rows[0];
        const incoming = asArray(payload?.events).map((event) => ({
          triggerKey: event.triggerKey,
          atMs: Number(event.atMs) || 0,
          meta: event.meta ?? {},
        }));
        const mergedEvents = [...asArray(session.events), ...incoming];
        const now = new Date().toISOString();

        await patchRows(
          "sim_active_sessions",
          { session_id: `eq.${sessionId}` },
          { events: mergedEvents, last_seen_at: now },
          { returning: false },
        );

        return {
          status: 202,
          data: {
            accepted: incoming.length,
            total_events: mergedEvents.length,
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async finishSimSession(user, sessionId, payload) {
      try {
        const rows = await selectRows(
          "sim_active_sessions",
          {
            session_id: `eq.${sessionId}`,
            user_id: `eq.${user.user_id}`,
          },
          { select: "*", limit: 1 },
        );
        if (!rows.length) {
          return { status: 404, error: "sim session not found" };
        }

        const session = rows[0];
        const durationSec = Number(payload?.duration_sec) > 0 ? Number(payload.duration_sec) : 0;
        const activeRules = rulesForRoute(store, session.route_id);

        let score = 100;
        let criticalFail = false;
        let failReason = null;
        const penalties = [];

        for (const event of asArray(session.events)) {
          const matched = activeRules.filter((rule) => rule.triggerKey === event.triggerKey);
          for (const rule of matched) {
            if (rule.severity === "critical" || rule.failImmediately) {
              criticalFail = true;
              failReason = failReason ?? rule.triggerKey;
            } else {
              score = Math.max(0, score - rule.points);
            }
            penalties.push({
              ruleId: rule.ruleId,
              triggerKey: rule.triggerKey,
              severity: rule.severity,
              points: rule.points,
              messageEs: rule.messageEs,
              messageEn: rule.messageEn,
            });
          }
          if (criticalFail) {
            break;
          }
        }

        const record = {
          session_id: generateId("sim_session"),
          user_id: user.user_id,
          route_id: session.route_id,
          score_pct: score,
          critical_fail: criticalFail,
          fail_reason: failReason,
          duration_sec: durationSec,
          created_at: new Date().toISOString(),
          penalties,
        };

        await insertRows("sim_sessions", [record], { returning: false });
        await deleteRows("sim_active_sessions", { session_id: `eq.${sessionId}` });

        return { status: 200, data: record };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async abandonSimSession(user, sessionId) {
      try {
        const rows = await selectRows(
          "sim_active_sessions",
          {
            session_id: `eq.${sessionId}`,
            user_id: `eq.${user.user_id}`,
          },
          { select: "session_id", limit: 1 },
        );
        if (!rows.length) {
          return { status: 404, error: "sim session not found" };
        }

        await deleteRows("sim_active_sessions", { session_id: `eq.${sessionId}` });
        return {
          status: 200,
          data: {
            session_id: sessionId,
            abandoned: true,
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async buildTheoryLeaderboard(limit = 50) {
      const rows = await selectRows(
        "exam_attempts",
        {},
        {
          select: "attempt_id,user_id,score_pct,correct_count,duration_sec,passed,created_at",
          order: "score_pct.desc,duration_sec.asc",
          limit: Number(limit) || 50,
        },
      );
      const usernames = await mapUsernames(rows.map((row) => row.user_id));
      return rows.map((row, idx) => ({
        rank: idx + 1,
        user_id: row.user_id,
        username: usernames.get(row.user_id) ?? "unknown",
        score_pct: Number(row.score_pct),
        correct_count: Number(row.correct_count),
        duration_sec: Number(row.duration_sec),
        passed: Boolean(row.passed),
        created_at: row.created_at,
      }));
    },

    async buildSimulationLeaderboard(limit = 50) {
      const rows = await selectRows(
        "sim_sessions",
        {},
        {
          select: "session_id,user_id,route_id,score_pct,critical_fail,fail_reason,duration_sec,created_at",
          order: "score_pct.desc,critical_fail.asc,duration_sec.asc",
          limit: Number(limit) || 50,
        },
      );
      const usernames = await mapUsernames(rows.map((row) => row.user_id));
      return rows.map((row, idx) => ({
        rank: idx + 1,
        user_id: row.user_id,
        username: usernames.get(row.user_id) ?? "unknown",
        route_id: row.route_id,
        score_pct: Number(row.score_pct),
        critical_fail: Boolean(row.critical_fail),
        fail_reason: row.fail_reason,
        duration_sec: Number(row.duration_sec),
        created_at: row.created_at,
      }));
    },

    async buildUserProfile(userId) {
      const theoryHistory = await selectRows(
        "exam_attempts",
        { user_id: `eq.${userId}` },
        {
          select: "attempt_id,user_id,score_pct,correct_count,duration_sec,passed,created_at",
          order: "created_at.desc",
          limit: 100,
        },
      );
      const simulationHistory = await selectRows(
        "sim_sessions",
        { user_id: `eq.${userId}` },
        {
          select: "session_id,user_id,route_id,score_pct,critical_fail,fail_reason,duration_sec,created_at",
          order: "created_at.desc",
          limit: 100,
        },
      );
      const bestTheoryScore = theoryHistory.reduce(
        (best, current) => (Number(current.score_pct) > best ? Number(current.score_pct) : best),
        0,
      );
      const bestSimulationScore = simulationHistory.reduce(
        (best, current) => (Number(current.score_pct) > best ? Number(current.score_pct) : best),
        0,
      );
      return {
        bestTheoryScore,
        bestSimulationScore,
        theoryHistory,
        simulationHistory,
      };
    },

    async cleanupStaleActiveSessions(ttlSec, options = {}) {
      try {
        const result = await cleanupStaleSimActiveSessions(ttlSec, { force: true, ...options });
        return { status: 200, data: result };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async publishRouteMap(user, payload) {
      try {
        const created = await createRouteMapRecord(user, payload);
        if (created.error) {
          return created;
        }
        const mapRecord = created.data;
        const publishedAt = await activateRouteMapRecord(mapRecord);
        mapRecord.published_at = publishedAt;

        return {
          status: 201,
          data: {
            map: mapMetadata(mapRecord),
            route: cloneJson(mapRecord.route),
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async saveRouteMap(user, payload) {
      try {
        const created = await createRouteMapRecord(user, payload);
        if (created.error) {
          return created;
        }
        const mapRecord = created.data;
        return {
          status: 201,
          data: {
            map: mapMetadata(mapRecord),
            route: cloneJson(mapRecord.route),
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async activateRouteMap(user, payload) {
      try {
        if (!user?.is_creator) {
          return { status: 403, error: "creator permissions required" };
        }
        const mapId = String(payload?.map_id || "").trim();
        if (!mapId) {
          return { status: 400, error: "map_id is required" };
        }

        const routeFilterRaw = payload?.route_id == null ? "" : String(payload.route_id);
        const routeFilter = routeFilterRaw ? normalizeRouteId(routeFilterRaw) : null;
        if (routeFilterRaw && !routeFilter) {
          return { status: 400, error: "invalid route_id" };
        }

        const filters = { map_id: `eq.${mapId}` };
        if (routeFilter) {
          filters.route_id = `eq.${routeFilter}`;
        }
        const rows = await selectRows("maps", filters, { select: "*", limit: 1 });
        if (!rows.length) {
          return { status: 404, error: "map not found" };
        }

        const mapRecord = rows[0];
        const publishedAt = await activateRouteMapRecord(mapRecord);
        mapRecord.published_at = publishedAt;
        return {
          status: 200,
          data: {
            map: mapMetadata(mapRecord),
            route: cloneJson(mapRecord.route),
            activated: true,
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async listRouteMaps(user, query = {}) {
      try {
        if (!user?.is_creator) {
          return { status: 403, error: "creator permissions required" };
        }

        const routeFilterRaw = String(query.route_id || "").trim();
        const routeFilter =
          routeFilterRaw && routeFilterRaw.toUpperCase() !== "ALL" ? normalizeRouteId(routeFilterRaw) : null;
        if (routeFilterRaw && routeFilterRaw.toUpperCase() !== "ALL" && !routeFilter) {
          return { status: 400, error: "invalid route_id" };
        }

        const q = String(query.q || "").trim();
        const limit = parsePositiveInteger(query.limit, 50, 1, 200);
        const offset = parsePositiveInteger(query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

        const filters = {};
        if (routeFilter) {
          filters.route_id = `eq.${routeFilter}`;
        }
        if (q) {
          const escaped = q.replace(/[,%]/g, "").trim();
          if (escaped) {
            filters.or = `(name.ilike.*${escaped}*,map_id.ilike.*${escaped}*)`;
          }
        }

        const rows = await selectRows("maps", filters, {
          select: "*",
          order: "created_at.desc,version.desc",
          limit: limit + 1,
          offset,
        });
        const hasMore = rows.length > limit;
        const pageRows = hasMore ? rows.slice(0, limit) : rows;

        const activeRows = await selectRows("active_route_maps", {}, { select: "route_id,map_id" });
        const activeByRoute = new Map(activeRows.map((row) => [row.route_id, row.map_id]));
        const maps = pageRows.map((row) => ({
          ...mapMetadata(row),
          is_active: activeByRoute.get(row.route_id) === row.map_id,
        }));

        return {
          status: 200,
          data: {
            maps,
            pagination: {
              limit,
              offset,
              has_more: hasMore,
            },
            filters: {
              route_id: routeFilter || "ALL",
              q: String(query.q || "").trim(),
            },
          },
        };
      } catch (error) {
        return { status: Number(error.status) || 500, error: error.message || "internal server error" };
      }
    },

    async getActiveRoutePayload(routeId) {
      return getActiveRoutePayload(routeId);
    },

    async getAllActiveRoutesPayload() {
      return getAllActiveRoutesPayload();
    },
  };
}
