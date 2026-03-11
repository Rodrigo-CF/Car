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

function normalizeMapName(name, fallbackName) {
  const normalized = String(name || "").trim();
  return (normalized || fallbackName).slice(0, 120);
}

function nextRouteVersion(store, routeId) {
  return (
    store.maps
      .filter((record) => record.route_id === routeId)
      .reduce((best, current) => Math.max(best, Number(current.version) || 0), 0) + 1
  );
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

function createRouteMapRecord(store, user, payload) {
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

  const version = nextRouteVersion(store, routeId);
  const nowIso = new Date().toISOString();
  const defaultName = `Route ${routeId} v${version}`;
  const record = {
    map_id: generateId("map"),
    route_id: routeId,
    name: normalizeMapName(payload?.name, defaultName),
    version,
    route,
    created_by: user.user_id,
    created_at: nowIso,
    published_at: nowIso,
  };

  store.maps.push(record);
  return { status: 201, data: record };
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

  const created = createRouteMapRecord(store, user, payload);
  if (created.error) {
    return created;
  }
  const record = created.data;
  const nowIso = new Date().toISOString();
  record.published_at = nowIso;
  store.activeRouteMaps[record.route_id] = record.map_id;

  return {
    status: 201,
    data: {
      map: mapMetadata(record),
      route: cloneJson(record.route),
    },
  };
}

export function saveRouteMap(store, user, payload) {
  if (!user?.is_creator) {
    return { status: 403, error: "creator permissions required" };
  }
  const created = createRouteMapRecord(store, user, payload);
  if (created.error) {
    return created;
  }
  const record = created.data;
  return {
    status: 201,
    data: {
      map: mapMetadata(record),
      route: cloneJson(record.route),
    },
  };
}

export function activateRouteMap(store, user, payload) {
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

  const record = store.maps.find(
    (candidate) => candidate.map_id === mapId && (!routeFilter || candidate.route_id === routeFilter),
  );
  if (!record) {
    return { status: 404, error: "map not found" };
  }

  record.published_at = new Date().toISOString();
  store.activeRouteMaps[record.route_id] = record.map_id;
  return {
    status: 200,
    data: {
      map: mapMetadata(record),
      route: cloneJson(record.route),
      activated: true,
    },
  };
}

export function listRouteMaps(store, user, query = {}) {
  if (!user?.is_creator) {
    return { status: 403, error: "creator permissions required" };
  }

  const routeFilterRaw = String(query.route_id || "").trim();
  const routeFilter = routeFilterRaw && routeFilterRaw.toUpperCase() !== "ALL" ? normalizeRouteId(routeFilterRaw) : null;
  if (routeFilterRaw && routeFilterRaw.toUpperCase() !== "ALL" && !routeFilter) {
    return { status: 400, error: "invalid route_id" };
  }

  const q = String(query.q || "").trim().toLowerCase();
  const limit = parsePositiveInteger(query.limit, 50, 1, 200);
  const offset = parsePositiveInteger(query.offset, 0, 0, Number.MAX_SAFE_INTEGER);

  const filtered = [...store.maps]
    .filter((record) => !routeFilter || record.route_id === routeFilter)
    .filter((record) => {
      if (!q) {
        return true;
      }
      const name = String(record.name || "").toLowerCase();
      const mapId = String(record.map_id || "").toLowerCase();
      return name.includes(q) || mapId.includes(q);
    })
    .sort((a, b) => {
      const createdOrder = String(b.created_at || "").localeCompare(String(a.created_at || ""));
      if (createdOrder !== 0) {
        return createdOrder;
      }
      const versionOrder = (Number(b.version) || 0) - (Number(a.version) || 0);
      if (versionOrder !== 0) {
        return versionOrder;
      }
      return String(b.map_id || "").localeCompare(String(a.map_id || ""));
    });

  const total = filtered.length;
  const page = filtered.slice(offset, offset + limit);
  const maps = page.map((record) => ({
    ...mapMetadata(record),
    is_active: store.activeRouteMaps?.[record.route_id] === record.map_id,
  }));

  return {
    status: 200,
    data: {
      maps,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + maps.length < total,
      },
      filters: {
        route_id: routeFilter || "ALL",
        q,
      },
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
