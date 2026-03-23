import { generateId } from "./store.js";

const SUPPORTED_ROUTE_IDS = new Set(["A", "B"]);

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function normalizeSupportedRouteId(routeId) {
  const normalized = String(routeId || "")
    .trim()
    .toUpperCase();
  return SUPPORTED_ROUTE_IDS.has(normalized) ? normalized : null;
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  return fallback;
}

function normalizePoint(point, index = 0) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return {
    x,
    y,
    move: index === 0 ? true : normalizeBoolean(point?.move, false),
  };
}

function normalizeArrow(arrow, index = 0) {
  const x = Number(arrow?.x);
  const y = Number(arrow?.y);
  const arcM = Number(arrow?.arc_m ?? arrow?.arcM);
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(arcM)) {
    return null;
  }
  const headingDegRaw = Number(arrow?.heading_deg ?? arrow?.headingDeg);
  const headingDeg = Number.isFinite(headingDegRaw) ? headingDegRaw : 0;
  const passIndexRaw = Number(arrow?.pass_index ?? arrow?.passIndex);
  const passIndex = Number.isFinite(passIndexRaw) ? Math.max(1, Math.round(passIndexRaw)) : 1;
  const lateralOffsetRaw = Number(arrow?.lateral_offset_m ?? arrow?.lateralOffsetM);
  const lateralOffsetM = Number.isFinite(lateralOffsetRaw) ? lateralOffsetRaw : 0;
  const laneKey = String(arrow?.lane_key ?? arrow?.laneKey ?? "free").slice(0, 160);
  const overlapKey = String(arrow?.overlap_key ?? arrow?.overlapKey ?? laneKey).slice(0, 220);

  return {
    id: String(arrow?.id || `arr_${index + 1}`),
    x,
    y,
    arc_m: arcM,
    heading_deg: headingDeg,
    pass_index: passIndex,
    lane_key: laneKey,
    overlap_key: overlapKey,
    lateral_offset_m: lateralOffsetM,
  };
}

export function normalizeAssistedRoutePayload(routeId, payload) {
  if (!payload || typeof payload !== "object") {
    return { error: "assisted_route is required" };
  }

  const normalizedRouteId = normalizeSupportedRouteId(routeId || payload.route_id || payload.routeId);
  if (!normalizedRouteId) {
    return { error: "invalid route_id" };
  }

  const pathRaw = Array.isArray(payload.path) ? payload.path : [];
  if (pathRaw.length < 2) {
    return { error: "assisted_route.path must include at least 2 points" };
  }
  if (pathRaw.length > 10000) {
    return { error: "assisted_route.path exceeds max length (10000)" };
  }
  const path = pathRaw.map((point, index) => normalizePoint(point, index));
  if (path.some((point) => !point)) {
    return { error: "assisted_route.path contains invalid points" };
  }

  const arrowsRaw = Array.isArray(payload.arrows) ? payload.arrows : [];
  if (!arrowsRaw.length) {
    return { error: "assisted_route.arrows must include at least 1 arrow" };
  }
  if (arrowsRaw.length > 5000) {
    return { error: "assisted_route.arrows exceeds max length (5000)" };
  }
  const arrows = arrowsRaw.map((arrow, index) => normalizeArrow(arrow, index));
  if (arrows.some((arrow) => !arrow)) {
    return { error: "assisted_route.arrows contains invalid entries" };
  }

  const totalArcM = Number(payload.total_arc_m ?? payload.totalArcM);
  const computedTotalArcM = arrows.reduce((best, arrow) => Math.max(best, Number(arrow.arc_m) || 0), 0);
  const normalizedTotalArcM = Number.isFinite(totalArcM) && totalArcM > 0 ? totalArcM : computedTotalArcM;
  if (!Number.isFinite(normalizedTotalArcM) || normalizedTotalArcM <= 0) {
    return { error: "assisted_route.total_arc_m must be a positive number" };
  }

  const versionRaw = Number(payload.version);
  const version = Number.isFinite(versionRaw) ? Math.max(1, Math.round(versionRaw)) : 1;
  const recordedAt = String(payload.recorded_at || payload.recordedAt || new Date().toISOString());

  return {
    data: {
      version,
      route_id: normalizedRouteId,
      total_arc_m: normalizedTotalArcM,
      recorded_at: recordedAt,
      path,
      arrows,
    },
  };
}

function assistedMapMetadata(record) {
  const assistedRoute = record?.assisted_route && typeof record.assisted_route === "object" ? record.assisted_route : {};
  const arrows = Array.isArray(assistedRoute.arrows) ? assistedRoute.arrows : [];
  const totalArcRaw = Number(assistedRoute.total_arc_m ?? assistedRoute.totalArcM);
  return {
    assist_id: record.assist_id,
    user_id: record.user_id,
    route_id: record.route_id,
    arrow_count: arrows.length,
    total_arc_m: Number.isFinite(totalArcRaw) ? totalArcRaw : 0,
    recorded_at: assistedRoute.recorded_at || assistedRoute.recordedAt || null,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function assistedStoreKey(userId, routeId) {
  return `${String(userId)}:${String(routeId)}`;
}

function resolveCreatorUserId(store) {
  if (store?.creatorUserId) {
    return store.creatorUserId;
  }
  const creator = Array.isArray(store?.users) ? store.users.find((candidate) => candidate?.is_creator) : null;
  return creator?.user_id || null;
}

export function getAssistedRouteMap(store, user, routeIdRaw) {
  const routeId = normalizeSupportedRouteId(routeIdRaw);
  if (!routeId) {
    return { status: 400, error: "invalid route_id" };
  }
  const creatorUserId = resolveCreatorUserId(store);
  if (!creatorUserId) {
    return { status: 404, error: "assisted route map not found" };
  }
  const key = assistedStoreKey(creatorUserId, routeId);
  const record = store.assistedRouteMaps?.get(key);
  if (!record) {
    return { status: 404, error: "assisted route map not found" };
  }
  return {
    status: 200,
    data: {
      map: assistedMapMetadata(record),
      assisted_route: cloneJson(record.assisted_route),
    },
  };
}

export function saveAssistedRouteMap(store, user, routeIdRaw, payload) {
  if (!user?.is_creator) {
    return { status: 403, error: "creator permissions required" };
  }
  const normalized = normalizeAssistedRoutePayload(routeIdRaw, payload?.assisted_route ?? payload);
  if (normalized.error) {
    return { status: 400, error: normalized.error };
  }

  const routeId = normalized.data.route_id;
  const key = assistedStoreKey(user.user_id, routeId);
  const nowIso = new Date().toISOString();
  const existing = store.assistedRouteMaps?.get(key) || null;
  const record = existing
    ? {
        ...existing,
        assisted_route: normalized.data,
        updated_at: nowIso,
      }
    : {
        assist_id: generateId("assist_map"),
        user_id: user.user_id,
        route_id: routeId,
        assisted_route: normalized.data,
        created_at: nowIso,
        updated_at: nowIso,
      };

  if (!store.assistedRouteMaps) {
    store.assistedRouteMaps = new Map();
  }
  store.assistedRouteMaps.set(key, record);

  return {
    status: existing ? 200 : 201,
    data: {
      map: assistedMapMetadata(record),
      assisted_route: cloneJson(record.assisted_route),
      saved: true,
    },
  };
}

export function listAssistedRouteMaps(store, user, query = {}) {
  if (!user?.is_creator) {
    return { status: 403, error: "creator permissions required" };
  }
  const routeFilter = normalizeSupportedRouteId(query?.route_id || query?.routeId || "");
  const creatorUserId = resolveCreatorUserId(store);
  const records = Array.from(store?.assistedRouteMaps?.values?.() || [])
    .filter((record) => record?.user_id === creatorUserId)
    .filter((record) => !routeFilter || record?.route_id === routeFilter)
    .sort((a, b) => new Date(b?.updated_at || 0).getTime() - new Date(a?.updated_at || 0).getTime());
  return {
    status: 200,
    data: {
      maps: records.map((record) => assistedMapMetadata(record)),
      total: records.length,
    },
  };
}
