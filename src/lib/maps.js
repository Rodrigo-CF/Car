import { generateId } from "./store.js";

const SUPPORTED_ROUTE_IDS = new Set(["A", "B"]);

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeRouteId(routeId) {
  const normalized = String(routeId || "")
    .trim()
    .toUpperCase();
  return SUPPORTED_ROUTE_IDS.has(normalized) ? normalized : null;
}

function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

function validateRouteShape(route, routeId) {
  if (!route || typeof route !== "object") {
    return "route is required";
  }
  if (!route.startPose || typeof route.startPose !== "object") {
    return "route.startPose is required";
  }
  if (!isFiniteNumber(route.startPose.x) || !isFiniteNumber(route.startPose.y) || !isFiniteNumber(route.startPose.headingDeg)) {
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

export function resolveRoute(store, routeId) {
  const normalizedRouteId = normalizeRouteId(routeId);
  if (!normalizedRouteId) {
    return null;
  }

  const activeMapId = store.activeRouteMaps?.[normalizedRouteId] ?? null;
  if (activeMapId) {
    const activeRecord = store.maps.find(
      (candidate) => candidate.map_id === activeMapId && candidate.route_id === normalizedRouteId,
    );
    if (activeRecord?.route) {
      return cloneJson(activeRecord.route);
    }
  }

  return store.routes[normalizedRouteId] ? cloneJson(store.routes[normalizedRouteId]) : null;
}

export function publishRouteMap(store, user, payload) {
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

  const version =
    store.maps
      .filter((record) => record.route_id === routeId)
      .reduce((best, current) => Math.max(best, Number(current.version) || 0), 0) + 1;

  const defaultName = `Route ${routeId} v${version}`;
  const providedName = String(payload?.name || "").trim();
  const nowIso = new Date().toISOString();

  const record = {
    map_id: generateId("map"),
    route_id: routeId,
    name: (providedName || defaultName).slice(0, 120),
    version,
    route,
    created_by: user.user_id,
    created_at: nowIso,
    published_at: nowIso,
  };

  store.maps.push(record);
  store.activeRouteMaps[routeId] = record.map_id;

  return {
    status: 201,
    data: {
      map: mapMetadata(record),
      route: cloneJson(record.route),
    },
  };
}

export function getActiveRoutePayload(store, routeId) {
  const normalizedRouteId = normalizeRouteId(routeId);
  if (!normalizedRouteId) {
    return null;
  }

  const route = resolveRoute(store, normalizedRouteId);
  if (!route) {
    return null;
  }

  const activeMapId = store.activeRouteMaps?.[normalizedRouteId] ?? null;
  const mapRecord = activeMapId
    ? store.maps.find((candidate) => candidate.map_id === activeMapId && candidate.route_id === normalizedRouteId)
    : null;

  return {
    route_id: normalizedRouteId,
    source: mapRecord ? "published_map" : "default_mock",
    map: mapRecord ? mapMetadata(mapRecord) : null,
    route,
  };
}

export function getAllActiveRoutesPayload(store) {
  const routes = {};
  for (const routeId of SUPPORTED_ROUTE_IDS) {
    routes[routeId] = getActiveRoutePayload(store, routeId);
  }
  return { routes };
}
