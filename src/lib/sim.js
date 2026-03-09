import { generateId } from "./store.js";
import { resolveRoute } from "./maps.js";

const SIM_ACTIVE_TTL_MS = Math.max(5 * 60 * 1000, Number(process.env.SIM_ACTIVE_TTL_SEC || 900) * 1000);

function rulesForRoute(store, routeId) {
  return store.rules.filter((rule) => rule.routeId === "ALL" || rule.routeId === routeId);
}

function simActiveTimestampMs(session) {
  if (!session) {
    return 0;
  }
  const lastSeen = Number(session.last_seen_at);
  if (Number.isFinite(lastSeen) && lastSeen > 0) {
    return lastSeen;
  }
  const started = Number(session.started_at);
  return Number.isFinite(started) ? started : 0;
}

function cleanupStoreSimActiveSessions(store, ttlMs = SIM_ACTIVE_TTL_MS) {
  const now = Date.now();
  let removed = 0;
  for (const [sessionId, session] of store.simActiveSessions.entries()) {
    if (now - simActiveTimestampMs(session) > ttlMs) {
      store.simActiveSessions.delete(sessionId);
      removed += 1;
    }
  }
  return removed;
}

function closeUserActiveSessions(store, userId) {
  for (const [sessionId, session] of store.simActiveSessions.entries()) {
    if (session.user_id === userId) {
      store.simActiveSessions.delete(sessionId);
    }
  }
}

export function startSimSession(store, user, payload) {
  cleanupStoreSimActiveSessions(store);
  const routeId = String(payload.route_id || "")
    .trim()
    .toUpperCase();
  const activeRoute = resolveRoute(store, routeId);
  if (!routeId || !activeRoute) {
    return { status: 400, error: "invalid route_id" };
  }

  closeUserActiveSessions(store, user.user_id);
  const sessionId = generateId("sim_active");
  const now = Date.now();
  store.simActiveSessions.set(sessionId, {
    session_id: sessionId,
    user_id: user.user_id,
    route_id: routeId,
    events: [],
    started_at: now,
    last_seen_at: now,
  });

  return {
    status: 201,
    data: {
      session_id: sessionId,
      route: activeRoute,
    },
  };
}

export function appendSimEvents(store, user, sessionId, payload) {
  cleanupStoreSimActiveSessions(store);
  const session = store.simActiveSessions.get(sessionId);
  if (!session || session.user_id !== user.user_id) {
    return { status: 404, error: "sim session not found" };
  }

  const events = Array.isArray(payload.events) ? payload.events : [];
  session.events.push(
    ...events.map((event) => ({
      triggerKey: event.triggerKey,
      atMs: Number(event.atMs) || 0,
      meta: event.meta ?? {},
    })),
  );
  session.last_seen_at = Date.now();

  return {
    status: 202,
    data: {
      accepted: events.length,
      total_events: session.events.length,
    },
  };
}

export function finishSimSession(store, user, sessionId, payload) {
  const session = store.simActiveSessions.get(sessionId);
  if (!session || session.user_id !== user.user_id) {
    return { status: 404, error: "sim session not found" };
  }

  const durationSec = Number(payload.duration_sec) > 0 ? Number(payload.duration_sec) : 0;
  const activeRules = rulesForRoute(store, session.route_id);

  let score = 100;
  let criticalFail = false;
  let failReason = null;
  const penalties = [];

  for (const event of session.events) {
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

  store.simSessions.push(record);
  store.simActiveSessions.delete(sessionId);

  return {
    status: 200,
    data: record,
  };
}

export function abandonSimSession(store, user, sessionId) {
  cleanupStoreSimActiveSessions(store);
  const session = store.simActiveSessions.get(sessionId);
  if (!session || session.user_id !== user.user_id) {
    return { status: 404, error: "sim session not found" };
  }
  store.simActiveSessions.delete(sessionId);
  return {
    status: 200,
    data: {
      session_id: sessionId,
      abandoned: true,
    },
  };
}

export function cleanupSimActiveSessions(store, ttlSec) {
  const parsed = Number(ttlSec);
  const ttlMs = Number.isFinite(parsed) && parsed > 0 ? Math.max(5 * 60 * 1000, parsed * 1000) : SIM_ACTIVE_TTL_MS;
  const removed = cleanupStoreSimActiveSessions(store, ttlMs);
  return {
    status: 200,
    data: {
      removed,
      ttl_sec: Math.round(ttlMs / 1000),
    },
  };
}
