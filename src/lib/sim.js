import { generateId } from "./store.js";

function rulesForRoute(store, routeId) {
  return store.rules.filter((rule) => rule.routeId === "ALL" || rule.routeId === routeId);
}

export function startSimSession(store, user, payload) {
  const routeId = payload.route_id;
  if (!routeId || !store.routes[routeId]) {
    return { status: 400, error: "invalid route_id" };
  }

  const sessionId = generateId("sim_active");
  store.simActiveSessions.set(sessionId, {
    session_id: sessionId,
    user_id: user.user_id,
    route_id: routeId,
    events: [],
    started_at: Date.now(),
  });

  return {
    status: 201,
    data: {
      session_id: sessionId,
      route: store.routes[routeId],
    },
  };
}

export function appendSimEvents(store, user, sessionId, payload) {
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
