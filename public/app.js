const state = {
  token: null,
  user: null,
  examDraft: null,
  sim: {
    sessionId: null,
    sessionHeartbeatToken: null,
    route: null,
    routePath: [],
    routeDensePath: [],
    routeBounds: null,
    car: null,
    startedAt: 0,
    lastInputAt: 0,
    keepAliveIntervalMs: 30 * 1000,
    inputIdleTimeoutMs: 15 * 60 * 1000,
    idleAbandoning: false,
    inactivityAlertPending: false,
    inactivityAlertShown: false,
    lastKeepAliveAt: 0,
    keepAliveTimer: null,
    camera: "first",
    trafficLightRed: true,
    trafficLightManual: null,
    trafficLightCycleSec: 30,
    correctionCount: 0,
    penaltyPoints: 0,
    lastSpeedSign: 0,
    triggered: new Set(),
    speedOverSince: null,
    insideRoundabout: false,
    lastSignal: null,
    steerVisualAngle: 0,
    wheelRollRad: 0,
    bumpOffset: 0,
    bumpVelocity: 0,
    bumpSupport: 0,
    bumpPitch: 0,
    bumpRoll: 0,
    lastBumpAtMs: 0,
    bumpAxleContacts: {},
    bumpAxleHitAtMs: {},
    stopLineContacts: {},
    three: {
      ready: false,
      failed: false,
      loading: false,
      statusMessage: "",
      lib: null,
      renderer: null,
      scene: null,
      camera: null,
      lights: null,
      routeGroup: null,
      trafficLightRefs: null,
      parkingSlotRefs: [],
      wheelMesh: null,
      wheelSteerRef: null,
      rimRollRefs: [],
      carMarker: null,
      vehicleModelRoot: null,
      vehicleFootprintLocal: null,
      vehicleGlassMeshes: [],
      frontWheelSteerRefs: [],
      driverSeatLocal: null,
      driverForwardSign: 1,
      vehicleYawOffsetRad: 0,
      cockpitRoot: null,
      cockpitModelRoot: null,
      cockpitSource: "procedural",
      modelError: "",
      thirdCameraPos: null,
      thirdCameraLook: null,
      externalCameraMode: null,
      dashDisplayMesh: null,
      dashDisplayTexture: null,
      dashDisplayCanvas: null,
      dashDisplayCtx: null,
      dashDisplayLastText: "",
      dashDisplayTopScale: null,
      dashDisplayMode: "overlay",
      dashDisplayTargetMesh: null,
      dashDisplayTargetName: "",
      remotePlayersGroup: null,
      remotePlayerMarkers: new Map(),
      remoteAfkLabelMaterial: null,
      remoteAfkLabelTexture: null,
    },
  },
  mapper: {
    mode: "idle",
    image: null,
    imageUrl: "",
    imageFit: null,
    scalePointsPx: [],
    metersPerPixel: 0,
    pathPointsPx: [],
    pathNextMove: false,
    checkpointsPx: [],
    pendingCheckpointType: null,
    routeOverrideA: null,
    mapLibrary: [],
    selectedMapId: "",
    libraryRouteFilter: "A",
    librarySearch: "",
    selectedPathIndex: -1,
    selectedCheckpointIndex: -1,
    dragging: null,
    lane3DraftStartIndex: -1,
  },
  multiplayer: {
    configLoaded: false,
    enabled: false,
    url: "",
    anonKey: "",
    lib: null,
    client: null,
    channel: null,
    roomId: "",
    connected: false,
    peers: new Map(),
    lastBroadcastAt: 0,
    broadcastEveryMs: 120,
    heartbeatTimer: null,
    peerTtlMs: 0,
    collisionStaleMs: 0,
    tabHiddenAfkMs: 0,
    inputIdleAfkMs: 0,
  },
  keys: new Set(),
};

const COCKPIT_MODEL_URLS = [
  "/assets/models/cockpit_lhd.glb",
  "/assets/models/cockpit_lhd/scene.gltf",
  "/assets/models/cockpit/scene.gltf",
];

const STEERING_HINT_REGEX = /(steer|steering|volante|manubrio|timon|sw_)/i;
const STEERING_REJECT_REGEX = /(blocker|coll|collision|tire|tyre|rearwheel|frontwheel|wheelcon|rim)/i;
const INTERIOR_HINT_REGEX =
  /(interior|cockpit|dash|dashboard|instrument|cluster|console|panel|seat|steer|volante|pedal|gear|shift|cabin|trim)/i;
const EXTERIOR_HINT_REGEX =
  /(body|exterior|outside|hood|bonnet|bumper|fender|trunk|boot|spoiler|roof|door|mirror|window|glass|headlight|tail|license|plate|tire|tyre|rim)/i;
const BLOCKER_HINT_REGEX = /(blocker|collision|collider|proxy|helper|physics|occluder)/i;
const GLASS_HINT_REGEX = /(glass|window|windshield|windscreen|parabrisas|luna)/i;
const DASH_TARGET_NAME_HINT_REGEX = /(dash|cluster|display|screen|instrument|panel|meter|speed|gauge|hud|text\.009)/i;
const DASH_TARGET_REJECT_REGEX =
  /(wheel|tire|tyre|rim|brake|seat|door|mirror|window|glass|headlight|tail|lamp|bumper|hood|roof|trunk|blocker|coll|proxy|helper|armature|bone|empty)/i;
const PROCEDURAL_DASH_DISPLAY = {
  x: 0.03,
  y: 0.03,
  z: -0.689,
  width: 0.32,
  height: 0.118,
  rotationY: 0,
  topScale: 0.8,
};
const MODEL_DASH_DISPLAY = {
  forwardFromWheel: 0.145,
  upFromWheel: 0.155,
  fallbackForwardFromSeat: 0.8,
  fallbackUpFromSeat: -0.07,
  fallbackX: 0.54,
  fallbackY: 1.1,
  width: 0.345,
  height: 0.128,
  topScale: 0.76,
};
const TARGET_OVERLAY_UI_TOP_SCALE = 0.82;
const MAX_RENDER_PIXEL_RATIO = 1.25;
const CANVAS_SYNC_INTERVAL_MS = 240;
const HUD_UPDATE_INTERVAL_ACTIVE_MS = 90;
const HUD_UPDATE_INTERVAL_IDLE_MS = 300;
const MINIMAP_UPDATE_INTERVAL_ACTIVE_MS = 100;
const MINIMAP_UPDATE_INTERVAL_IDLE_MS = 450;
const SIM_KEEPALIVE_INTERVAL_DEFAULT_MS = 30 * 1000;
const SIM_INPUT_IDLE_TIMEOUT_DEFAULT_MS = 15 * 60 * 1000;
const ROUTE_BOUNDS_MARGIN_METERS = 14;
const MULTIPLAYER_PEER_TTL_MS = 30000;
const MULTIPLAYER_COLLISION_STALE_MS = 10000;
const MULTIPLAYER_TAB_HIDDEN_AFK_MS = 10000;
const MULTIPLAYER_INPUT_IDLE_AFK_MS = 3 * 60 * 1000;
const MULTIPLAYER_COLLISION_BUFFER_M = 0.22;
const MULTIPLAYER_SPAWN_LATERAL_SPACING_M = 2.45;
const MULTIPLAYER_SPAWN_LONGITUDINAL_SPACING_M = 3.2;
const MULTIPLAYER_REMOTE_SMOOTH_RATE = 12;
const MULTIPLAYER_REMOTE_HEADING_SMOOTH_RATE = 14;
const MULTIPLAYER_REMOTE_MAX_EXTRAPOLATE_MS = 180;
const MULTIPLAYER_REMOTE_MAX_SPEED_MPS = 24;
const MULTIPLAYER_REMOTE_SNAP_DISTANCE_M = 16;
const MAPPER_STORAGE_KEY = "routeA_override_v1";
const MAPPER_SNAP_CANVAS_PX = 10;
const PARALLEL_PARK_BOX_L_M = 6.2;
const PARALLEL_PARK_BOX_W_M = 2.9;
const ROAD_BASE_WIDTH_M = 8.0;
const ROAD_THREE_LANE_WIDTH_M = 11.4;
const ROAD_EXTRA_LANE_WIDTH_M = ROAD_THREE_LANE_WIDTH_M - ROAD_BASE_WIDTH_M;
const ROAD_SHOULDER_HALF_EXTRA_M = 2.2;
const LANE_ADD_EFFECT_RADIUS_M = 14;
const LANE_PROFILE_TRANSITION_DEFAULT_M = 8;
const LANE_PROFILE_TRANSITION_MIN_M = 1.5;
const LANE_PROFILE_TRANSITION_MAX_M = 20;
const ROAD_RENDER_SMOOTH_ITERATIONS = 1;
const ROAD_RENDER_JOINT_SEGMENTS = 24;
const CAMERA_MODE_CYCLE = ["first", "third", "right", "front", "left", "top"];
const EXTERNAL_CAMERA_MODES = new Set(["third", "right", "front", "left", "top"]);

const CONTROL_KEYS = new Set(["w", "a", "s", "d", " ", "q", "e", "c", "r", "p", "o"]);
const CONTINUOUS_KEYS = new Set(["w", "a", "s", "d", " "]);

const dom = {
  authState: document.querySelector("#auth-state"),
  logoutBtn: document.querySelector("#logout-btn"),
  authGuest: document.querySelector("#auth-guest"),
  authUser: document.querySelector("#auth-user"),
  authFeedback: document.querySelector("#auth-feedback"),
  authUserCopy: document.querySelector("#auth-user-copy"),
  regUsername: document.querySelector("#reg-username"),
  regEmail: document.querySelector("#reg-email"),
  regPassword: document.querySelector("#reg-password"),
  loginEmail: document.querySelector("#login-email"),
  loginPassword: document.querySelector("#login-password"),
  examOutput: document.querySelector("#exam-output"),
  simState: document.querySelector("#sim-state"),
  carState: document.querySelector("#car-state"),
  simOutput: document.querySelector("#sim-output"),
  toggleLightBtn: document.querySelector("#toggle-light"),
  profileOutput: document.querySelector("#profile-output"),
  theoryTableBody: document.querySelector("#theory-table tbody"),
  simTableBody: document.querySelector("#sim-table tbody"),
  routeSelect: document.querySelector("#route-select"),
  multiplayerRoom: document.querySelector("#multiplayer-room"),
  multiplayerJoinBtn: document.querySelector("#multiplayer-join"),
  multiplayerLeaveBtn: document.querySelector("#multiplayer-leave"),
  multiplayerStatus: document.querySelector("#multiplayer-status"),
  glCanvas: document.querySelector("#sim-gl-canvas"),
  canvas: document.querySelector("#sim-canvas"),
  miniMapCanvas: document.querySelector("#mini-map-canvas"),
  simHud: document.querySelector("#sim-hud"),
  hudSpeed: document.querySelector("#hud-speed"),
  hudSignal: document.querySelector("#hud-signal"),
  hudLight: document.querySelector("#hud-light"),
  hudCam: document.querySelector("#hud-cam"),
  hudPenalty: document.querySelector("#hud-penalty"),
  simPenaltyTotal: document.querySelector("#sim-penalty-total"),
  resetPenaltyBtn: document.querySelector("#reset-penalty"),
  simWebglStatus: document.querySelector("#sim-webgl-status"),
  simPenaltyCard: document.querySelector("#sim-penalty-card"),
  simSignalLeft: document.querySelector("#sim-signal-left"),
  simSignalRight: document.querySelector("#sim-signal-right"),
  mapperImageFile: document.querySelector("#mapper-image-file"),
  mapperLaneWidth: document.querySelector("#mapper-lane-width"),
  mapperScaleMode: document.querySelector("#mapper-scale-mode"),
  mapperPathMode: document.querySelector("#mapper-path-mode"),
  mapperNewSegment: document.querySelector("#mapper-new-segment"),
  mapperInsertNode: document.querySelector("#mapper-insert-node"),
  mapperLane3Segment: document.querySelector("#mapper-lane3-segment"),
  mapperLane3Fields: document.querySelector("#mapper-lane3-fields"),
  mapperLane3StartEdge: document.querySelector("#mapper-lane3-start-edge"),
  mapperLane3EndEdge: document.querySelector("#mapper-lane3-end-edge"),
  mapperLane3Transition: document.querySelector("#mapper-lane3-transition"),
  mapperLane3Expansion: document.querySelector("#mapper-lane3-expansion"),
  mapperCheckpointType: document.querySelector("#mapper-checkpoint-type"),
  mapperCheckpointHelp: document.querySelector("#mapper-checkpoint-help"),
  mapperTrafficFields: document.querySelector("#mapper-traffic-fields"),
  mapperTrafficFacing: document.querySelector("#mapper-traffic-facing"),
  mapperLaneFields: document.querySelector("#mapper-lane-fields"),
  mapperParkingFields: document.querySelector("#mapper-parking-fields"),
  mapperLaneSide: document.querySelector("#mapper-lane-side"),
  mapperLaneCount: document.querySelector("#mapper-lane-count"),
  mapperParkingSlots: document.querySelector("#mapper-parking-slots"),
  mapperParkingAngle: document.querySelector("#mapper-parking-angle"),
  mapperEditMode: document.querySelector("#mapper-edit-mode"),
  mapperPlaceCheckpoint: document.querySelector("#mapper-place-checkpoint"),
  mapperDeleteSelected: document.querySelector("#mapper-delete-selected"),
  mapperUndo: document.querySelector("#mapper-undo"),
  mapperClear: document.querySelector("#mapper-clear"),
  mapperApplyRoute: document.querySelector("#mapper-apply-route"),
  mapperMapName: document.querySelector("#mapper-map-name"),
  mapperSaveRoute: document.querySelector("#mapper-save-route"),
  mapperPublishRoute: document.querySelector("#mapper-publish-route"),
  mapperLibraryRouteFilter: document.querySelector("#mapper-library-route-filter"),
  mapperLibrarySearch: document.querySelector("#mapper-library-search"),
  mapperLibraryRefresh: document.querySelector("#mapper-library-refresh"),
  mapperSavedMaps: document.querySelector("#mapper-saved-maps"),
  mapperOpenMap: document.querySelector("#mapper-open-map"),
  mapperActivateMap: document.querySelector("#mapper-activate-map"),
  mapperLibraryStatus: document.querySelector("#mapper-library-status"),
  mapperDownloadJson: document.querySelector("#mapper-download-json"),
  mapperImportJson: document.querySelector("#mapper-import-json"),
  mapperImportJsonFile: document.querySelector("#mapper-import-json-file"),
  mapperPanel: document.querySelector("#mapper-panel"),
  mapperCanvas: document.querySelector("#mapper-canvas"),
  mapperStatus: document.querySelector("#mapper-status"),
  mapperJson: document.querySelector("#mapper-json"),
};

const ctx = dom.canvas.getContext("2d");
const miniCtx = dom.miniMapCanvas.getContext("2d");
const mapperCtx = dom.mapperCanvas.getContext("2d");
let simPenaltyCardTimer = null;

function formatJson(value) {
  return JSON.stringify(value, null, 2);
}

function setMapperStatus(message) {
  dom.mapperStatus.textContent = `Mapper: ${message}`;
}

function hidePenaltyCard() {
  if (!dom.simPenaltyCard) {
    return;
  }
  dom.simPenaltyCard.classList.add("hidden");
  dom.simPenaltyCard.textContent = "";
}

function showPenaltyCard(message, durationMs = 2600) {
  if (!dom.simPenaltyCard) {
    return;
  }
  dom.simPenaltyCard.textContent = message;
  dom.simPenaltyCard.classList.remove("hidden");
  if (simPenaltyCardTimer) {
    clearTimeout(simPenaltyCardTimer);
  }
  simPenaltyCardTimer = setTimeout(() => {
    hidePenaltyCard();
    simPenaltyCardTimer = null;
  }, durationMs);
}

function resetPenaltyPoints() {
  state.sim.penaltyPoints = 0;
  hidePenaltyCard();
  updateHudOverlay();
}

function applyPenalty(points, reasonText = "") {
  const penalty = Math.max(0, Math.round(Number(points) || 0));
  if (!penalty) {
    return;
  }
  state.sim.penaltyPoints += penalty;
  updateHudOverlay();
  if (reasonText) {
    showPenaltyCard(`Perdiste ${penalty} puntos por ${reasonText}`);
  }
}

function mapperCheckpointColor(type) {
  const palette = {
    speed_zone: "#45b6ff",
    traffic_light: "#f34f5f",
    stop_line: "#f5f8ff",
    stop_line_free: "#dce8ff",
    roundabout: "#ff9e3d",
    parking_parallel: "#ffd166",
    parking_diagonal: "#ba68ff",
    speed_bump: "#ff9554",
    lane_add: "#8f9bff",
    lane_profile_3: "#85f0ff",
    start_canopy: "#6ea8ff",
    tree: "#4fc46b",
    guard_tower: "#c8d8ff",
  };
  return palette[type] || "#d4e7f1";
}

function mapperAllowsMultiple(type) {
  return (
    type === "speed_bump" ||
    type === "lane_add" ||
    type === "lane_profile_3" ||
    type === "stop_line" ||
    type === "stop_line_free" ||
    type === "start_canopy" ||
    type === "tree" ||
    type === "guard_tower" ||
    type === "traffic_light"
  );
}

function mapperLaneSelection() {
  const laneCount = Math.max(1, Math.round(Number(dom.mapperLaneCount.value) || 2));
  const side = dom.mapperLaneSide?.value === "right" ? "right" : "left";
  const lane = side === "left" ? 1 : laneCount;
  return { lane, laneCount, side };
}

function mapperDefaultMeta(type) {
  if (type === "speed_zone") {
    return { limitKmh: 30 };
  }
  if (type === "traffic_light") {
    const facing = dom.mapperTrafficFacing.value === "reverse" ? "reverse" : "with_path";
    return { mustStopOnRed: true, facing };
  }
  if (type === "stop_line" || type === "stop_line_free") {
    const { lane, laneCount } = mapperLaneSelection();
    return { lane, laneCount, lineWidthM: 0.26 };
  }
  if (type === "roundabout") {
    return { entry: "west", exit: "east", yieldLeft: true };
  }
  if (type === "parking_parallel") {
    const slots = Math.max(1, Math.round(Number(dom.mapperParkingSlots.value) || 1));
    return { boxL: PARALLEL_PARK_BOX_L_M, boxW: PARALLEL_PARK_BOX_W_M, maxCorrections: 3, slots, slotGapM: 0 };
  }
  if (type === "parking_diagonal") {
    const slots = Math.max(1, Math.round(Number(dom.mapperParkingSlots.value) || 1));
    const angleDeg = Math.max(10, Math.min(80, Math.round(Number(dom.mapperParkingAngle.value) || 45)));
    return { boxL: PARALLEL_PARK_BOX_L_M, boxW: PARALLEL_PARK_BOX_W_M, angleDeg, slots, slotGapM: 0.25 };
  }
  if (type === "speed_bump") {
    const { lane, laneCount } = mapperLaneSelection();
    return { lane, laneCount, bumpHeightM: 0.1 };
  }
  if (type === "lane_add") {
    return { extraLanes: 1 };
  }
  if (type === "lane_profile_3") {
    return {
      startNodeIndex: 0,
      endNodeIndex: 1,
      startAnchorSide: "right",
      endAnchorSide: "right",
      transitionLengthM: LANE_PROFILE_TRANSITION_DEFAULT_M,
      expansionMode: dom.mapperLane3Expansion?.value === "trim_previous" ? "trim_previous" : "node",
    };
  }
  if (type === "start_canopy") {
    return { lengthM: 4.3, heightM: 3.25 };
  }
  if (type === "tree") {
    return { size: 1 };
  }
  if (type === "guard_tower") {
    return { size: 1 };
  }
  return {};
}

function mapperCheckpointPrefix(type) {
  if (type === "speed_zone") {
    return "A_SP";
  }
  if (type === "traffic_light") {
    return "A_TL";
  }
  if (type === "stop_line") {
    return "A_SL";
  }
  if (type === "stop_line_free") {
    return "A_SLF";
  }
  if (type === "roundabout") {
    return "A_RB";
  }
  if (type === "parking_parallel") {
    return "A_PK_PAR";
  }
  if (type === "parking_diagonal") {
    return "A_PK_DIA";
  }
  if (type === "speed_bump") {
    return "A_BP";
  }
  if (type === "lane_add") {
    return "A_LX";
  }
  if (type === "lane_profile_3") {
    return "A_L3";
  }
  if (type === "start_canopy") {
    return "A_SC";
  }
  if (type === "tree") {
    return "A_TR";
  }
  if (type === "guard_tower") {
    return "A_GT";
  }
  return "A_CP";
}

function mapperCheckpointId(type, checkpoints = state.mapper.checkpointsPx) {
  const prefix = mapperCheckpointPrefix(type);
  const existingIds = new Set(
    checkpoints
      .map((cp) => String(cp?.id || ""))
      .filter((id) => id.length > 0),
  );
  const typedIds = checkpoints
    .filter((cp) => cp.type === type)
    .map((cp) => String(cp?.id || ""));
  let maxSequence = 0;
  for (const id of typedIds) {
    const match = id.match(new RegExp(`^${prefix}_(\\d+)$`));
    if (match) {
      maxSequence = Math.max(maxSequence, Number(match[1]) || 0);
    }
  }
  const existing = typedIds.length;
  let sequence = Math.max(existing + 1, maxSequence + 1);

  if (!mapperAllowsMultiple(type) || type === "parking_parallel" || type === "parking_diagonal") {
    if (type === "parking_parallel") {
      return "A_PK_PAR";
    }
    if (type === "parking_diagonal") {
      return "A_PK_DIA";
    }
    return `${prefix}_01`;
  }

  let candidate = `${prefix}_${String(sequence).padStart(2, "0")}`;
  while (existingIds.has(candidate)) {
    sequence += 1;
    candidate = `${prefix}_${String(sequence).padStart(2, "0")}`;
  }
  return candidate;
}

function sanitizeMapperRoute(route) {
  if (!route || typeof route !== "object") {
    throw new Error("Invalid route JSON.");
  }
  if (!Array.isArray(route.path) || route.path.length < 2) {
    throw new Error("Route JSON must include path with at least 2 points.");
  }

  const mapperMeta = route.mapperMeta && typeof route.mapperMeta === "object" ? route.mapperMeta : null;

  return {
    routeId: "A",
    unit: "meters",
    startPose: {
      x: Number(route.startPose?.x || 0),
      y: Number(route.startPose?.y || 0),
      headingDeg: Number(route.startPose?.headingDeg || 0),
    },
    path: route.path.map((p) => ({ x: Number(p.x), y: Number(p.y), move: Boolean(p.move) })),
    checkpoints: Array.isArray(route.checkpoints)
      ? route.checkpoints.map((cp, idx) => ({
          id: cp.id || `A_CP_${String(idx + 1).padStart(2, "0")}`,
          type: cp.type || "speed_zone",
          x: Number(cp.x || 0),
          y: Number(cp.y || 0),
          meta: cp.meta && typeof cp.meta === "object" ? cp.meta : {},
        }))
      : [],
    mapperMeta: mapperMeta
      ? {
          version: Number(mapperMeta.version) || 1,
          metersPerPixel: Number(mapperMeta.metersPerPixel) || 0,
          originPx: mapperMeta.originPx && typeof mapperMeta.originPx === "object"
            ? { x: Number(mapperMeta.originPx.x) || 0, y: Number(mapperMeta.originPx.y) || 0 }
            : null,
          imageSize: mapperMeta.imageSize && typeof mapperMeta.imageSize === "object"
            ? {
                width: Number(mapperMeta.imageSize.width) || 0,
                height: Number(mapperMeta.imageSize.height) || 0,
              }
            : null,
          pathPointsPx: Array.isArray(mapperMeta.pathPointsPx)
            ? mapperMeta.pathPointsPx.map((point, idx) => ({
                x: Number(point.x) || 0,
                y: Number(point.y) || 0,
                move: idx === 0 ? true : Boolean(point.move),
              }))
            : [],
          checkpointsPx: Array.isArray(mapperMeta.checkpointsPx)
            ? mapperMeta.checkpointsPx.map((cp, idx) => ({
                id: String(cp.id || `A_CP_${String(idx + 1).padStart(2, "0")}`),
                type: String(cp.type || "speed_zone"),
                x: Number(cp.x) || 0,
                y: Number(cp.y) || 0,
                meta: cp.meta && typeof cp.meta === "object" ? cp.meta : {},
              }))
            : [],
        }
      : null,
  };
}

function persistMapperRouteOverride() {
  try {
    if (state.mapper.routeOverrideA) {
      localStorage.setItem(MAPPER_STORAGE_KEY, JSON.stringify(state.mapper.routeOverrideA));
    } else {
      localStorage.removeItem(MAPPER_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

function loadPersistedMapperRouteOverride() {
  try {
    const raw = localStorage.getItem(MAPPER_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    const route = sanitizeMapperRoute(parsed);
    loadRouteIntoMapperEditor(route);
    setMapperStatus(
      `loaded saved Route A override (${route.path.length} points). Start session to use it.`,
    );
  } catch {
    localStorage.removeItem(MAPPER_STORAGE_KEY);
  }
}

function mapperRound(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function mapperBuildRouteAFromCanvas() {
  if (!Number.isFinite(state.mapper.metersPerPixel) || state.mapper.metersPerPixel <= 0) {
    throw new Error("Set scale first (click two points over a known distance).");
  }
  if (state.mapper.pathPointsPx.length < 2) {
    throw new Error("Trace at least 2 route points.");
  }

  const origin = state.mapper.pathPointsPx[0];
  const toWorld = (p) => ({
    x: mapperRound((p.x - origin.x) * state.mapper.metersPerPixel),
    y: mapperRound((origin.y - p.y) * state.mapper.metersPerPixel),
  });

  const path = state.mapper.pathPointsPx.map((p) => ({
    ...toWorld(p),
    move: Boolean(p.move),
  }));

  const laneProfileValidation = mapperValidateLaneProfile3Ranges(state.mapper.checkpointsPx, state.mapper.pathPointsPx);
  if (!laneProfileValidation.ok) {
    throw new Error(laneProfileValidation.message);
  }

  const startIndex = path.findIndex((point) => !Number.isNaN(point.x) && !Number.isNaN(point.y));
  const start = path[Math.max(0, startIndex)];
  let nextIndex = Math.max(0, startIndex) + 1;
  while (nextIndex < path.length && path[nextIndex].move) {
    nextIndex += 1;
  }
  const next = path[Math.min(path.length - 1, nextIndex)];
  if (!next || next === start) {
    throw new Error("Add at least one connected segment to define start direction.");
  }
  const headingDeg = normalizeHeading((Math.atan2(next.y - start.y, next.x - start.x) * 180) / Math.PI);

  const inferParkingPlacement = (worldPoint, preferredHeadingDeg = null, preferredSegmentIndex = null) => {
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    const preferredHeading = Number.isFinite(preferredHeadingDeg) ? toRadians(preferredHeadingDeg) : null;
    const preferredSegIdx = Number.isFinite(preferredSegmentIndex) ? Math.round(preferredSegmentIndex) : null;

    const evaluateSegment = (i) => {
      const a = path[i];
      const b = path[i + 1];
      // `move` marks the start of a sub-path at point `b`, so only skip when `b.move` is true.
      if (!a || !b || b.move) {
        return null;
      }

      const abx = b.x - a.x;
      const aby = b.y - a.y;
      const abLenSq = abx * abx + aby * aby;
      if (abLenSq < 1e-6) {
        return null;
      }

      const apx = worldPoint.x - a.x;
      const apy = worldPoint.y - a.y;
      const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
      const qx = a.x + abx * t;
      const qy = a.y + aby * t;
      const distSq = (worldPoint.x - qx) ** 2 + (worldPoint.y - qy) ** 2;
      const heading = Math.atan2(aby, abx);
      let score = distSq;
      if (Number.isFinite(preferredHeading)) {
        const delta = normalizeHeadingDeltaRad(heading, preferredHeading);
        const headingPenaltyM = delta * 6;
        score += headingPenaltyM * headingPenaltyM;
      }
      return { i, heading, qx, qy, distSq, score };
    };

    for (let i = 0; i < path.length - 1; i += 1) {
      const candidate = evaluateSegment(i);
      if (!candidate) {
        continue;
      }
      if (candidate.score < bestScore) {
        bestScore = candidate.score;
        best = candidate;
      }
    }

    if (preferredSegIdx != null && preferredSegIdx >= 0 && preferredSegIdx < path.length - 1) {
      const preferredCandidate = evaluateSegment(preferredSegIdx);
      // At intersections, keep the user-selected path segment when still reasonably close.
      if (preferredCandidate && preferredCandidate.distSq <= 64) {
        best = preferredCandidate;
      }
    }

    if (!best) {
      return {
        headingRad: preferredHeading || 0,
        sideSign: 0,
        snappedX: worldPoint.x,
        snappedY: worldPoint.y,
      };
    }
    const right = { x: Math.sin(best.heading), y: -Math.cos(best.heading) };
    const lateral = (worldPoint.x - best.qx) * right.x + (worldPoint.y - best.qy) * right.y;
    return {
      headingRad: best.heading,
      sideSign: Math.sign(lateral) || 0,
      snappedX: best.qx,
      snappedY: best.qy,
      segmentIndex: best.i,
    };
  };

  const checkpoints = state.mapper.checkpointsPx.map((cp) => {
    const world = toWorld(cp);
    const meta = cp.meta && typeof cp.meta === "object" ? { ...cp.meta } : {};
    let cpX = world.x;
    let cpY = world.y;

    if (cp.type === "lane_profile_3") {
      const normalized = mapperNormalizeLaneProfile3Meta(meta, state.mapper.pathPointsPx);
      if (!normalized) {
        throw new Error(`Tramo 3 carriles invalido en ${cp.id || "A_L3"}: revisa nodos inicio/fin.`);
      }
      const startNode = path[normalized.startNodeIndex];
      const endNode = path[normalized.endNodeIndex];
      if (!startNode || !endNode) {
        throw new Error(`Tramo 3 carriles invalido en ${cp.id || "A_L3"}: nodos fuera de rango.`);
      }
      cpX = mapperRound((startNode.x + endNode.x) * 0.5, 3);
      cpY = mapperRound((startNode.y + endNode.y) * 0.5, 3);
      meta.startNodeIndex = normalized.startNodeIndex;
      meta.endNodeIndex = normalized.endNodeIndex;
      meta.startSegmentIndex = normalized.startSegmentIndex;
      meta.endSegmentIndex = normalized.endSegmentIndex;
      meta.startAnchorSide = normalized.startAnchorSide;
      meta.endAnchorSide = normalized.endAnchorSide;
      meta.transitionLengthM = mapperRound(normalized.transitionLengthM, 2);
    }

    if (cp.type === "parking_parallel" || cp.type === "parking_diagonal") {
      const placement = inferParkingPlacement(world, Number(meta.headingDeg));
      cpX = placement.snappedX;
      cpY = placement.snappedY;
      if (placement.sideSign) {
        meta.sideSign = placement.sideSign;
      }
      meta.boxL = PARALLEL_PARK_BOX_L_M;
      meta.boxW = PARALLEL_PARK_BOX_W_M;
      if (cp.type === "parking_parallel") {
        meta.slotGapM = 0;
      }
    }
    if (cp.type === "traffic_light") {
      const preferredSeg = Number.isFinite(meta.snapSegmentIndex) ? Number(meta.snapSegmentIndex) : null;
      const preferredHeading = preferredSeg != null ? Number(meta.headingDeg) : null;
      const placement = inferParkingPlacement(world, preferredHeading, preferredSeg);
      cpX = placement.snappedX;
      cpY = placement.snappedY;
      if (Number.isFinite(placement.headingRad)) {
        meta.headingDeg = mapperRound((placement.headingRad * 180) / Math.PI, 1);
      }
      meta.sideSign = placement.sideSign || Math.sign(Number(meta.sideSign) || 0) || 1;
      meta.facing = meta.facing === "reverse" ? "reverse" : "with_path";
      if (Number.isFinite(placement.segmentIndex)) {
        meta.snapSegmentIndex = placement.segmentIndex;
      }
    }
    if (cp.type === "guard_tower") {
      const preferredSeg = Number.isFinite(meta.snapSegmentIndex) ? Number(meta.snapSegmentIndex) : null;
      const preferredHeading = preferredSeg != null ? Number(meta.headingDeg) : null;
      const placement = inferParkingPlacement(world, preferredHeading, preferredSeg);
      cpX = placement.snappedX;
      cpY = placement.snappedY;
      if (Number.isFinite(placement.headingRad)) {
        meta.headingDeg = mapperRound((placement.headingRad * 180) / Math.PI, 1);
      }
      meta.sideSign = placement.sideSign || Math.sign(Number(meta.sideSign) || 0) || 1;
      if (Number.isFinite(placement.segmentIndex)) {
        meta.snapSegmentIndex = placement.segmentIndex;
      }
    }
    if (cp.type === "start_canopy") {
      const preferredSeg = Number.isFinite(meta.snapSegmentIndex) ? Number(meta.snapSegmentIndex) : null;
      const preferredHeading = preferredSeg != null ? Number(meta.headingDeg) : null;
      const placement = inferParkingPlacement(world, preferredHeading, preferredSeg);
      cpX = placement.snappedX;
      cpY = placement.snappedY;
      if (Number.isFinite(placement.headingRad)) {
        meta.headingDeg = mapperRound((placement.headingRad * 180) / Math.PI, 1);
      }
      if (Number.isFinite(placement.segmentIndex)) {
        meta.snapSegmentIndex = placement.segmentIndex;
      }
      let canopyLength = Number(meta.lengthM);
      if (!Number.isFinite(canopyLength)) {
        canopyLength = 4.3;
      } else if (canopyLength > 7.8) {
        // Backward-compatible shrink for old maps saved with the previous long default.
        canopyLength *= 0.5;
      }
      meta.lengthM = Math.max(2.6, Math.min(7.75, canopyLength));
      meta.heightM = Math.max(2.3, Math.min(5.2, Number(meta.heightM) || 3.25));
    }
    if (cp.type === "lane_add") {
      const preferredSeg = Number.isFinite(meta.snapSegmentIndex) ? Number(meta.snapSegmentIndex) : null;
      const preferredHeading = preferredSeg != null ? Number(meta.headingDeg) : null;
      const placement = inferParkingPlacement(world, preferredHeading, preferredSeg);
      cpX = placement.snappedX;
      cpY = placement.snappedY;
      if (Number.isFinite(placement.headingRad)) {
        meta.headingDeg = mapperRound((placement.headingRad * 180) / Math.PI, 1);
      }
      meta.sideSign = placement.sideSign || Math.sign(Number(meta.sideSign) || 0) || 1;
      if (Number.isFinite(placement.segmentIndex)) {
        meta.snapSegmentIndex = placement.segmentIndex;
      }
      meta.extraLanes = Math.max(1, Math.min(2, Math.round(Number(meta.extraLanes) || 1)));
    }
    if (cp.type === "speed_bump" || cp.type === "stop_line" || cp.type === "stop_line_free") {
      const preferredSeg = Number.isFinite(meta.snapSegmentIndex) ? Number(meta.snapSegmentIndex) : null;
      const preferredHeading = preferredSeg != null ? Number(meta.headingDeg) : null;
      const placement = inferParkingPlacement(world, preferredHeading, preferredSeg);
      cpX = placement.snappedX;
      cpY = placement.snappedY;
      if (Number.isFinite(placement.headingRad)) {
        meta.headingDeg = mapperRound((placement.headingRad * 180) / Math.PI, 1);
      }
      if (Number.isFinite(placement.segmentIndex)) {
        meta.snapSegmentIndex = placement.segmentIndex;
      }
      const lane = Math.max(1, Math.round(Number(meta.lane) || 1));
      const laneCount = Math.max(lane, Math.round(Number(meta.laneCount) || 2));
      meta.lane = lane;
      meta.laneCount = laneCount;
      if (cp.type === "stop_line" || cp.type === "stop_line_free") {
        meta.lineWidthM = Math.max(0.1, Math.min(0.8, Number(meta.lineWidthM) || 0.26));
      }
    }
    return {
      id: cp.id,
      type: cp.type,
      x: cpX,
      y: cpY,
      meta,
    };
  });

  const trafficLights = checkpoints.filter((cp) => cp.type === "traffic_light");
  const stopLines = checkpoints.filter((cp) => cp.type === "stop_line");
  if (trafficLights.length > 0 && stopLines.length === 0) {
    throw new Error("Cada semaforo requiere una linea de pare (Stop Line). Agrega al menos una.");
  }
  if (trafficLights.length > 0 && stopLines.length > 0) {
    const maxAssociationDistanceM = 18;
    const stopLineExpectedApproachHeading = (stopLine) => {
      const laneCount = Math.max(1, Math.round(Number(stopLine.meta?.laneCount) || 2));
      const lane = Math.max(1, Math.min(laneCount, Math.round(Number(stopLine.meta?.lane) || 1)));
      const heading = Number.isFinite(Number(stopLine.meta?.headingDeg))
        ? toRadians(Number(stopLine.meta.headingDeg))
        : 0;
      const withPath = lane - 0.5 >= laneCount / 2;
      return withPath ? heading : heading + Math.PI;
    };
    const trafficLightControlledApproachHeading = (trafficLight) => {
      const heading = Number.isFinite(Number(trafficLight.meta?.headingDeg))
        ? toRadians(Number(trafficLight.meta.headingDeg))
        : 0;
      const facing = trafficLight.meta?.facing === "reverse" ? "reverse" : "with_path";
      const signalHeading = facing === "reverse" ? heading + Math.PI : heading;
      return signalHeading + Math.PI;
    };
    for (const stopLine of stopLines) {
      let best = null;
      const expectedHeading = stopLineExpectedApproachHeading(stopLine);
      for (const trafficLight of trafficLights) {
        const dist = Math.hypot(stopLine.x - trafficLight.x, stopLine.y - trafficLight.y);
        const controlledApproach = trafficLightControlledApproachHeading(trafficLight);
        const delta = normalizeHeadingDeltaRad(expectedHeading, controlledApproach);
        const headingPenaltyM = delta * 10;
        const score = dist * dist + headingPenaltyM * headingPenaltyM;
        if (!best || score < best.score) {
          best = { trafficLight, dist, delta, score };
        }
      }
      if (!best || best.dist > maxAssociationDistanceM) {
        throw new Error(`La linea de pare ${stopLine.id} debe estar cerca de un semaforo.`);
      }
      stopLine.meta.trafficLightId = best.trafficLight.id;
    }
    for (const trafficLight of trafficLights) {
      const hasLinkedStopLine = stopLines.some((stopLine) => stopLine.meta.trafficLightId === trafficLight.id);
      if (!hasLinkedStopLine) {
        throw new Error(`El semaforo ${trafficLight.id} necesita una linea de pare cercana.`);
      }
    }
  }

  return {
    routeId: "A",
    unit: "meters",
    startPose: {
      x: start.x,
      y: start.y,
      headingDeg: mapperRound(headingDeg, 1),
    },
    path,
    checkpoints,
    mapperMeta: {
      version: 1,
      metersPerPixel: mapperRound(state.mapper.metersPerPixel, 6),
      originPx: { x: mapperRound(origin.x, 3), y: mapperRound(origin.y, 3) },
      imageSize: state.mapper.image ? { width: state.mapper.image.width, height: state.mapper.image.height } : null,
      pathPointsPx: state.mapper.pathPointsPx.map((p, index) => ({
        x: mapperRound(p.x, 3),
        y: mapperRound(p.y, 3),
        move: index === 0 ? true : Boolean(p.move),
      })),
      checkpointsPx: state.mapper.checkpointsPx.map((cp) => ({
        id: cp.id,
        type: cp.type,
        x: mapperRound(cp.x, 3),
        y: mapperRound(cp.y, 3),
        meta: cp.meta && typeof cp.meta === "object" ? { ...cp.meta } : {},
      })),
    },
  };
}

function mapperCanvasToImagePoint(event) {
  const fit = state.mapper.imageFit;
  if (!fit) {
    return null;
  }

  const rect = dom.mapperCanvas.getBoundingClientRect();
  const cx = ((event.clientX - rect.left) / Math.max(1, rect.width)) * dom.mapperCanvas.width;
  const cy = ((event.clientY - rect.top) / Math.max(1, rect.height)) * dom.mapperCanvas.height;

  if (cx < fit.drawX || cy < fit.drawY || cx > fit.drawX + fit.drawW || cy > fit.drawY + fit.drawH) {
    return null;
  }

  return {
    x: fit.offsetX + (cx - fit.drawX) / fit.scale,
    y: fit.offsetY + (cy - fit.drawY) / fit.scale,
  };
}

function mapperImageToCanvasPoint(point) {
  const fit = state.mapper.imageFit;
  if (!fit) {
    return null;
  }
  return {
    x: fit.drawX + (point.x - fit.offsetX) * fit.scale,
    y: fit.drawY + (point.y - fit.offsetY) * fit.scale,
  };
}

function computeMapperVirtualFit(canvasWidth, canvasHeight) {
  const allPoints = [
    ...state.mapper.pathPointsPx,
    ...state.mapper.checkpointsPx,
    ...state.mapper.scalePointsPx,
  ].filter((point) => Number.isFinite(point?.x) && Number.isFinite(point?.y));

  if (!allPoints.length) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const point of allPoints) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  const dataPad = 20;
  const dataW = Math.max(10, maxX - minX + dataPad * 2);
  const dataH = Math.max(10, maxY - minY + dataPad * 2);
  const viewportPad = 18;
  const availableW = Math.max(20, canvasWidth - viewportPad * 2);
  const availableH = Math.max(20, canvasHeight - viewportPad * 2);
  const scale = Math.min(availableW / dataW, availableH / dataH);
  const drawW = dataW * scale;
  const drawH = dataH * scale;
  const drawX = (canvasWidth - drawW) / 2;
  const drawY = (canvasHeight - drawH) / 2;

  return {
    drawX,
    drawY,
    drawW,
    drawH,
    scale,
    offsetX: minX - dataPad,
    offsetY: minY - dataPad,
    virtual: true,
  };
}

function mapperFindSnapPoint(imagePoint) {
  if (!state.mapper.pathPointsPx.length || !state.mapper.imageFit) {
    return null;
  }

  const fit = state.mapper.imageFit;
  const snapRadiusImg = MAPPER_SNAP_CANVAS_PX / Math.max(0.001, fit.scale);
  let best = null;
  let bestDist = snapRadiusImg;

  for (let i = 0; i < state.mapper.pathPointsPx.length; i += 1) {
    const point = state.mapper.pathPointsPx[i];
    const dist = Math.hypot(imagePoint.x - point.x, imagePoint.y - point.y);
    if (dist <= bestDist) {
      bestDist = dist;
      best = { x: point.x, y: point.y, index: i };
    }
  }

  return best;
}

function mapperHeadingDegAtImagePoint(imagePoint) {
  if (!imagePoint || state.mapper.pathPointsPx.length < 2) {
    return null;
  }

  const frame = mapperFrameAtImagePoint(imagePoint);
  return frame ? frame.headingDeg : null;
}

function mapperFrameAtImagePoint(imagePoint) {
  if (!imagePoint || state.mapper.pathPointsPx.length < 2) {
    return null;
  }

  let best = null;
  let bestDistSq = Number.POSITIVE_INFINITY;

  for (let i = 0; i < state.mapper.pathPointsPx.length - 1; i += 1) {
    const a = state.mapper.pathPointsPx[i];
    const b = state.mapper.pathPointsPx[i + 1];
    if (!a || !b || b.move) {
      continue;
    }

    // Mapper world space uses Y-up (image Y is flipped).
    const ax = a.x;
    const ay = -a.y;
    const bx = b.x;
    const by = -b.y;
    const px = imagePoint.x;
    const py = -imagePoint.y;
    const abx = bx - ax;
    const aby = by - ay;
    const abLenSq = abx * abx + aby * aby;
    if (abLenSq < 1e-6) {
      continue;
    }

    const apx = px - ax;
    const apy = py - ay;
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
    const qx = ax + abx * t;
    const qy = ay + aby * t;
    const distSq = (px - qx) ** 2 + (py - qy) ** 2;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = { abx, aby, qx, qy, px, py, segmentIndex: i };
    }
  }

  if (!best) {
    return null;
  }

  if (Math.hypot(best.abx, best.aby) < 1e-5) {
    return null;
  }

  const headingRad = Math.atan2(best.aby, best.abx);
  const right = { x: Math.sin(headingRad), y: -Math.cos(headingRad) };
  const lateral = (best.px - best.qx) * right.x + (best.py - best.qy) * right.y;

  return {
    headingDeg: normalizeHeading((headingRad * 180) / Math.PI),
    headingRad,
    lateral,
    sideSign: Math.sign(lateral) || 0,
    segmentIndex: Number.isFinite(best.segmentIndex) ? best.segmentIndex : null,
    snappedX: best.qx,
    snappedY: -best.qy,
  };
}

function clearMapperSelection() {
  state.mapper.selectedPathIndex = -1;
  state.mapper.selectedCheckpointIndex = -1;
}

function mapperSelectedRef() {
  if (state.mapper.selectedCheckpointIndex >= 0) {
    return { kind: "checkpoint", index: state.mapper.selectedCheckpointIndex };
  }
  if (state.mapper.selectedPathIndex >= 0) {
    return { kind: "path", index: state.mapper.selectedPathIndex };
  }
  return null;
}

function mapperHitTest(imagePoint) {
  if (!imagePoint || !state.mapper.imageFit) {
    return null;
  }
  const fit = state.mapper.imageFit;
  const radius = MAPPER_SNAP_CANVAS_PX / Math.max(0.001, fit.scale);
  let best = null;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = 0; i < state.mapper.checkpointsPx.length; i += 1) {
    const cp = state.mapper.checkpointsPx[i];
    const dist = Math.hypot(imagePoint.x - cp.x, imagePoint.y - cp.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = { kind: "checkpoint", index: i };
    }
  }
  for (let i = 0; i < state.mapper.pathPointsPx.length; i += 1) {
    const point = state.mapper.pathPointsPx[i];
    const dist = Math.hypot(imagePoint.x - point.x, imagePoint.y - point.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = { kind: "path", index: i };
    }
  }

  return bestDist <= radius ? best : null;
}

function mapperHitPathNode(imagePoint) {
  if (!imagePoint || !state.mapper.imageFit || !state.mapper.pathPointsPx.length) {
    return -1;
  }
  const fit = state.mapper.imageFit;
  const radius = MAPPER_SNAP_CANVAS_PX / Math.max(0.001, fit.scale);
  let bestIndex = -1;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < state.mapper.pathPointsPx.length; i += 1) {
    const point = state.mapper.pathPointsPx[i];
    if (!point) {
      continue;
    }
    const dist = Math.hypot(imagePoint.x - point.x, imagePoint.y - point.y);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }
  return bestDist <= radius ? bestIndex : -1;
}

function mapperPathSubpathStartIndex(nodeIndex, points = state.mapper.pathPointsPx) {
  let start = Math.max(0, Math.min(points.length - 1, Number(nodeIndex) || 0));
  while (start > 0 && !points[start].move) {
    start -= 1;
  }
  return start;
}

function mapperNormalizeLaneProfile3Meta(meta, points = state.mapper.pathPointsPx) {
  if (!meta || !Array.isArray(points) || points.length < 2) {
    return null;
  }
  let startNodeIndex = Math.round(Number(meta.startNodeIndex));
  let endNodeIndex = Math.round(Number(meta.endNodeIndex));
  if (!Number.isFinite(startNodeIndex) || !Number.isFinite(endNodeIndex)) {
    return null;
  }

  startNodeIndex = Math.max(0, Math.min(points.length - 1, startNodeIndex));
  endNodeIndex = Math.max(0, Math.min(points.length - 1, endNodeIndex));
  let startAnchorSide = meta.startAnchorSide === "left" ? "left" : "right";
  let endAnchorSide = meta.endAnchorSide === "left" ? "left" : "right";
  if (endNodeIndex < startNodeIndex) {
    [startNodeIndex, endNodeIndex] = [endNodeIndex, startNodeIndex];
    [startAnchorSide, endAnchorSide] = [endAnchorSide, startAnchorSide];
  }

  if (endNodeIndex - startNodeIndex < 1) {
    return null;
  }

  for (let i = startNodeIndex + 1; i <= endNodeIndex; i += 1) {
    if (points[i]?.move) {
      return null;
    }
  }

  const transitionLengthM = Math.max(
    LANE_PROFILE_TRANSITION_MIN_M,
    Math.min(LANE_PROFILE_TRANSITION_MAX_M, Number(meta.transitionLengthM) || LANE_PROFILE_TRANSITION_DEFAULT_M),
  );
  const expansionMode = meta.expansionMode === "trim_previous" ? "trim_previous" : "node";
  const startSegmentIndex = startNodeIndex;
  const endSegmentIndex = endNodeIndex - 1;
  return {
    startNodeIndex,
    endNodeIndex,
    startSegmentIndex,
    endSegmentIndex,
    startAnchorSide,
    endAnchorSide,
    transitionLengthM,
    expansionMode,
    subpathStartIndex: mapperPathSubpathStartIndex(startNodeIndex, points),
  };
}

function mapperRefreshLaneProfile3Checkpoint(checkpoint, points = state.mapper.pathPointsPx) {
  if (!checkpoint || checkpoint.type !== "lane_profile_3") {
    return false;
  }
  const normalized = mapperNormalizeLaneProfile3Meta(checkpoint.meta, points);
  if (!normalized) {
    return false;
  }
  checkpoint.meta = {
    ...(checkpoint.meta && typeof checkpoint.meta === "object" ? checkpoint.meta : {}),
    ...normalized,
  };
  const a = points[normalized.startNodeIndex];
  const b = points[normalized.endNodeIndex];
  checkpoint.x = (Number(a?.x) + Number(b?.x)) * 0.5;
  checkpoint.y = (Number(a?.y) + Number(b?.y)) * 0.5;
  return true;
}

function mapperValidateLaneProfile3Ranges(checkpoints = state.mapper.checkpointsPx, points = state.mapper.pathPointsPx) {
  const profiles = [];
  for (let i = 0; i < checkpoints.length; i += 1) {
    const checkpoint = checkpoints[i];
    if (!checkpoint || checkpoint.type !== "lane_profile_3") {
      continue;
    }
    const normalized = mapperNormalizeLaneProfile3Meta(checkpoint.meta, points);
    if (!normalized) {
      return {
        ok: false,
        message: `El tramo ${checkpoint.id || "3L"} es invalido: revisa nodos inicio/fin y continuidad del path.`,
      };
    }
    profiles.push({ index: i, id: checkpoint.id || `A_L3_${i + 1}`, ...normalized });
  }

  for (let i = 0; i < profiles.length; i += 1) {
    const a = profiles[i];
    for (let j = i + 1; j < profiles.length; j += 1) {
      const b = profiles[j];
      if (a.subpathStartIndex !== b.subpathStartIndex) {
        continue;
      }
      const overlap = !(a.endSegmentIndex < b.startSegmentIndex || b.endSegmentIndex < a.startSegmentIndex);
      if (overlap) {
        return {
          ok: false,
          message: `Los tramos 3L ${a.id} y ${b.id} se solapan en el mismo subpath.`,
        };
      }
    }
  }

  return { ok: true, profiles };
}

function mapperReindexLaneProfilesAfterInsert(insertIndex) {
  for (const checkpoint of state.mapper.checkpointsPx) {
    if (!checkpoint || checkpoint.type !== "lane_profile_3") {
      continue;
    }
    const meta = checkpoint.meta && typeof checkpoint.meta === "object" ? checkpoint.meta : {};
    let startNodeIndex = Math.round(Number(meta.startNodeIndex));
    let endNodeIndex = Math.round(Number(meta.endNodeIndex));
    if (!Number.isFinite(startNodeIndex) || !Number.isFinite(endNodeIndex)) {
      continue;
    }
    if (insertIndex <= startNodeIndex) {
      startNodeIndex += 1;
      endNodeIndex += 1;
    } else if (insertIndex > startNodeIndex && insertIndex < endNodeIndex) {
      endNodeIndex += 1;
    }
    checkpoint.meta = { ...meta, startNodeIndex, endNodeIndex };
    mapperRefreshLaneProfile3Checkpoint(checkpoint);
  }
}

function mapperReindexLaneProfilesAfterDelete(deleteIndex) {
  if (!state.mapper.checkpointsPx.length) {
    return 0;
  }
  const nextCheckpoints = [];
  let removedCount = 0;
  for (const checkpoint of state.mapper.checkpointsPx) {
    if (!checkpoint || checkpoint.type !== "lane_profile_3") {
      nextCheckpoints.push(checkpoint);
      continue;
    }
    const meta = checkpoint.meta && typeof checkpoint.meta === "object" ? checkpoint.meta : {};
    let startNodeIndex = Math.round(Number(meta.startNodeIndex));
    let endNodeIndex = Math.round(Number(meta.endNodeIndex));
    if (!Number.isFinite(startNodeIndex) || !Number.isFinite(endNodeIndex)) {
      removedCount += 1;
      continue;
    }
    if (deleteIndex < startNodeIndex) {
      startNodeIndex -= 1;
      endNodeIndex -= 1;
    } else if (deleteIndex === startNodeIndex || deleteIndex === endNodeIndex) {
      removedCount += 1;
      continue;
    } else if (deleteIndex > startNodeIndex && deleteIndex < endNodeIndex) {
      endNodeIndex -= 1;
    }
    if (endNodeIndex - startNodeIndex < 1) {
      removedCount += 1;
      continue;
    }
    checkpoint.meta = { ...meta, startNodeIndex, endNodeIndex };
    if (!mapperRefreshLaneProfile3Checkpoint(checkpoint)) {
      removedCount += 1;
      continue;
    }
    nextCheckpoints.push(checkpoint);
  }
  state.mapper.checkpointsPx = nextCheckpoints;
  return removedCount;
}

function mapperRefreshAllLaneProfiles(points = state.mapper.pathPointsPx) {
  if (!state.mapper.checkpointsPx.length) {
    return { removedCount: 0, overlapError: null };
  }

  const next = [];
  let removedCount = 0;
  for (const checkpoint of state.mapper.checkpointsPx) {
    if (!checkpoint || checkpoint.type !== "lane_profile_3") {
      next.push(checkpoint);
      continue;
    }
    if (!mapperRefreshLaneProfile3Checkpoint(checkpoint, points)) {
      removedCount += 1;
      continue;
    }
    next.push(checkpoint);
  }
  state.mapper.checkpointsPx = next;
  const validation = mapperValidateLaneProfile3Ranges(state.mapper.checkpointsPx, points);
  return {
    removedCount,
    overlapError: validation.ok ? null : validation.message,
  };
}

function mapperCoincidentPathIndices(index) {
  if (index < 0 || index >= state.mapper.pathPointsPx.length) {
    return [];
  }

  const origin = state.mapper.pathPointsPx[index];
  if (!origin) {
    return [];
  }

  const fit = state.mapper.imageFit;
  const coincidenceRadius = fit
    ? Math.max(0.001, (MAPPER_SNAP_CANVAS_PX * 0.4) / Math.max(0.001, fit.scale))
    : 0.001;

  const indices = [];
  for (let i = 0; i < state.mapper.pathPointsPx.length; i += 1) {
    const point = state.mapper.pathPointsPx[i];
    if (!point) {
      continue;
    }
    const dist = Math.hypot(point.x - origin.x, point.y - origin.y);
    if (dist <= coincidenceRadius) {
      indices.push(i);
    }
  }

  return indices.length ? indices : [index];
}

function deleteMapperPathPoint(index) {
  if (index < 0 || index >= state.mapper.pathPointsPx.length) {
    return { ok: false, removedLaneProfiles: 0 };
  }
  const points = state.mapper.pathPointsPx;
  const removed = points[index];
  points.splice(index, 1);
  if (!points.length) {
    return { ok: true, removedLaneProfiles: 0 };
  }
  if (index === 0) {
    points[0].move = true;
  }
  if (removed?.move && index < points.length) {
    points[index].move = true;
  }
  const removedLaneProfiles = mapperReindexLaneProfilesAfterDelete(index);
  return { ok: true, removedLaneProfiles };
}

function insertMapperPathPointAtSegment(imagePoint) {
  if (!imagePoint || state.mapper.pathPointsPx.length < 2) {
    return { ok: false, message: "Add at least two path points first." };
  }

  const frame = mapperFrameAtImagePoint(imagePoint);
  if (!frame || !Number.isFinite(frame.segmentIndex)) {
    return { ok: false, message: "Could not find a valid segment near click." };
  }

  const segmentIndex = Math.max(
    0,
    Math.min(state.mapper.pathPointsPx.length - 2, Math.round(Number(frame.segmentIndex) || 0)),
  );
  const a = state.mapper.pathPointsPx[segmentIndex];
  const b = state.mapper.pathPointsPx[segmentIndex + 1];
  if (!a || !b || b.move) {
    return { ok: false, message: "Click a continuous segment between two connected nodes." };
  }

  const insertPoint = {
    x: Number.isFinite(frame.snappedX) ? frame.snappedX : imagePoint.x,
    y: Number.isFinite(frame.snappedY) ? frame.snappedY : imagePoint.y,
    move: false,
  };

  const fit = state.mapper.imageFit;
  const minNodeGap = fit ? (MAPPER_SNAP_CANVAS_PX * 0.65) / Math.max(0.001, fit.scale) : 0.9;
  const distA = Math.hypot(insertPoint.x - a.x, insertPoint.y - a.y);
  const distB = Math.hypot(insertPoint.x - b.x, insertPoint.y - b.y);
  if (distA < minNodeGap || distB < minNodeGap) {
    return { ok: false, message: "Click farther from the segment endpoints to insert a new node." };
  }

  const insertIndex = segmentIndex + 1;
  state.mapper.pathPointsPx.splice(insertIndex, 0, insertPoint);
  mapperReindexLaneProfilesAfterInsert(insertIndex);
  return { ok: true, segmentIndex, insertIndex };
}

function loadRouteIntoMapperEditor(route, options = {}) {
  if (!route || !Array.isArray(route.path) || !Array.isArray(route.checkpoints)) {
    throw new Error("Route is invalid for mapper editing.");
  }
  const mapName = String(options.mapName || "").trim();
  if (mapName && dom.mapperMapName) {
    dom.mapperMapName.value = mapName;
  }

  const meta = route.mapperMeta && typeof route.mapperMeta === "object" ? route.mapperMeta : null;
  const metaPath = Array.isArray(meta?.pathPointsPx) ? meta.pathPointsPx : null;
  const metaCheckpoints = Array.isArray(meta?.checkpointsPx) ? meta.checkpointsPx : null;

  if (Number.isFinite(Number(meta?.metersPerPixel)) && Number(meta.metersPerPixel) > 0) {
    state.mapper.metersPerPixel = Number(meta.metersPerPixel);
  }

  if (metaPath && metaPath.length >= 2) {
    state.mapper.pathPointsPx = metaPath.map((point, index) => ({
      x: Number(point.x) || 0,
      y: Number(point.y) || 0,
      move: index === 0 ? true : Boolean(point.move),
    }));
  } else {
    const inferredMetersPerPixel = Number(state.mapper.metersPerPixel) > 0 ? Number(state.mapper.metersPerPixel) : 0.1;
    state.mapper.metersPerPixel = inferredMetersPerPixel;
    const baseX = (state.mapper.image?.width || 420) * 0.5;
    const baseY = (state.mapper.image?.height || 420) * 0.5;
    const originWorld = route.path[0] || { x: 0, y: 0 };
    state.mapper.pathPointsPx = route.path.map((point, index) => ({
      x: baseX + (Number(point.x || 0) - Number(originWorld.x || 0)) / inferredMetersPerPixel,
      y: baseY - (Number(point.y || 0) - Number(originWorld.y || 0)) / inferredMetersPerPixel,
      move: index === 0 ? true : Boolean(point.move),
    }));
  }

  if (metaCheckpoints) {
    state.mapper.checkpointsPx = metaCheckpoints.map((cp, index) => ({
      x: Number(cp.x) || 0,
      y: Number(cp.y) || 0,
      id: String(cp.id || mapperCheckpointId(cp.type || "speed_zone", metaCheckpoints.slice(0, index))),
      type: String(cp.type || "speed_zone"),
      meta: cp.meta && typeof cp.meta === "object" ? { ...cp.meta } : {},
    }));
  } else {
    const originWorld = route.path[0] || { x: 0, y: 0 };
    const baseX = (state.mapper.image?.width || 420) * 0.5;
    const baseY = (state.mapper.image?.height || 420) * 0.5;
    const metersPerPixel = Number(state.mapper.metersPerPixel) > 0 ? Number(state.mapper.metersPerPixel) : 0.1;
    state.mapper.checkpointsPx = route.checkpoints.map((cp, index) => ({
      x: baseX + (Number(cp.x || 0) - Number(originWorld.x || 0)) / metersPerPixel,
      y: baseY - (Number(cp.y || 0) - Number(originWorld.y || 0)) / metersPerPixel,
      id: String(cp.id || `A_CP_${String(index + 1).padStart(2, "0")}`),
      type: String(cp.type || "speed_zone"),
      meta: cp.meta && typeof cp.meta === "object" ? { ...cp.meta } : {},
    }));
  }

  const lane3Repair = mapperRefreshAllLaneProfiles(state.mapper.pathPointsPx);
  if (lane3Repair.overlapError) {
    throw new Error(lane3Repair.overlapError);
  }

  state.mapper.mode = "idle";
  state.mapper.pathNextMove = false;
  state.mapper.lane3DraftStartIndex = -1;
  state.mapper.pendingCheckpointType = null;
  clearMapperSelection();
  state.mapper.dragging = null;
  state.mapper.routeOverrideA = sanitizeMapperRoute(route);
  persistMapperRouteOverride();
  if (state.mapper.image && Number.isFinite(state.mapper.metersPerPixel) && state.mapper.metersPerPixel > 0) {
    refreshMapperJsonPreview();
  } else {
    dom.mapperJson.textContent = formatJson(state.mapper.routeOverrideA);
  }
  if (lane3Repair.removedCount > 0) {
    setMapperStatus(`${lane3Repair.removedCount} tramo(s) 3L invalido(s) fueron removidos al cargar el mapa.`);
  }
  drawMapperCanvas();
}

function refreshMapperJsonPreview() {
  try {
    const route = mapperBuildRouteAFromCanvas();
    dom.mapperJson.textContent = formatJson(route);
  } catch {
    dom.mapperJson.textContent = "";
  }
}

function defaultMapperMapName() {
  return `Route A ${new Date().toISOString().slice(0, 10)}`;
}

function updateMapperLibraryStatus(message) {
  if (!dom.mapperLibraryStatus) {
    return;
  }
  dom.mapperLibraryStatus.textContent = message;
}

function updateMapperMapActions() {
  const creator = Boolean(state.user?.is_creator);
  const hasSelection = Boolean(state.mapper.selectedMapId);
  if (dom.mapperSaveRoute) {
    dom.mapperSaveRoute.disabled = !creator;
  }
  if (dom.mapperPublishRoute) {
    dom.mapperPublishRoute.disabled = !creator;
  }
  if (dom.mapperActivateMap) {
    dom.mapperActivateMap.disabled = !creator || !hasSelection;
  }
  if (dom.mapperOpenMap) {
    dom.mapperOpenMap.disabled = !creator || !hasSelection;
  }
}

function renderMapperMapLibrary() {
  if (!dom.mapperSavedMaps) {
    return;
  }

  const previousSelection = state.mapper.selectedMapId;
  dom.mapperSavedMaps.innerHTML = "";
  const maps = Array.isArray(state.mapper.mapLibrary) ? state.mapper.mapLibrary : [];

  for (const map of maps) {
    const option = document.createElement("option");
    option.value = map.map_id;
    const createdText = map.created_at ? new Date(map.created_at).toLocaleString() : "";
    const activeText = map.is_active ? " [ACTIVE]" : "";
    option.textContent = `${map.route_id} v${map.version} - ${map.name}${activeText}${createdText ? ` - ${createdText}` : ""}`;
    dom.mapperSavedMaps.appendChild(option);
  }

  if (maps.length === 0) {
    state.mapper.selectedMapId = "";
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = "No saved maps found.";
    emptyOption.disabled = true;
    emptyOption.selected = true;
    dom.mapperSavedMaps.appendChild(emptyOption);
  } else if (previousSelection && maps.some((map) => map.map_id === previousSelection)) {
    dom.mapperSavedMaps.value = previousSelection;
    state.mapper.selectedMapId = previousSelection;
  } else {
    state.mapper.selectedMapId = maps[0].map_id;
    dom.mapperSavedMaps.value = maps[0].map_id;
  }

  updateMapperMapActions();
}

function selectedMapperMapRecord() {
  const mapId = state.mapper.selectedMapId;
  if (!mapId) {
    return null;
  }
  return state.mapper.mapLibrary.find((map) => map.map_id === mapId) || null;
}

async function loadMapperMapLibrary(options = {}) {
  const { preserveSelection = true } = options;
  if (!state.token || !state.user?.is_creator) {
    state.mapper.mapLibrary = [];
    state.mapper.selectedMapId = "";
    renderMapperMapLibrary();
    updateMapperLibraryStatus("Saved maps: creator login required.");
    return;
  }

  const previousSelection = preserveSelection ? state.mapper.selectedMapId : "";
  const params = new URLSearchParams();
  const routeFilter = String(state.mapper.libraryRouteFilter || "A").trim().toUpperCase();
  params.set("route_id", routeFilter || "A");
  const search = String(state.mapper.librarySearch || "").trim();
  if (search) {
    params.set("q", search);
  }
  params.set("limit", "120");

  updateMapperLibraryStatus("Saved maps: loading...");
  const payload = await api(`/v1/maps?${params.toString()}`, {
    headers: authHeaders(),
  });
  state.mapper.mapLibrary = Array.isArray(payload.maps) ? payload.maps : [];
  if (previousSelection) {
    state.mapper.selectedMapId = previousSelection;
  }
  renderMapperMapLibrary();

  const visibleCount = state.mapper.mapLibrary.length;
  const hasMore = Boolean(payload.pagination?.has_more);
  updateMapperLibraryStatus(
    `Saved maps: ${visibleCount}${hasMore ? "+" : ""} shown (route=${payload.filters?.route_id || routeFilter}${search ? `, q="${search}"` : ""}).`,
  );
}

function resolveMapperRouteForSave() {
  let route = state.mapper.routeOverrideA;
  if (!route) {
    route = mapperBuildRouteAFromCanvas();
  }
  return route;
}

function drawMapperCanvas() {
  const w = dom.mapperCanvas.width;
  const h = dom.mapperCanvas.height;
  mapperCtx.clearRect(0, 0, w, h);

  mapperCtx.fillStyle = "rgba(6, 18, 28, 0.9)";
  mapperCtx.fillRect(0, 0, w, h);

  if (state.mapper.image) {
    const image = state.mapper.image;
    const scale = Math.min(w / image.width, h / image.height);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    const drawX = (w - drawW) / 2;
    const drawY = (h - drawH) / 2;
    state.mapper.imageFit = { drawX, drawY, drawW, drawH, scale, offsetX: 0, offsetY: 0, virtual: false };

    mapperCtx.drawImage(image, drawX, drawY, drawW, drawH);

    mapperCtx.strokeStyle = "rgba(176, 212, 232, 0.5)";
    mapperCtx.lineWidth = 1;
    mapperCtx.strokeRect(drawX, drawY, drawW, drawH);
  } else {
    const virtualFit = computeMapperVirtualFit(w, h);
    if (!virtualFit) {
      state.mapper.imageFit = null;
      mapperCtx.fillStyle = "#9fb9c7";
      mapperCtx.font = "12px Sora, sans-serif";
      mapperCtx.fillText("Upload map image or open a saved map", 14, 22);
      return;
    }
    state.mapper.imageFit = virtualFit;
    mapperCtx.fillStyle = "rgba(8, 25, 36, 0.62)";
    mapperCtx.fillRect(virtualFit.drawX, virtualFit.drawY, virtualFit.drawW, virtualFit.drawH);
    mapperCtx.strokeStyle = "rgba(176, 212, 232, 0.5)";
    mapperCtx.lineWidth = 1;
    mapperCtx.strokeRect(virtualFit.drawX, virtualFit.drawY, virtualFit.drawW, virtualFit.drawH);
    mapperCtx.fillStyle = "rgba(168, 206, 223, 0.92)";
    mapperCtx.font = "11px Sora, sans-serif";
    mapperCtx.fillText("No background image loaded. Editing vector map.", virtualFit.drawX + 8, virtualFit.drawY + 16);
  }

  if (state.mapper.scalePointsPx.length > 0) {
    const p0 = mapperImageToCanvasPoint(state.mapper.scalePointsPx[0]);
    if (p0) {
      mapperCtx.fillStyle = "#ffcc66";
      mapperCtx.beginPath();
      mapperCtx.arc(p0.x, p0.y, 4, 0, Math.PI * 2);
      mapperCtx.fill();
    }
  }
  if (state.mapper.scalePointsPx.length > 1) {
    const p0 = mapperImageToCanvasPoint(state.mapper.scalePointsPx[0]);
    const p1 = mapperImageToCanvasPoint(state.mapper.scalePointsPx[1]);
    if (p0 && p1) {
      mapperCtx.strokeStyle = "#ffcc66";
      mapperCtx.lineWidth = 2;
      mapperCtx.beginPath();
      mapperCtx.moveTo(p0.x, p0.y);
      mapperCtx.lineTo(p1.x, p1.y);
      mapperCtx.stroke();
    }
  }

  if (state.mapper.pathPointsPx.length > 0) {
    mapperCtx.strokeStyle = "#35d2ff";
    mapperCtx.lineWidth = 2;
    mapperCtx.beginPath();
    let started = false;
    for (const point of state.mapper.pathPointsPx) {
      const c = mapperImageToCanvasPoint(point);
      if (!c) {
        continue;
      }
      if (point.move) {
        started = false;
      }
      if (!started) {
        mapperCtx.moveTo(c.x, c.y);
        started = true;
      } else {
        mapperCtx.lineTo(c.x, c.y);
      }
    }
    mapperCtx.stroke();

    const lane3Profiles = state.mapper.checkpointsPx
      .filter((checkpoint) => checkpoint?.type === "lane_profile_3")
      .map((checkpoint) => ({
        checkpoint,
        normalized: mapperNormalizeLaneProfile3Meta(checkpoint.meta, state.mapper.pathPointsPx),
      }))
      .filter((entry) => Boolean(entry.normalized));

    for (const entry of lane3Profiles) {
      const { normalized } = entry;
      mapperCtx.strokeStyle = "rgba(133, 240, 255, 0.32)";
      mapperCtx.lineWidth = 11;
      mapperCtx.lineCap = "round";
      mapperCtx.lineJoin = "round";
      mapperCtx.beginPath();
      let startedOverlay = false;
      for (let i = normalized.startNodeIndex; i < normalized.endNodeIndex; i += 1) {
        const a = state.mapper.pathPointsPx[i];
        const b = state.mapper.pathPointsPx[i + 1];
        if (!a || !b || b.move) {
          continue;
        }
        const ca = mapperImageToCanvasPoint(a);
        const cb = mapperImageToCanvasPoint(b);
        if (!ca || !cb) {
          continue;
        }
        if (!startedOverlay) {
          mapperCtx.moveTo(ca.x, ca.y);
          startedOverlay = true;
        }
        mapperCtx.lineTo(cb.x, cb.y);
      }
      mapperCtx.stroke();

      const center = mapperImageToCanvasPoint(entry.checkpoint);
      if (center) {
        mapperCtx.fillStyle = "rgba(133, 240, 255, 0.95)";
        mapperCtx.font = "bold 10px Sora, sans-serif";
        mapperCtx.fillText("3L", center.x + 8, center.y + 4);
      }
    }

    for (let i = 0; i < state.mapper.pathPointsPx.length; i += 1) {
      const c = mapperImageToCanvasPoint(state.mapper.pathPointsPx[i]);
      if (!c) {
        continue;
      }
      mapperCtx.fillStyle = i === 0 ? "#9dffbf" : "#46c7f5";
      mapperCtx.beginPath();
      mapperCtx.arc(c.x, c.y, i === 0 ? 4.5 : 3, 0, Math.PI * 2);
      mapperCtx.fill();
    }

    if (state.mapper.mode === "lane3_pick_end" && state.mapper.lane3DraftStartIndex >= 0) {
      const startPoint = state.mapper.pathPointsPx[state.mapper.lane3DraftStartIndex];
      const c = startPoint ? mapperImageToCanvasPoint(startPoint) : null;
      if (c) {
        mapperCtx.strokeStyle = "#85f0ff";
        mapperCtx.lineWidth = 2.5;
        mapperCtx.beginPath();
        mapperCtx.arc(c.x, c.y, 9, 0, Math.PI * 2);
        mapperCtx.stroke();
        mapperCtx.fillStyle = "#85f0ff";
        mapperCtx.font = "bold 10px Sora, sans-serif";
        mapperCtx.fillText("3L start", c.x + 10, c.y - 10);
      }
    }
  }

  if (state.mapper.selectedPathIndex >= 0) {
    const selected = state.mapper.pathPointsPx[state.mapper.selectedPathIndex];
    const c = selected ? mapperImageToCanvasPoint(selected) : null;
    if (c) {
      mapperCtx.strokeStyle = "#9dffbf";
      mapperCtx.lineWidth = 2;
      mapperCtx.beginPath();
      mapperCtx.arc(c.x, c.y, 8, 0, Math.PI * 2);
      mapperCtx.stroke();
    }
  }

  for (const cp of state.mapper.checkpointsPx) {
    const c = mapperImageToCanvasPoint(cp);
    if (!c) {
      continue;
    }
    mapperCtx.fillStyle = mapperCheckpointColor(cp.type);
    mapperCtx.beginPath();
    mapperCtx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    mapperCtx.fill();
    mapperCtx.fillStyle = "#06131d";
    mapperCtx.font = "bold 10px Sora, sans-serif";
    mapperCtx.fillText(cp.id.replace("A_", ""), c.x + 7, c.y - 7);
  }

  if (state.mapper.selectedCheckpointIndex >= 0) {
    const cp = state.mapper.checkpointsPx[state.mapper.selectedCheckpointIndex];
    const c = cp ? mapperImageToCanvasPoint(cp) : null;
    if (c) {
      mapperCtx.strokeStyle = "#ffd67b";
      mapperCtx.lineWidth = 2;
      mapperCtx.beginPath();
      mapperCtx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      mapperCtx.stroke();
    }
  }

  mapperCtx.fillStyle = "rgba(8, 22, 33, 0.84)";
  mapperCtx.fillRect(8, h - 38, w - 16, 30);
  mapperCtx.fillStyle = "#dceaf2";
  mapperCtx.font = "11px Sora, sans-serif";
  mapperCtx.fillText(
    `mode=${state.mapper.mode} scale=${state.mapper.metersPerPixel ? state.mapper.metersPerPixel.toFixed(3) : "unset"}m/px path=${state.mapper.pathPointsPx.length} cp=${state.mapper.checkpointsPx.length}`,
    14,
    h - 18,
  );
}

function updateMapperCheckpointUi() {
  const type = dom.mapperCheckpointType.value;
  const bumpMode = type === "speed_bump" || type === "stop_line" || type === "stop_line_free";
  const trafficMode = type === "traffic_light";
  const parkingMode = type === "parking_parallel" || type === "parking_diagonal";
  dom.mapperTrafficFields.classList.toggle("hidden", !trafficMode);
  dom.mapperLaneFields.classList.toggle("hidden", !bumpMode);
  dom.mapperParkingFields.classList.toggle("hidden", !parkingMode);

  const helpByType = {
    speed_zone: "Speed Zone: place at the lane section where speed limit starts.",
    traffic_light:
      "Traffic Light: click near a road edge and it snaps to the closest path edge. Choose orientation, then add at least one Stop Line nearby.",
    stop_line: "Stop Line: choose lanes + lane side, click near the road. It snaps to the closest path and occupies one lane.",
    stop_line_free:
      "Standalone Stop Line: same lane snap as Stop Line, but it is not paired to a traffic light and does not trigger red-light penalties.",
    roundabout: "Roundabout: place at the ovalo center area.",
    parking_parallel: "Parking Parallel: choose number of slots, then click left/right of path; bays auto-snap to that road edge.",
    parking_diagonal: "Parking Diagonal: choose slots/angle, then click left/right of path; bays auto-snap to that road edge.",
    speed_bump: "Speed Bump: choose lanes + lane side, then place the bump on that lane.",
    lane_add: "Lane Add: click to one side of a path segment and that side gains +1 lane on that tramo.",
    start_canopy: "Start Canopy: click near the route and it auto-snaps to a segment center, covering both lanes.",
    tree: "Tree: place decorative trees around the circuit.",
    guard_tower: "Guard Tower: place a veedor cabin/checkpoint prop near the route (cute low-poly style).",
  };
  dom.mapperCheckpointHelp.textContent =
    helpByType[type] || "Select a type, click Place Checkpoint, then click on the map.";
}

function handleMapperCanvasClick(event) {
  const imagePoint = mapperCanvasToImagePoint(event);
  if (!imagePoint) {
    return;
  }

  if (state.mapper.mode === "lane3_pick_start") {
    clearMapperSelection();
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    const startNodeIndex = mapperHitPathNode(imagePoint);
    if (startNodeIndex < 0) {
      setMapperStatus("3L segment: click directly on an existing path node for start.");
      drawMapperCanvas();
      return;
    }
    state.mapper.lane3DraftStartIndex = startNodeIndex;
    state.mapper.mode = "lane3_pick_end";
    setMapperStatus(`3L start node selected (#${startNodeIndex + 1}). Now click end node.`);
    refreshMapperJsonPreview();
    drawMapperCanvas();
    return;
  }

  if (state.mapper.mode === "lane3_pick_end") {
    clearMapperSelection();
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    const endNodeIndex = mapperHitPathNode(imagePoint);
    if (endNodeIndex < 0) {
      setMapperStatus("3L segment: click directly on an existing path node for end.");
      drawMapperCanvas();
      return;
    }
    const startNodeIndex = Math.max(0, Math.min(state.mapper.pathPointsPx.length - 1, state.mapper.lane3DraftStartIndex));
    const draftMeta = {
      startNodeIndex,
      endNodeIndex,
      startAnchorSide: dom.mapperLane3StartEdge?.value === "left" ? "left" : "right",
      endAnchorSide: dom.mapperLane3EndEdge?.value === "left" ? "left" : "right",
      transitionLengthM: Number(dom.mapperLane3Transition?.value),
      expansionMode: dom.mapperLane3Expansion?.value === "trim_previous" ? "trim_previous" : "node",
    };
    const checkpoint = {
      x: imagePoint.x,
      y: imagePoint.y,
      id: mapperCheckpointId("lane_profile_3", state.mapper.checkpointsPx),
      type: "lane_profile_3",
      meta: draftMeta,
    };
    if (!mapperRefreshLaneProfile3Checkpoint(checkpoint, state.mapper.pathPointsPx)) {
      state.mapper.mode = "idle";
      state.mapper.lane3DraftStartIndex = -1;
      setMapperStatus("3L segment invalid: start/end must be on same continuous subpath and cover at least 1 segment.");
      refreshMapperJsonPreview();
      drawMapperCanvas();
      return;
    }
    const validation = mapperValidateLaneProfile3Ranges(
      [...state.mapper.checkpointsPx, checkpoint],
      state.mapper.pathPointsPx,
    );
    if (!validation.ok) {
      state.mapper.mode = "idle";
      state.mapper.lane3DraftStartIndex = -1;
      setMapperStatus(validation.message);
      refreshMapperJsonPreview();
      drawMapperCanvas();
      return;
    }
    state.mapper.checkpointsPx.push(checkpoint);
    state.mapper.selectedCheckpointIndex = state.mapper.checkpointsPx.length - 1;
    state.mapper.selectedPathIndex = -1;
    state.mapper.mode = "idle";
    state.mapper.lane3DraftStartIndex = -1;
    setMapperStatus(
      `3L segment created (${checkpoint.id}): nodes ${checkpoint.meta.startNodeIndex + 1} -> ${checkpoint.meta.endNodeIndex + 1}.`,
    );
    refreshMapperJsonPreview();
    drawMapperCanvas();
    return;
  }

  if (state.mapper.mode === "scale") {
    clearMapperSelection();
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    if (state.mapper.scalePointsPx.length >= 2) {
      state.mapper.scalePointsPx = [];
    }
    state.mapper.scalePointsPx.push(imagePoint);
    if (state.mapper.scalePointsPx.length === 2) {
      const [a, b] = state.mapper.scalePointsPx;
      const pxDist = Math.hypot(b.x - a.x, b.y - a.y);
      const meters = Math.max(0.1, Number(dom.mapperLaneWidth.value) || 7);
      state.mapper.metersPerPixel = meters / Math.max(1, pxDist);
      state.mapper.mode = "idle";
      setMapperStatus(`scale set: ${state.mapper.metersPerPixel.toFixed(4)} m/px.`);
    }
  } else if (state.mapper.mode === "path") {
    clearMapperSelection();
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    const snapped = mapperFindSnapPoint(imagePoint);
    const point = snapped ? { x: snapped.x, y: snapped.y } : imagePoint;
    const isNewSegment = state.mapper.pathNextMove || state.mapper.pathPointsPx.length === 0;
    const lastPoint = state.mapper.pathPointsPx[state.mapper.pathPointsPx.length - 1];
    if (
      !isNewSegment &&
      lastPoint &&
      Math.hypot(lastPoint.x - point.x, lastPoint.y - point.y) < 0.001
    ) {
      setMapperStatus("point already exists there. Click a different point or arm New Segment first.");
      drawMapperCanvas();
      return;
    }

    state.mapper.pathPointsPx.push({
      ...point,
      move: isNewSegment,
    });
    const lane3Repair = mapperRefreshAllLaneProfiles(state.mapper.pathPointsPx);
    if (lane3Repair.overlapError) {
      state.mapper.pathPointsPx.pop();
      setMapperStatus(lane3Repair.overlapError);
      refreshMapperJsonPreview();
      drawMapperCanvas();
      return;
    }
    state.mapper.pathNextMove = false;
    if (snapped) {
      setMapperStatus(`path point ${state.mapper.pathPointsPx.length} added (snapped to node ${snapped.index + 1}).`);
    } else {
      setMapperStatus(`path point ${state.mapper.pathPointsPx.length} added.`);
    }
  } else if (state.mapper.mode === "insert_path") {
    clearMapperSelection();
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    const result = insertMapperPathPointAtSegment(imagePoint);
    state.mapper.mode = "idle";
    state.mapper.pathNextMove = false;
    if (!result.ok) {
      setMapperStatus(result.message || "Could not insert node.");
      refreshMapperJsonPreview();
      drawMapperCanvas();
      return;
    }
    const lane3Repair = mapperRefreshAllLaneProfiles(state.mapper.pathPointsPx);
    if (lane3Repair.overlapError) {
      setMapperStatus(lane3Repair.overlapError);
      refreshMapperJsonPreview();
      drawMapperCanvas();
      return;
    }
    state.mapper.selectedPathIndex = result.insertIndex;
    state.mapper.selectedCheckpointIndex = -1;
    setMapperStatus(
      `node inserted between path points ${result.segmentIndex + 1} and ${result.segmentIndex + 2}.`,
    );
  } else if (state.mapper.mode === "checkpoint") {
    clearMapperSelection();
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    const type = state.mapper.pendingCheckpointType || dom.mapperCheckpointType.value;
    if (!mapperAllowsMultiple(type)) {
      state.mapper.checkpointsPx = state.mapper.checkpointsPx.filter((cp) => cp.type !== type);
    }
    const meta = mapperDefaultMeta(type);
    const frame = mapperFrameAtImagePoint(imagePoint);
    if (frame && Number.isFinite(frame.headingDeg)) {
      meta.headingDeg = mapperRound(frame.headingDeg, 1);
    }
    if ((type === "parking_parallel" || type === "parking_diagonal") && frame?.sideSign) {
      // Persist chosen side so parking auto-snaps to road edge without manual offset hunting.
      meta.sideSign = frame.sideSign;
    }
    if (
      (type === "speed_bump" ||
        type === "stop_line" ||
        type === "stop_line_free" ||
        type === "start_canopy" ||
        type === "lane_add") &&
      Number.isFinite(frame?.segmentIndex)
    ) {
      meta.snapSegmentIndex = Math.max(0, Math.round(frame.segmentIndex));
    }
    if (type === "lane_add" && frame?.sideSign) {
      meta.sideSign = frame.sideSign;
      meta.extraLanes = Math.max(1, Math.min(2, Math.round(Number(meta.extraLanes) || 1)));
    }
    if (type === "traffic_light") {
      meta.facing = dom.mapperTrafficFacing.value === "reverse" ? "reverse" : "with_path";
      if (frame?.sideSign) {
        meta.sideSign = frame.sideSign;
      }
      if (Number.isFinite(frame?.segmentIndex)) {
        meta.snapSegmentIndex = Math.max(0, Math.round(frame.segmentIndex));
      }
    }
    if (type === "guard_tower") {
      if (frame?.sideSign) {
        meta.sideSign = frame.sideSign;
      }
      if (Number.isFinite(frame?.segmentIndex)) {
        meta.snapSegmentIndex = Math.max(0, Math.round(frame.segmentIndex));
      }
    }
    const newId = mapperCheckpointId(type, state.mapper.checkpointsPx);
    state.mapper.checkpointsPx.push({
      ...imagePoint,
      id: newId,
      type,
      meta,
    });
    state.mapper.pendingCheckpointType = null;
    state.mapper.mode = "idle";
    setMapperStatus(`${type} checkpoint placed.`);
  }

  refreshMapperJsonPreview();
  drawMapperCanvas();
}

function handleMapperCanvasPointerDown(event) {
  if (state.mapper.mode !== "idle") {
    return;
  }
  const imagePoint = mapperCanvasToImagePoint(event);
  if (!imagePoint) {
    return;
  }
  const hit = mapperHitTest(imagePoint);
  if (!hit) {
    clearMapperSelection();
    state.mapper.dragging = null;
    drawMapperCanvas();
    return;
  }

  if (hit.kind === "checkpoint") {
    state.mapper.selectedCheckpointIndex = hit.index;
    state.mapper.selectedPathIndex = -1;
    const checkpoint = state.mapper.checkpointsPx[hit.index];
    if (checkpoint?.type === "lane_profile_3") {
      state.mapper.dragging = null;
      setMapperStatus("3L segment selected. Drag disabled; use delete + recreate to edit geometry.");
    } else {
      state.mapper.dragging = { kind: hit.kind, index: hit.index };
    }
  } else {
    state.mapper.selectedPathIndex = hit.index;
    state.mapper.selectedCheckpointIndex = -1;
    const linkedPathIndices = mapperCoincidentPathIndices(hit.index);
    state.mapper.dragging = { kind: hit.kind, index: hit.index, linkedPathIndices };
  }
  drawMapperCanvas();
}

function handleMapperCanvasPointerMove(event) {
  if (state.mapper.mode !== "idle" || !state.mapper.dragging) {
    return;
  }
  const imagePoint = mapperCanvasToImagePoint(event);
  if (!imagePoint) {
    return;
  }

  const drag = state.mapper.dragging;
  if (drag.kind === "checkpoint") {
    const cp = state.mapper.checkpointsPx[drag.index];
    if (!cp) {
      return;
    }
    if (cp.type === "lane_profile_3") {
      return;
    }
    cp.x = imagePoint.x;
    cp.y = imagePoint.y;
    state.mapper.selectedCheckpointIndex = drag.index;
    state.mapper.selectedPathIndex = -1;
  } else if (drag.kind === "path") {
    const point = state.mapper.pathPointsPx[drag.index];
    if (!point) {
      return;
    }
    const linked = Array.isArray(drag.linkedPathIndices) && drag.linkedPathIndices.length
      ? [...new Set(drag.linkedPathIndices)]
      : [drag.index];
    const dx = imagePoint.x - point.x;
    const dy = imagePoint.y - point.y;
    for (const index of linked) {
      const linkedPoint = state.mapper.pathPointsPx[index];
      if (!linkedPoint) {
        continue;
      }
      linkedPoint.x += dx;
      linkedPoint.y += dy;
    }
    state.mapper.selectedPathIndex = drag.index;
    state.mapper.selectedCheckpointIndex = -1;
    const lane3Repair = mapperRefreshAllLaneProfiles(state.mapper.pathPointsPx);
    if (lane3Repair.overlapError) {
      setMapperStatus(lane3Repair.overlapError);
    }
    if (lane3Repair.removedCount > 0) {
      setMapperStatus(`${lane3Repair.removedCount} tramo(s) 3L invalido(s) removidos por mover nodos.`);
    }
  }
  state.mapper.routeOverrideA = null;
  persistMapperRouteOverride();
  drawMapperCanvas();
}

function handleMapperCanvasPointerUp() {
  if (!state.mapper.dragging) {
    return;
  }
  const drag = state.mapper.dragging;
  if (drag.kind === "checkpoint") {
    const cp = state.mapper.checkpointsPx[drag.index];
    if (
      cp?.type === "traffic_light" ||
      cp?.type === "stop_line" ||
      cp?.type === "stop_line_free" ||
      cp?.type === "speed_bump" ||
      cp?.type === "lane_add" ||
      cp?.type === "start_canopy" ||
      cp?.type === "guard_tower"
    ) {
      const frame = mapperFrameAtImagePoint(cp);
      if (frame && Number.isFinite(frame.headingDeg)) {
        cp.meta = cp.meta && typeof cp.meta === "object" ? cp.meta : {};
        cp.meta.headingDeg = mapperRound(frame.headingDeg, 1);
        if ((cp.type === "traffic_light" || cp.type === "guard_tower" || cp.type === "lane_add") && frame.sideSign) {
          cp.meta.sideSign = frame.sideSign;
        }
        if (Number.isFinite(frame.segmentIndex)) {
          cp.meta.snapSegmentIndex = Math.max(0, Math.round(frame.segmentIndex));
        }
      }
    }
  }
  state.mapper.dragging = null;
  state.mapper.routeOverrideA = null;
  persistMapperRouteOverride();
  refreshMapperJsonPreview();
  drawMapperCanvas();
}

function updateHudOverlay() {
  dom.hudSpeed.textContent = `Speed: ${Math.max(0, state.sim.car?.speedKmh ?? 0).toFixed(1)} km/h`;
  dom.hudSignal.textContent = `Signal: ${state.sim.lastSignal || "off"}`;
  if (dom.simSignalLeft) {
    dom.simSignalLeft.classList.toggle("active", state.sim.lastSignal === "left");
  }
  if (dom.simSignalRight) {
    dom.simSignalRight.classList.toggle("active", state.sim.lastSignal === "right");
  }
  dom.hudCam.textContent = `Cam: ${state.sim.camera}`;
  const penaltyTotal = Math.max(0, Math.round(state.sim.penaltyPoints || 0));
  if (dom.hudPenalty) {
    dom.hudPenalty.textContent = `Penalties: -${penaltyTotal} pts`;
  }
  if (dom.simPenaltyTotal) {
    dom.simPenaltyTotal.textContent = `Penalidad acumulada: -${penaltyTotal} pts`;
  }

  const isRed = isTrafficLightRed();
  const remaining = trafficLightSecondsRemaining();
  if (state.sim.trafficLightManual !== null) {
    dom.hudLight.textContent = `Light: ${isRed ? "RED" : "GREEN"} (manual)`;
  } else if (remaining != null) {
    dom.hudLight.textContent = `Light: ${isRed ? "RED" : "GREEN"} (${remaining}s)`;
  } else {
    dom.hudLight.textContent = `Light: ${isRed ? "RED" : "GREEN"}`;
  }
}

function setWebglStatus(message = "", isError = false) {
  if (!message) {
    dom.simWebglStatus.classList.add("hidden");
    dom.simWebglStatus.textContent = "";
    return;
  }

  dom.simWebglStatus.textContent = message;
  dom.simWebglStatus.classList.remove("hidden");
  if (isError) {
    dom.simWebglStatus.style.borderColor = "rgba(255, 142, 142, 0.4)";
    dom.simWebglStatus.style.background = "rgba(88, 20, 29, 0.7)";
    dom.simWebglStatus.style.color = "#ffd7da";
  } else {
    dom.simWebglStatus.style.borderColor = "rgba(154, 208, 232, 0.4)";
    dom.simWebglStatus.style.background = "rgba(17, 46, 63, 0.7)";
    dom.simWebglStatus.style.color = "#d8efff";
  }
}

function syncCanvasSize() {
  const width = dom.glCanvas.clientWidth || 960;
  const height = dom.glCanvas.clientHeight || 540;

  if (dom.canvas.width !== width || dom.canvas.height !== height) {
    dom.canvas.width = width;
    dom.canvas.height = height;
  }
  if (dom.glCanvas.width !== width || dom.glCanvas.height !== height) {
    dom.glCanvas.width = width;
    dom.glCanvas.height = height;
  }

  const three = state.sim.three;
  if (three.ready && three.renderer && three.camera) {
    three.renderer.setSize(width, height, false);
    three.camera.aspect = width / Math.max(1, height);
    three.camera.updateProjectionMatrix();
  }
}

function smoothTowards(current, target, lambda, dt) {
  const alpha = 1 - Math.exp(-Math.max(0.0001, lambda) * Math.max(0.001, dt));
  return current + (target - current) * alpha;
}

function nextCameraMode(currentMode) {
  const idx = CAMERA_MODE_CYCLE.indexOf(currentMode);
  if (idx < 0) {
    return CAMERA_MODE_CYCLE[0];
  }
  return CAMERA_MODE_CYCLE[(idx + 1) % CAMERA_MODE_CYCLE.length];
}

function externalCameraMode(mode = state.sim.camera) {
  return EXTERNAL_CAMERA_MODES.has(mode) ? mode : "third";
}

function cameraModeLabel(mode) {
  const labels = {
    first: "first-person",
    third: "third-person",
    right: "right-side",
    front: "front-side",
    left: "left-side",
    top: "top-down",
  };
  return labels[mode] || mode;
}

function buildExternalCameraRig(mode, heading, car, bumpLift) {
  const configByMode = {
    third: {
      fov: 68,
      offsetForward: -8.6,
      offsetRight: 0,
      height: 4.2,
      lookForward: 0.2,
      lookRight: 0,
      lookHeight: 1.4,
      posLag: 4.2,
      lookLag: 5.6,
    },
    right: {
      fov: 66,
      offsetForward: -0.8,
      offsetRight: 6.4,
      height: 2.7,
      lookForward: 1.1,
      lookRight: 0,
      lookHeight: 1.35,
      posLag: 5.4,
      lookLag: 6.2,
    },
    front: {
      fov: 66,
      offsetForward: 8.2,
      offsetRight: 0,
      height: 2.8,
      lookForward: 0.15,
      lookRight: 0,
      lookHeight: 1.35,
      posLag: 5.1,
      lookLag: 6.1,
    },
    left: {
      fov: 66,
      offsetForward: -0.8,
      offsetRight: -6.4,
      height: 2.7,
      lookForward: 1.1,
      lookRight: 0,
      lookHeight: 1.35,
      posLag: 5.4,
      lookLag: 6.2,
    },
    top: {
      fov: 42,
      offsetForward: 0,
      offsetRight: 0,
      height: 22,
      lookForward: 0,
      lookRight: 0,
      lookHeight: 0.15,
      posLag: 7.5,
      lookLag: 7.5,
    },
  };
  const cfg = configByMode[externalCameraMode(mode)] || configByMode.third;
  const forwardX = Math.cos(heading);
  const forwardZ = -Math.sin(heading);
  const rightX = Math.sin(heading);
  const rightZ = Math.cos(heading);

  return {
    fov: cfg.fov,
    posLag: cfg.posLag,
    lookLag: cfg.lookLag,
    targetPos: {
      x: car.x + forwardX * cfg.offsetForward + rightX * cfg.offsetRight,
      y: cfg.height + bumpLift * 0.75,
      z: -car.y + forwardZ * cfg.offsetForward + rightZ * cfg.offsetRight,
    },
    targetLook: {
      x: car.x + forwardX * cfg.lookForward + rightX * cfg.lookRight,
      y: cfg.lookHeight + bumpLift * 0.35,
      z: -car.y + forwardZ * cfg.lookForward + rightZ * cfg.lookRight,
    },
  };
}

function showAuthFeedback(message, type = "success") {
  dom.authFeedback.textContent = message;
  dom.authFeedback.classList.remove("hidden");
  if (type === "error") {
    dom.authFeedback.style.borderColor = "rgba(255, 128, 128, 0.6)";
    dom.authFeedback.style.background = "rgba(104, 23, 33, 0.48)";
    dom.authFeedback.style.color = "#ffe1e1";
    return;
  }

  dom.authFeedback.style.borderColor = "rgba(113, 200, 163, 0.5)";
  dom.authFeedback.style.background = "rgba(22, 86, 66, 0.45)";
  dom.authFeedback.style.color = "#d8fff1";
}

function clearAuthForms() {
  dom.regUsername.value = "";
  dom.regEmail.value = "";
  dom.regPassword.value = "";
  dom.loginEmail.value = "";
  dom.loginPassword.value = "";
}

function updateAuthState() {
  if (!state.user) {
    dom.authState.textContent = "Not authenticated";
    dom.logoutBtn.disabled = true;
    dom.authGuest.classList.remove("hidden");
    dom.authUser.classList.add("hidden");
    if (dom.mapperPanel) {
      dom.mapperPanel.classList.add("hidden");
    }
    if (dom.mapperPublishRoute) {
      dom.mapperPublishRoute.disabled = true;
    }
    if (dom.mapperSaveRoute) {
      dom.mapperSaveRoute.disabled = true;
    }
    if (dom.mapperActivateMap) {
      dom.mapperActivateMap.disabled = true;
    }
    if (dom.mapperOpenMap) {
      dom.mapperOpenMap.disabled = true;
    }
    if (dom.mapperLibraryRouteFilter) {
      dom.mapperLibraryRouteFilter.disabled = true;
    }
    if (dom.mapperLibrarySearch) {
      dom.mapperLibrarySearch.disabled = true;
    }
    if (dom.mapperLibraryRefresh) {
      dom.mapperLibraryRefresh.disabled = true;
    }
    if (dom.mapperSavedMaps) {
      dom.mapperSavedMaps.disabled = true;
    }
    updateMapperLibraryStatus("Saved maps: creator login required.");
    if (dom.multiplayerRoom) {
      dom.multiplayerRoom.disabled = true;
    }
    if (dom.multiplayerJoinBtn) {
      dom.multiplayerJoinBtn.disabled = true;
    }
    if (dom.multiplayerLeaveBtn) {
      dom.multiplayerLeaveBtn.disabled = true;
    }
    setMultiplayerStatus("login required.");
    return;
  }

  dom.authState.textContent = `Logged in as ${state.user.username}${state.user.is_creator ? " (creator)" : ""}`;
  dom.logoutBtn.disabled = false;
  dom.authGuest.classList.add("hidden");
  dom.authUser.classList.remove("hidden");
  dom.authUserCopy.textContent = `Welcome, ${state.user.username}. Your account is active.`;
  if (dom.mapperPanel) {
    dom.mapperPanel.classList.toggle("hidden", !state.user.is_creator);
  }
  if (dom.mapperLibraryRouteFilter) {
    dom.mapperLibraryRouteFilter.disabled = !state.user.is_creator;
  }
  if (dom.mapperLibrarySearch) {
    dom.mapperLibrarySearch.disabled = !state.user.is_creator;
  }
  if (dom.mapperLibraryRefresh) {
    dom.mapperLibraryRefresh.disabled = !state.user.is_creator;
  }
  if (dom.mapperSavedMaps) {
    dom.mapperSavedMaps.disabled = !state.user.is_creator;
  }
  if (dom.mapperOpenMap) {
    dom.mapperOpenMap.disabled = !state.user.is_creator || !state.mapper.selectedMapId;
  }
  updateMapperMapActions();
  if (dom.multiplayerRoom) {
    dom.multiplayerRoom.disabled = false;
    if (!dom.multiplayerRoom.value.trim()) {
      dom.multiplayerRoom.value = defaultMultiplayerRoomId(dom.routeSelect?.value || "A");
    }
  }
  const multiplayerAvailable = !state.multiplayer.configLoaded || state.multiplayer.enabled;
  if (dom.multiplayerRoom) {
    dom.multiplayerRoom.disabled = !multiplayerAvailable;
  }
  if (dom.multiplayerJoinBtn) {
    dom.multiplayerJoinBtn.disabled = !multiplayerAvailable;
  }
  if (dom.multiplayerLeaveBtn) {
    dom.multiplayerLeaveBtn.disabled = !state.multiplayer.connected;
  }
  if (!multiplayerAvailable) {
    setMultiplayerStatus("disabled (missing server config).", true);
  } else if (state.multiplayer.connected && state.multiplayer.roomId) {
    setMultiplayerStatus(`connected to "${state.multiplayer.roomId}".`);
  } else {
    setMultiplayerStatus("ready.");
  }
}

function setAuth(authData) {
  state.token = authData.token;
  state.user = authData.user;
  clearAuthForms();
  updateAuthState();
  if (dom.mapperMapName && !dom.mapperMapName.value.trim()) {
    dom.mapperMapName.value = defaultMapperMapName();
  }
  if (state.user?.is_creator) {
    loadMapperMapLibrary({ preserveSelection: false }).catch((error) => {
      updateMapperLibraryStatus(`Saved maps: failed (${error.message}).`);
    });
  }
  showAuthFeedback(`Login successful. Welcome, ${state.user.username}.`);
}

function clearAuth() {
  state.token = null;
  state.user = null;
  state.examDraft = null;
  state.keys.clear();
  state.sim.sessionId = null;
  state.sim.route = null;
  state.sim.routePath = [];
  state.sim.routeDensePath = [];
  state.sim.routeBounds = null;
  state.sim.car = null;
  state.sim.sessionHeartbeatToken = null;
  state.sim.keepAliveIntervalMs = SIM_KEEPALIVE_INTERVAL_DEFAULT_MS;
  state.sim.lastKeepAliveAt = 0;
  state.sim.lastInputAt = 0;
  state.sim.idleAbandoning = false;
  state.sim.inactivityAlertPending = false;
  state.sim.inactivityAlertShown = false;
  state.sim.trafficLightManual = null;
  state.sim.trafficLightRed = true;
  state.sim.penaltyPoints = 0;
  state.sim.steerVisualAngle = 0;
  state.sim.bumpOffset = 0;
  state.sim.bumpVelocity = 0;
  state.sim.bumpSupport = 0;
  state.sim.bumpPitch = 0;
  state.sim.bumpRoll = 0;
  state.sim.lastBumpAtMs = 0;
  state.sim.bumpAxleContacts = {};
  state.sim.bumpAxleHitAtMs = {};
  state.sim.stopLineContacts = {};
  state.mapper.mapLibrary = [];
  state.mapper.selectedMapId = "";
  stopSimKeepAliveLoop();
  leaveMultiplayerRoom({ silent: true }).catch(() => {});
  if (state.sim.three.ready) {
    clearThreeGroup(state.sim.three.routeGroup);
  }
  updateAuthState();
  clearAuthForms();
  showAuthFeedback("You have logged out.");
  dom.profileOutput.textContent = "Logged out.";
  dom.toggleLightBtn.textContent = "Manual Light Override";
  hidePenaltyCard();
  updateHudOverlay();
  drawMiniMapOverlay();
  renderMapperMapLibrary();
  updateMapperLibraryStatus("Saved maps: creator login required.");
}

function authHeaders() {
  return state.token ? { Authorization: `Bearer ${state.token}` } : {};
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `HTTP ${response.status}`);
  }

  return payload;
}

function sanitizeRoomId(rawValue) {
  const normalized = String(rawValue || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized.slice(0, 40);
}

function defaultMultiplayerRoomId(routeId = dom.routeSelect?.value || "A") {
  const safeRoute = String(routeId || "A").toLowerCase();
  return `route-${safeRoute}-public`;
}

function setMultiplayerStatus(message, isError = false) {
  if (!dom.multiplayerStatus) {
    return;
  }
  dom.multiplayerStatus.textContent = `Multiplayer: ${message}`;
  dom.multiplayerStatus.style.color = isError ? "#ffdce0" : "#d0e8f2";
}

function removeRemotePlayerMarker(peerId) {
  const markers = state.sim.three.remotePlayerMarkers;
  const group = state.sim.three.remotePlayersGroup;
  const marker = markers?.get(peerId);
  if (!marker) {
    return;
  }
  const nameLabelTexture = marker.userData?.nameLabelTexture;
  if (nameLabelTexture && typeof nameLabelTexture.dispose === "function") {
    nameLabelTexture.dispose();
  }
  const nameLabelMaterial = marker.userData?.nameLabelMaterial;
  if (nameLabelMaterial && typeof nameLabelMaterial.dispose === "function") {
    nameLabelMaterial.dispose();
  }
  if (group) {
    group.remove(marker);
  }
  markers.delete(peerId);
}

function clearRemotePlayerMarkers() {
  if (state.sim.three.remotePlayerMarkers) {
    for (const peerId of state.sim.three.remotePlayerMarkers.keys()) {
      removeRemotePlayerMarker(peerId);
    }
    state.sim.three.remotePlayerMarkers.clear();
  }
}

function clearMultiplayerPeers() {
  state.multiplayer.peers.clear();
  clearRemotePlayerMarkers();
}

function signedHeadingDeltaDeg(fromDeg, toDeg) {
  let delta = normalizeHeading(toDeg) - normalizeHeading(fromDeg);
  if (delta > 180) {
    delta -= 360;
  } else if (delta < -180) {
    delta += 360;
  }
  return delta;
}

function peerRenderPose(peer) {
  return {
    x: Number.isFinite(peer?.renderX) ? peer.renderX : peer?.x,
    y: Number.isFinite(peer?.renderY) ? peer.renderY : peer?.y,
    headingDeg: Number.isFinite(peer?.renderHeadingDeg) ? peer.renderHeadingDeg : peer?.headingDeg || 0,
  };
}

function multiplayerPeerTtlMs() {
  const value = Number(state.multiplayer.peerTtlMs);
  if (Number.isFinite(value) && value > 0) {
    return Math.max(5000, value);
  }
  return MULTIPLAYER_PEER_TTL_MS;
}

function multiplayerCollisionStaleMs() {
  const ttl = multiplayerPeerTtlMs();
  const value = Number(state.multiplayer.collisionStaleMs);
  const fallback = MULTIPLAYER_COLLISION_STALE_MS;
  const base = Number.isFinite(value) && value > 0 ? value : fallback;
  return Math.max(1000, Math.min(ttl, base));
}

function multiplayerTabHiddenAfkMs() {
  const ttl = multiplayerPeerTtlMs();
  const value = Number(state.multiplayer.tabHiddenAfkMs);
  const fallback = MULTIPLAYER_TAB_HIDDEN_AFK_MS;
  const base = Number.isFinite(value) && value > 0 ? value : fallback;
  return Math.max(1000, Math.min(ttl, base));
}

function multiplayerInputIdleAfkMs() {
  const value = Number(state.multiplayer.inputIdleAfkMs);
  if (Number.isFinite(value) && value > 0) {
    return Math.max(10 * 1000, value);
  }
  return MULTIPLAYER_INPUT_IDLE_AFK_MS;
}

function peerPresenceState(peer, nowMs = Date.now()) {
  const inputIdleFlag = Boolean(peer?.isInputIdle);
  const lastInputAtMs = Number(peer?.lastInputAtMs || 0);
  const inputIdleByClock = lastInputAtMs > 0 && nowMs - lastInputAtMs >= multiplayerInputIdleAfkMs();
  return inputIdleFlag || inputIdleByClock ? "afk" : "active";
}

function updateMultiplayerPeerRenderStates(dtSec, nowMs = Date.now()) {
  if (!Number.isFinite(dtSec) || dtSec <= 0 || !state.multiplayer.peers.size) {
    return;
  }

  const alphaPos = 1 - Math.exp(-MULTIPLAYER_REMOTE_SMOOTH_RATE * dtSec);
  const alphaHeading = 1 - Math.exp(-MULTIPLAYER_REMOTE_HEADING_SMOOTH_RATE * dtSec);

  for (const peer of state.multiplayer.peers.values()) {
    if (!Number.isFinite(peer.x) || !Number.isFinite(peer.y)) {
      continue;
    }

    if (!Number.isFinite(peer.renderX) || !Number.isFinite(peer.renderY)) {
      peer.renderX = peer.x;
      peer.renderY = peer.y;
    }
    if (!Number.isFinite(peer.renderHeadingDeg)) {
      peer.renderHeadingDeg = Number.isFinite(peer.headingDeg) ? peer.headingDeg : 0;
    }

    const ageMs = Math.max(0, nowMs - Number(peer.lastSeenMs || nowMs));
    const extrapolateSec = Math.min(MULTIPLAYER_REMOTE_MAX_EXTRAPOLATE_MS, ageMs) / 1000;

    let velX = Number(peer.velX) || 0;
    let velY = Number(peer.velY) || 0;
    const velMag = Math.hypot(velX, velY);
    if (velMag > MULTIPLAYER_REMOTE_MAX_SPEED_MPS) {
      const factor = MULTIPLAYER_REMOTE_MAX_SPEED_MPS / Math.max(0.001, velMag);
      velX *= factor;
      velY *= factor;
    } else if (velMag < 0.12 && Number.isFinite(peer.speedKmh)) {
      const speedMps = Math.min(MULTIPLAYER_REMOTE_MAX_SPEED_MPS, Math.max(0, (peer.speedKmh * 1000) / 3600));
      const heading = toRadians(peer.headingDeg || 0);
      velX = Math.cos(heading) * speedMps;
      velY = Math.sin(heading) * speedMps;
    }

    const targetX = peer.x + velX * extrapolateSec;
    const targetY = peer.y + velY * extrapolateSec;
    if (Math.hypot(targetX - peer.renderX, targetY - peer.renderY) > MULTIPLAYER_REMOTE_SNAP_DISTANCE_M) {
      peer.renderX = targetX;
      peer.renderY = targetY;
    } else {
      peer.renderX += (targetX - peer.renderX) * alphaPos;
      peer.renderY += (targetY - peer.renderY) * alphaPos;
    }

    const predictedHeading = normalizeHeading(
      (peer.headingDeg || 0) + (Number(peer.headingVelDeg) || 0) * extrapolateSec,
    );
    const headingDelta = signedHeadingDeltaDeg(peer.renderHeadingDeg, predictedHeading);
    if (Math.abs(headingDelta) > 95) {
      peer.renderHeadingDeg = predictedHeading;
    } else {
      peer.renderHeadingDeg = normalizeHeading(peer.renderHeadingDeg + headingDelta * alphaHeading);
    }
  }
}

function pruneMultiplayerPeers(nowMs = Date.now()) {
  const ttlMs = Math.max(multiplayerPeerTtlMs(), simInputIdleTimeoutMs());
  for (const [peerId, peer] of state.multiplayer.peers.entries()) {
    if (nowMs - Number(peer.lastSeenMs || 0) > ttlMs) {
      state.multiplayer.peers.delete(peerId);
      removeRemotePlayerMarker(peerId);
    }
  }
}

function peersForActiveRoute(nowMs = Date.now()) {
  pruneMultiplayerPeers(nowMs);
  const routeId = state.sim.route?.routeId;
  if (!routeId) {
    return [];
  }
  const peers = [];
  for (const peer of state.multiplayer.peers.values()) {
    if (!Number.isFinite(peer.x) || !Number.isFinite(peer.y)) {
      continue;
    }
    if (routeId && peer.route_id !== routeId) {
      continue;
    }
    peers.push(peer);
  }
  return peers;
}

function hashStringToInt(input = "") {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function rotateLocalOffsetToRoute(localX, localZ, yawRad) {
  return {
    x: Math.cos(yawRad) * localX + Math.sin(yawRad) * localZ,
    y: Math.sin(yawRad) * localX - Math.cos(yawRad) * localZ,
  };
}

function buildCarCollisionBoxForPose(x, y, headingDeg) {
  const heading = toRadians(headingDeg || 0);
  const footprint = state.sim.three.vehicleFootprintLocal;
  const hasModelFootprint = Boolean(state.sim.three.vehicleModelRoot && footprint);
  const yawOffset = hasModelFootprint ? Number(state.sim.three.vehicleYawOffsetRad || 0) : 0;
  const yaw = heading + yawOffset;

  const forward = { x: Math.cos(yaw), y: Math.sin(yaw) };
  const right = { x: Math.sin(yaw), y: -Math.cos(yaw) };

  if (!hasModelFootprint) {
    const fallbackCenterOffset = 1.05;
    return {
      center: {
        x: x + Math.cos(heading) * fallbackCenterOffset,
        y: y + Math.sin(heading) * fallbackCenterOffset,
      },
      forward: { x: Math.cos(heading), y: Math.sin(heading) },
      right: { x: Math.sin(heading), y: -Math.cos(heading) },
      halfLength: 2.2,
      halfWidth: 1.03,
    };
  }

  const rawHalfLen = Math.abs(footprint.maxX - footprint.minX) * 0.5;
  const rawHalfWid = Math.abs(footprint.maxZ - footprint.minZ) * 0.5;
  const halfLength = Math.max(1.72, Math.min(2.82, rawHalfLen * 0.98));
  const halfWidth = Math.max(0.88, Math.min(1.35, rawHalfWid * 0.98));
  const centerLocalX = (footprint.minX + footprint.maxX) * 0.5;
  const centerLocalZ = (footprint.minZ + footprint.maxZ) * 0.5;
  const centerOffset = rotateLocalOffsetToRoute(centerLocalX, centerLocalZ, yaw);

  return {
    center: {
      x: x + centerOffset.x,
      y: y + centerOffset.y,
    },
    forward,
    right,
    halfLength,
    halfWidth,
  };
}

function localCarCollisionRadiusMeters() {
  const box = buildCarCollisionBoxForPose(0, 0, 0);
  return Math.hypot(box.halfLength, box.halfWidth);
}

function projectCollisionBoxOnAxis(box, axis) {
  const centerProj = box.center.x * axis.x + box.center.y * axis.y;
  const radius =
    Math.abs(box.forward.x * axis.x + box.forward.y * axis.y) * box.halfLength +
    Math.abs(box.right.x * axis.x + box.right.y * axis.y) * box.halfWidth;
  return {
    min: centerProj - radius,
    max: centerProj + radius,
  };
}

function collisionBoxesOverlapInfo(a, b) {
  const rawAxes = [a.forward, a.right, b.forward, b.right];
  let bestAxis = null;
  let bestOverlap = Number.POSITIVE_INFINITY;

  for (const rawAxis of rawAxes) {
    const len = Math.hypot(rawAxis.x, rawAxis.y);
    if (len < 0.000001) {
      continue;
    }
    const axis = { x: rawAxis.x / len, y: rawAxis.y / len };
    const pa = projectCollisionBoxOnAxis(a, axis);
    const pb = projectCollisionBoxOnAxis(b, axis);
    const overlap = Math.min(pa.max, pb.max) - Math.max(pa.min, pb.min);
    if (overlap <= 0) {
      return null;
    }
    if (overlap < bestOverlap) {
      bestOverlap = overlap;
      bestAxis = axis;
    }
  }

  if (!bestAxis) {
    return null;
  }

  const dir = {
    x: a.center.x - b.center.x,
    y: a.center.y - b.center.y,
  };
  if (dir.x * bestAxis.x + dir.y * bestAxis.y < 0) {
    bestAxis = { x: -bestAxis.x, y: -bestAxis.y };
  }

  return {
    overlap: bestOverlap,
    axis: bestAxis,
  };
}

function computeSpawnPose(route) {
  const start = route?.startPose;
  if (!start || !Number.isFinite(start.x) || !Number.isFinite(start.y) || !Number.isFinite(start.headingDeg)) {
    return null;
  }

  const heading = toRadians(start.headingDeg);
  const forward = { x: Math.cos(heading), y: Math.sin(heading) };
  const left = { x: -Math.sin(heading), y: Math.cos(heading) };
  const hash = hashStringToInt(state.user?.user_id || state.user?.username || "player");
  const laneOptions = [-2, -1, 0, 1, 2];
  const rowOptions = [0, 1, 2, 3];
  const preferredLane = laneOptions[hash % laneOptions.length];
  const preferredRow = rowOptions[Math.floor(hash / laneOptions.length) % rowOptions.length];

  const combos = [];
  for (const row of rowOptions) {
    for (const lane of laneOptions) {
      const score =
        Math.abs(lane - preferredLane) * 1.25 +
        Math.abs(row - preferredRow) * 0.9 +
        Math.abs(lane) * 0.14 +
        row * 0.08;
      combos.push({ lane, row, score });
    }
  }
  combos.sort((a, b) => a.score - b.score);

  const nowMs = Date.now();
  const peers = peersForActiveRoute(nowMs).filter((peer) => peerPresenceState(peer, nowMs) === "active");
  const fallbackMinSep = localCarCollisionRadiusMeters() * 2 + MULTIPLAYER_COLLISION_BUFFER_M;

  for (const combo of combos) {
    const offsetLeft = combo.lane * MULTIPLAYER_SPAWN_LATERAL_SPACING_M;
    const offsetBack = combo.row * MULTIPLAYER_SPAWN_LONGITUDINAL_SPACING_M;
    const x = start.x + left.x * offsetLeft - forward.x * offsetBack;
    const y = start.y + left.y * offsetLeft - forward.y * offsetBack;
    const candidateBox = buildCarCollisionBoxForPose(x, y, start.headingDeg);

    const occupied = peers.some((peer) => {
      const quickFar = Math.hypot(x - peer.x, y - peer.y) > fallbackMinSep * 1.7;
      if (quickFar) {
        return false;
      }
      const peerBox = buildCarCollisionBoxForPose(peer.x, peer.y, Number(peer.headingDeg) || start.headingDeg);
      return Boolean(collisionBoxesOverlapInfo(candidateBox, peerBox));
    });
    if (!occupied) {
      return { x, y, headingDeg: start.headingDeg };
    }
  }

  return { x: start.x, y: start.y, headingDeg: start.headingDeg };
}

function resolvePeerSolidCollisions(prevX, prevY) {
  if (!state.sim.car || !state.sim.route) {
    return;
  }

  const nowMs = Date.now();
  const peers = peersForActiveRoute(nowMs).filter((peer) => peerPresenceState(peer, nowMs) === "active");
  if (!peers.length) {
    return;
  }

  const car = state.sim.car;
  let x = car.x;
  let y = car.y;
  let hadCollision = false;
  let maxPenetration = 0;
  let localBox = buildCarCollisionBoxForPose(x, y, car.headingDeg);

  for (const peer of peers) {
    const peerBox = buildCarCollisionBoxForPose(peer.x, peer.y, Number(peer.headingDeg) || 0);
    const overlapInfo = collisionBoxesOverlapInfo(localBox, peerBox);
    if (!overlapInfo) {
      continue;
    }

    hadCollision = true;
    const penetration = overlapInfo.overlap + MULTIPLAYER_COLLISION_BUFFER_M * 0.35;
    maxPenetration = Math.max(maxPenetration, penetration);
    x += overlapInfo.axis.x * penetration;
    y += overlapInfo.axis.y * penetration;
    localBox = buildCarCollisionBoxForPose(x, y, car.headingDeg);
  }

  if (!hadCollision) {
    return;
  }

  car.x = x;
  car.y = y;
  if (maxPenetration > Math.max(localBox.halfWidth, localBox.halfLength) * 0.55) {
    car.x = prevX;
    car.y = prevY;
    car.speedKmh = 0;
    return;
  }

  const speedSign = Math.sign(car.speedKmh);
  const speedAbs = Math.abs(car.speedKmh);
  const damped = Math.max(0, speedAbs - maxPenetration * 26);
  car.speedKmh = damped < 0.8 ? 0 : speedSign * damped;
}

async function loadRealtimeConfig() {
  if (state.multiplayer.configLoaded) {
    return state.multiplayer.enabled;
  }

  state.multiplayer.configLoaded = true;
  try {
    const payload = await api("/v1/config/realtime");
    state.multiplayer.enabled = Boolean(payload?.enabled);
    state.multiplayer.url = payload?.url || "";
    state.multiplayer.anonKey = payload?.anon_key || "";
    const keepAliveSec = Number(payload?.sim_keepalive_interval_sec);
    if (Number.isFinite(keepAliveSec) && keepAliveSec > 0) {
      state.sim.keepAliveIntervalMs = Math.max(5, keepAliveSec) * 1000;
    } else {
      state.sim.keepAliveIntervalMs = SIM_KEEPALIVE_INTERVAL_DEFAULT_MS;
    }
    const inputIdleTimeoutSec = Number(payload?.sim_input_idle_timeout_sec);
    if (Number.isFinite(inputIdleTimeoutSec) && inputIdleTimeoutSec > 0) {
      state.sim.inputIdleTimeoutMs = Math.max(60, inputIdleTimeoutSec) * 1000;
    } else {
      state.sim.inputIdleTimeoutMs = SIM_INPUT_IDLE_TIMEOUT_DEFAULT_MS;
    }
    const peerTtlSec = Number(payload?.multiplayer_peer_ttl_sec);
    state.multiplayer.peerTtlMs = Number.isFinite(peerTtlSec) && peerTtlSec > 0 ? Math.max(5, peerTtlSec) * 1000 : 0;
    const collisionStaleSec = Number(payload?.multiplayer_collision_stale_sec);
    state.multiplayer.collisionStaleMs =
      Number.isFinite(collisionStaleSec) && collisionStaleSec > 0 ? Math.max(1, collisionStaleSec) * 1000 : 0;
    const hiddenAfkSec = Number(payload?.multiplayer_tab_hidden_afk_sec);
    state.multiplayer.tabHiddenAfkMs =
      Number.isFinite(hiddenAfkSec) && hiddenAfkSec > 0 ? Math.max(1, hiddenAfkSec) * 1000 : 0;
    const inputIdleAfkSec = Number(payload?.multiplayer_input_idle_afk_sec);
    state.multiplayer.inputIdleAfkMs =
      Number.isFinite(inputIdleAfkSec) && inputIdleAfkSec > 0 ? Math.max(10, inputIdleAfkSec) * 1000 : 0;
    if (!state.multiplayer.enabled) {
      setMultiplayerStatus("disabled (missing server config).");
    }
    return state.multiplayer.enabled;
  } catch {
    state.multiplayer.enabled = false;
    setMultiplayerStatus("unavailable.");
    return false;
  }
}

async function loadSupabaseRealtimeLib() {
  if (state.multiplayer.lib) {
    return state.multiplayer.lib;
  }
  const lib = await import("@supabase/supabase-js");
  state.multiplayer.lib = lib;
  return lib;
}

async function ensureMultiplayerClient() {
  const available = await loadRealtimeConfig();
  if (!available || !state.multiplayer.url || !state.multiplayer.anonKey) {
    throw new Error("Multiplayer is not configured on the server.");
  }
  if (state.multiplayer.client) {
    return state.multiplayer.client;
  }

  const lib = await loadSupabaseRealtimeLib();
  state.multiplayer.client = lib.createClient(state.multiplayer.url, state.multiplayer.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    realtime: {
      params: { eventsPerSecond: 18 },
    },
  });
  return state.multiplayer.client;
}

async function leaveMultiplayerRoom(options = {}) {
  const { silent = false } = options;
  const mp = state.multiplayer;
  if (mp.client && mp.channel) {
    try {
      await mp.client.removeChannel(mp.channel);
    } catch {
      // ignore disconnect errors
    }
  }
  mp.channel = null;
  mp.connected = false;
  mp.roomId = "";
  mp.lastBroadcastAt = 0;
  if (mp.heartbeatTimer) {
    clearInterval(mp.heartbeatTimer);
    mp.heartbeatTimer = null;
  }
  clearMultiplayerPeers();
  if (dom.multiplayerLeaveBtn) {
    dom.multiplayerLeaveBtn.disabled = true;
  }
  if (!silent) {
    setMultiplayerStatus("disconnected.");
  }
}

async function joinMultiplayerRoom(roomInput = "") {
  if (!state.user) {
    throw new Error("Login first");
  }
  const client = await ensureMultiplayerClient();
  const roomId = sanitizeRoomId(roomInput || dom.multiplayerRoom?.value || defaultMultiplayerRoomId());
  if (!roomId) {
    throw new Error("Set a valid room id.");
  }

  if (state.multiplayer.connected && state.multiplayer.roomId === roomId) {
    setMultiplayerStatus(`connected to "${roomId}".`);
    return roomId;
  }

  await leaveMultiplayerRoom({ silent: true });
  state.multiplayer.roomId = roomId;
  if (dom.multiplayerRoom) {
    dom.multiplayerRoom.value = roomId;
  }

  const channel = client.channel(`drive-room:${roomId}`, {
    config: {
      broadcast: {
        self: false,
        ack: false,
      },
    },
  });

  channel.on("broadcast", { event: "pose" }, ({ payload }) => {
    if (!payload || payload.user_id === state.user?.user_id) {
      return;
    }
    const peerX = Number(payload.x);
    const peerY = Number(payload.y);
    if (!Number.isFinite(peerX) || !Number.isFinite(peerY)) {
      return;
    }
    const nowMs = Date.now();
    const headingDeg = Number(payload.headingDeg) || 0;
    const speedKmh = Number(payload.speedKmh) || 0;
    const hiddenFlag = Boolean(payload.hidden);
    const inputIdleFlag = Boolean(payload.input_idle);
    const remoteLastInputAtMs = Number(payload.last_input_at_ms) || 0;
    const existing = state.multiplayer.peers.get(payload.user_id);
    if (!existing) {
      state.multiplayer.peers.set(payload.user_id, {
        user_id: payload.user_id,
        username: payload.username || "player",
        route_id: payload.route_id || "",
        x: peerX,
        y: peerY,
        headingDeg,
        speedKmh,
        isHidden: hiddenFlag,
        hiddenSinceMs: hiddenFlag ? nowMs : 0,
        isInputIdle: inputIdleFlag,
        lastInputAtMs: remoteLastInputAtMs,
        velX: 0,
        velY: 0,
        headingVelDeg: 0,
        renderX: peerX,
        renderY: peerY,
        renderHeadingDeg: headingDeg,
        lastSeenMs: nowMs,
      });
      return;
    }

    const dtSec = Math.max(0.016, (nowMs - Number(existing.lastSeenMs || nowMs)) / 1000);
    const instVelX = (peerX - Number(existing.x || peerX)) / dtSec;
    const instVelY = (peerY - Number(existing.y || peerY)) / dtSec;
    const headingDeltaDeg = signedHeadingDeltaDeg(Number(existing.headingDeg || headingDeg), headingDeg);
    const instHeadingVel = headingDeltaDeg / dtSec;

    existing.user_id = payload.user_id;
    existing.username = payload.username || existing.username || "player";
    existing.route_id = payload.route_id || "";
    existing.x = peerX;
    existing.y = peerY;
    existing.headingDeg = headingDeg;
    existing.speedKmh = speedKmh;
    if (hiddenFlag) {
      if (!existing.isHidden) {
        existing.hiddenSinceMs = nowMs;
      }
    } else {
      existing.hiddenSinceMs = 0;
    }
    existing.isHidden = hiddenFlag;
    existing.isInputIdle = inputIdleFlag;
    existing.lastInputAtMs = remoteLastInputAtMs;
    existing.velX = Number.isFinite(existing.velX) ? existing.velX * 0.45 + instVelX * 0.55 : instVelX;
    existing.velY = Number.isFinite(existing.velY) ? existing.velY * 0.45 + instVelY * 0.55 : instVelY;
    existing.headingVelDeg = Number.isFinite(existing.headingVelDeg)
      ? existing.headingVelDeg * 0.45 + instHeadingVel * 0.55
      : instHeadingVel;
    if (!Number.isFinite(existing.renderX) || !Number.isFinite(existing.renderY)) {
      existing.renderX = peerX;
      existing.renderY = peerY;
    }
    if (!Number.isFinite(existing.renderHeadingDeg)) {
      existing.renderHeadingDeg = headingDeg;
    }
    existing.lastSeenMs = nowMs;
    state.multiplayer.peers.set(payload.user_id, existing);
  });

  state.multiplayer.channel = channel;
  setMultiplayerStatus(`connecting to "${roomId}"...`);

  await new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error("Multiplayer connection timeout."));
    }, 5000);

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        state.multiplayer.connected = true;
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          resolve();
        }
        return;
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        state.multiplayer.connected = false;
        if (status === "CLOSED") {
          setMultiplayerStatus("disconnected.");
        } else {
          setMultiplayerStatus(`channel error (${status}).`, true);
        }
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(new Error(`Realtime channel error (${status}).`));
        }
      }
    });
  });

  setMultiplayerStatus(`connected to "${roomId}".`);
  if (dom.multiplayerLeaveBtn) {
    dom.multiplayerLeaveBtn.disabled = false;
  }
  if (state.multiplayer.heartbeatTimer) {
    clearInterval(state.multiplayer.heartbeatTimer);
  }
  state.multiplayer.heartbeatTimer = setInterval(() => {
    // Keep publishing even if animation frames are throttled on background tabs.
    broadcastLocalPose(Date.now());
  }, 320);
  return roomId;
}

async function ensureMultiplayerRoomForRoute(routeId) {
  const candidate = sanitizeRoomId(dom.multiplayerRoom?.value || "") || defaultMultiplayerRoomId(routeId);
  if (dom.multiplayerRoom && !dom.multiplayerRoom.value.trim()) {
    dom.multiplayerRoom.value = candidate;
  }
  if (!state.multiplayer.connected || state.multiplayer.roomId !== candidate) {
    await joinMultiplayerRoom(candidate);
  }
}

function isLocalInputIdleForPresence(nowMs = Date.now()) {
  const lastInputAt = Number(state.sim.lastInputAt || 0);
  if (!lastInputAt) {
    return true;
  }
  return nowMs - lastInputAt >= multiplayerInputIdleAfkMs();
}

function broadcastLocalPose(nowMs = Date.now(), options = {}) {
  const force = Boolean(options.force);
  const mp = state.multiplayer;
  if (!mp.connected || !mp.channel || !state.user || !state.sim.sessionId || !state.sim.route || !state.sim.car) {
    return;
  }
  if (!force && nowMs - mp.lastBroadcastAt < mp.broadcastEveryMs) {
    return;
  }
  mp.lastBroadcastAt = nowMs;

  const payload = {
    user_id: state.user.user_id,
    username: state.user.username,
    route_id: state.sim.route.routeId,
    x: Number(state.sim.car.x.toFixed(3)),
    y: Number(state.sim.car.y.toFixed(3)),
    headingDeg: Number(state.sim.car.headingDeg.toFixed(3)),
    speedKmh: Number(state.sim.car.speedKmh.toFixed(3)),
    hidden: document.hidden ? 1 : 0,
    input_idle: isLocalInputIdleForPresence(nowMs) ? 1 : 0,
    last_input_at_ms: Number(state.sim.lastInputAt || 0),
    sentAtMs: Date.now(),
  };

  const sent = mp.channel.send({
    type: "broadcast",
    event: "pose",
    payload,
  });
  if (sent && typeof sent.catch === "function") {
    sent.catch(() => {});
  }
}

function renderTableRows(body, rows, columns) {
  body.innerHTML = "";
  for (const row of rows) {
    const tr = document.createElement("tr");
    for (const column of columns) {
      const td = document.createElement("td");
      td.textContent = row[column];
      tr.appendChild(td);
    }
    body.appendChild(tr);
  }
}

async function register() {
  const username = dom.regUsername.value.trim();
  const email = dom.regEmail.value.trim();
  const password = dom.regPassword.value;

  const payload = await api("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

  setAuth(payload);
}

async function login() {
  const email = dom.loginEmail.value.trim();
  const password = dom.loginPassword.value;

  const payload = await api("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAuth(payload);
}

async function createExam() {
  if (!state.token) {
    throw new Error("Login first");
  }

  const draft = await api("/v1/exams/attempts", {
    method: "POST",
    headers: authHeaders(),
  });

  state.examDraft = draft;
  dom.examOutput.textContent = formatJson({
    attempt_id: draft.attempt_id,
    questionCount: draft.questions.length,
    ruleConfig: draft.config,
  });
}

function randomOption() {
  const options = ["A", "B", "C", "D"];
  return options[Math.floor(Math.random() * options.length)];
}

async function submitExam(perfect = false) {
  if (!state.examDraft) {
    throw new Error("Create an exam first");
  }

  const answers = {};
  for (const question of state.examDraft.questions) {
    if (perfect && question.debugCorrectOption) {
      answers[question.id] = question.debugCorrectOption;
    } else {
      answers[question.id] = randomOption();
    }
  }

  const result = await api(`/v1/exams/attempts/${state.examDraft.attempt_id}/submit`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ answers, duration_sec: 700 }),
  });

  dom.examOutput.textContent = formatJson(result);
  state.examDraft = null;
}

function buildRoutePath(route) {
  if (Array.isArray(route.path) && route.path.length >= 2) {
    const mapped = route.path.map((point, index) => ({
      x: Number(point.x),
      y: Number(point.y),
      id: point.id || `wp_${index + 1}`,
      type: point.type || "path",
      move: Boolean(point.move),
      meta: point.meta || {},
    }));

    const first = mapped[0];
    if (
      route.startPose &&
      Number.isFinite(route.startPose.x) &&
      Number.isFinite(route.startPose.y) &&
      Math.hypot(first.x - route.startPose.x, first.y - route.startPose.y) > 0.25
    ) {
      mapped.unshift({
        x: route.startPose.x,
        y: route.startPose.y,
        type: "start",
        id: "start",
        move: true,
      });
    } else {
      first.type = "start";
      first.id = first.id || "start";
      first.move = true;
    }

    return mapped;
  }

  const fallback = [{ x: route.startPose.x, y: route.startPose.y, type: "start", id: "start" }];
  for (const checkpoint of route.checkpoints) {
    fallback.push({
      x: checkpoint.x,
      y: checkpoint.y,
      id: checkpoint.id,
      type: checkpoint.type,
      meta: checkpoint.meta,
    });
  }
  return fallback;
}

function densifyPath(points, step = 2.2) {
  if (!points.length) {
    return [];
  }

  if (points.length < 2) {
    return points.map((p) => ({ x: p.x, y: p.y, move: Boolean(p.move) }));
  }

  const dense = [];
  dense.push({ x: points[0].x, y: points[0].y, move: Boolean(points[0].move) });

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];

    if (next.move) {
      dense.push({ x: next.x, y: next.y, move: true });
      continue;
    }

    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const dist = Math.hypot(dx, dy);
    const slices = Math.max(1, Math.ceil(dist / step));

    for (let j = 1; j <= slices; j += 1) {
      const t = j / slices;
      dense.push({
        x: current.x + dx * t,
        y: current.y + dy * t,
        move: false,
      });
    }
  }

  return dense;
}

function splitContinuousPathSegments(points) {
  if (!Array.isArray(points) || !points.length) {
    return [];
  }
  const segments = [];
  let current = [];
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    if (!point) {
      continue;
    }
    if (i === 0 || point.move) {
      if (current.length >= 2) {
        segments.push(current);
      }
      current = [{ x: Number(point.x), y: Number(point.y) }];
    } else {
      current.push({ x: Number(point.x), y: Number(point.y) });
    }
  }
  if (current.length >= 2) {
    segments.push(current);
  }
  return segments;
}

function chaikinSmoothSegment(segment, iterations = ROAD_RENDER_SMOOTH_ITERATIONS) {
  let result = segment.map((point) => ({ x: point.x, y: point.y }));
  for (let iter = 0; iter < iterations; iter += 1) {
    if (result.length < 3) {
      break;
    }
    const next = [result[0]];
    for (let i = 0; i < result.length - 1; i += 1) {
      const a = result[i];
      const b = result[i + 1];
      next.push({
        x: a.x * 0.75 + b.x * 0.25,
        y: a.y * 0.75 + b.y * 0.25,
      });
      next.push({
        x: a.x * 0.25 + b.x * 0.75,
        y: a.y * 0.25 + b.y * 0.75,
      });
    }
    next.push(result[result.length - 1]);
    result = next;
  }
  return result;
}

function isNearLockedRenderCorner(point, lockedCorners, toleranceSq = 0.01) {
  if (!point || !Array.isArray(lockedCorners) || !lockedCorners.length) {
    return false;
  }
  for (const corner of lockedCorners) {
    const dx = Number(point.x) - Number(corner.x);
    const dy = Number(point.y) - Number(corner.y);
    if (dx * dx + dy * dy <= toleranceSq) {
      return true;
    }
  }
  return false;
}

function collectRenderLockedCorners() {
  const checkpoints = state.sim.route?.checkpoints || [];
  const routePath = state.sim.routePath;
  if (!Array.isArray(checkpoints) || !checkpoints.length || !Array.isArray(routePath) || routePath.length < 2) {
    return [];
  }

  const corners = [];
  for (const checkpoint of checkpoints) {
    if (checkpoint?.type !== "lane_profile_3") {
      continue;
    }
    const profile = laneProfile3RuntimeMeta(checkpoint, routePath);
    if (!profile || profile.expansionMode !== "trim_previous") {
      continue;
    }
    const node = routePath[profile.startNodeIndex];
    if (!node || !Number.isFinite(node.x) || !Number.isFinite(node.y)) {
      continue;
    }
    corners.push({ x: node.x, y: node.y });
  }
  return corners;
}

function chaikinSmoothSegmentWithLockedCorners(
  segment,
  lockedCorners,
  iterations = ROAD_RENDER_SMOOTH_ITERATIONS,
) {
  if (!Array.isArray(segment) || segment.length < 3 || !Array.isArray(lockedCorners) || !lockedCorners.length) {
    return chaikinSmoothSegment(segment, iterations);
  }

  const pieces = [];
  let current = [{ x: segment[0].x, y: segment[0].y }];
  for (let i = 1; i < segment.length - 1; i += 1) {
    const point = segment[i];
    current.push({ x: point.x, y: point.y });
    if (isNearLockedRenderCorner(point, lockedCorners)) {
      if (current.length >= 2) {
        pieces.push(current);
      }
      current = [{ x: point.x, y: point.y }];
    }
  }
  current.push({ x: segment[segment.length - 1].x, y: segment[segment.length - 1].y });
  if (current.length >= 2) {
    pieces.push(current);
  }

  if (!pieces.length) {
    return chaikinSmoothSegment(segment, iterations);
  }

  const merged = [];
  for (let i = 0; i < pieces.length; i += 1) {
    const smoothed = chaikinSmoothSegment(pieces[i], iterations);
    for (let j = 0; j < smoothed.length; j += 1) {
      if (merged.length && j === 0) {
        continue;
      }
      merged.push(smoothed[j]);
    }
  }
  return merged;
}

function smoothRenderPath(points) {
  const segments = splitContinuousPathSegments(points);
  if (!segments.length) {
    return Array.isArray(points) ? points : [];
  }
  const lockedCorners = collectRenderLockedCorners();
  const output = [];
  for (let s = 0; s < segments.length; s += 1) {
    const smoothed = chaikinSmoothSegmentWithLockedCorners(
      segments[s],
      lockedCorners,
      ROAD_RENDER_SMOOTH_ITERATIONS,
    );
    for (let i = 0; i < smoothed.length; i += 1) {
      output.push({
        x: smoothed[i].x,
        y: smoothed[i].y,
        move: i === 0,
      });
    }
  }
  return output;
}

function computeRouteBounds(points) {
  if (!points.length) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, maxX, minY, maxY };
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function worldToLocal(x, y) {
  const car = state.sim.car;
  if (!car) {
    return { forward: 0, right: 0 };
  }

  const dx = x - car.x;
  const dy = y - car.y;
  const heading = toRadians(car.headingDeg);

  const forward = dx * Math.cos(heading) + dy * Math.sin(heading);
  // Positive local-right must match right-hand side in world space for y-up coordinates.
  const right = dx * Math.sin(heading) - dy * Math.cos(heading);

  return { forward, right };
}

function projectPerspective(localRight, localForward, horizonY) {
  if (localForward <= 1.15) {
    return null;
  }

  const focal = dom.canvas.width * 0.46;
  const cameraHeight = 4.1;

  const x = dom.canvas.width / 2 + (localRight / localForward) * focal;
  const y = horizonY + (cameraHeight / localForward) * focal;

  return { x, y };
}

function colorForCheckpoint(checkpointType) {
  if (checkpointType === "traffic_light") {
    return isTrafficLightRed() ? "#f34f5f" : "#29c18f";
  }

  const palette = {
    speed_zone: "#45b6ff",
    roundabout: "#ff9e3d",
    parking_parallel: "#ffd166",
    parking_diagonal: "#ba68ff",
    stop_line: "#f5f8ff",
    stop_line_free: "#dce8ff",
    speed_bump: "#ff9554",
    lane_add: "#8f9bff",
    start_canopy: "#6ea8ff",
    tree: "#4fc46b",
    guard_tower: "#c8d8ff",
    start: "#9fd3ff",
  };

  return palette[checkpointType] || "#9fd3ff";
}

function isTrafficLightRed() {
  if (state.sim.trafficLightManual !== null) {
    return state.sim.trafficLightManual;
  }

  if (!state.sim.sessionId) {
    return state.sim.trafficLightRed;
  }

  const elapsedSec = Math.max(0, (Date.now() - state.sim.startedAt) / 1000);
  const cycleIndex = Math.floor(elapsedSec / state.sim.trafficLightCycleSec);
  return cycleIndex % 2 === 0;
}

function trafficLightSecondsRemaining() {
  if (!state.sim.sessionId || state.sim.trafficLightManual !== null) {
    return null;
  }

  const elapsedSec = Math.max(0, (Date.now() - state.sim.startedAt) / 1000);
  const inCycle = elapsedSec % state.sim.trafficLightCycleSec;
  return Math.max(1, Math.ceil(state.sim.trafficLightCycleSec - inCycle));
}

function normalizeHeadingDeltaRad(a, b) {
  let delta = a - b;
  while (delta > Math.PI) {
    delta -= Math.PI * 2;
  }
  while (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return Math.abs(delta);
}

function routeFrameAt(x, y, preferredHeading = null, preferredSegmentIndex = null) {
  const routePath = state.sim.routePath?.length ? state.sim.routePath : state.sim.routeDensePath;
  if (routePath.length >= 2) {
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    const useHeadingHint = Number.isFinite(preferredHeading);
    const useSegmentHint = Number.isFinite(preferredSegmentIndex);

    const evaluateSegment = (i) => {
      const a = routePath[i];
      const b = routePath[i + 1];
      if (!a || !b || b.move) {
        return null;
      }

      const abx = b.x - a.x;
      const aby = b.y - a.y;
      const abLenSq = abx * abx + aby * aby;
      if (abLenSq < 1e-6) {
        return null;
      }
      const abLen = Math.sqrt(abLenSq);

      const apx = x - a.x;
      const apy = y - a.y;
      const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
      const qx = a.x + abx * t;
      const qy = a.y + aby * t;
      const distSq = (x - qx) ** 2 + (y - qy) ** 2;
      const heading = Math.atan2(aby, abx);
      let score = distSq;
      if (useHeadingHint) {
        // Disambiguate nearby parallel/intersecting segments using mapper-stored heading.
        const delta = normalizeHeadingDeltaRad(heading, preferredHeading);
        const headingPenaltyM = delta * 6;
        score += headingPenaltyM * headingPenaltyM;
      }
      return { abx, aby, abLen, t, qx, qy, heading, distSq, score, segmentIndex: i };
    };

    for (let i = 0; i < routePath.length - 1; i += 1) {
      const candidate = evaluateSegment(i);
      if (!candidate) {
        continue;
      }
      if (candidate.score < bestScore) {
        bestScore = candidate.score;
        best = candidate;
      }
    }

    if (useSegmentHint && preferredSegmentIndex >= 0 && preferredSegmentIndex < routePath.length - 1) {
      const preferredCandidate = evaluateSegment(preferredSegmentIndex);
      // At intersections, keep user-selected segment when still close enough.
      if (preferredCandidate && preferredCandidate.distSq <= 64) {
        best = preferredCandidate;
      }
    }

    if (best) {
      const heading = Math.atan2(best.aby, best.abx);
      const dir = { x: Math.cos(heading), y: Math.sin(heading) };
      const right = { x: Math.sin(heading), y: -Math.cos(heading) };
      const lateral = (x - best.qx) * right.x + (y - best.qy) * right.y;
      return {
        heading,
        dir,
        right,
        center: { x: best.qx, y: best.qy },
        lateral,
        segmentIndex: best.segmentIndex,
        segmentT: best.t,
        segmentLength: best.abLen,
      };
    }
  }

  const heading = toRadians(state.sim.car?.headingDeg ?? 0);
  return {
    heading,
    dir: { x: Math.cos(heading), y: Math.sin(heading) },
    right: { x: Math.sin(heading), y: -Math.cos(heading) },
    center: { x, y },
    lateral: 0,
    segmentIndex: null,
    segmentT: 0,
    segmentLength: 0,
  };
}

function routeHeadingAt(x, y) {
  return routeFrameAt(x, y).heading;
}

function checkpointHeadingAt(checkpoint) {
  const headingDeg = Number(checkpoint?.meta?.headingDeg);
  if (Number.isFinite(headingDeg)) {
    return toRadians(headingDeg);
  }
  return routeHeadingAt(checkpoint.x, checkpoint.y);
}

function clamp01(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function lerpNumber(a, b, t) {
  return a + (b - a) * clamp01(t);
}

function routeSegmentLength(path, segmentIndex) {
  const i = Math.max(0, Math.round(Number(segmentIndex) || 0));
  const a = path[i];
  const b = path[i + 1];
  if (!a || !b || b.move) {
    return 0;
  }
  return Math.hypot(Number(b.x) - Number(a.x), Number(b.y) - Number(a.y));
}

function laneProfile3RuntimeMeta(checkpoint, routePath) {
  const meta = checkpoint?.meta && typeof checkpoint.meta === "object" ? checkpoint.meta : null;
  if (!meta || !Array.isArray(routePath) || routePath.length < 2) {
    return null;
  }

  let startNodeIndex = Math.round(Number(meta.startNodeIndex));
  let endNodeIndex = Math.round(Number(meta.endNodeIndex));
  let startAnchorSide = meta.startAnchorSide === "left" ? "left" : "right";
  let endAnchorSide = meta.endAnchorSide === "left" ? "left" : "right";

  if (!Number.isFinite(startNodeIndex) || !Number.isFinite(endNodeIndex)) {
    const startSegFallback = Math.round(Number(meta.startSegmentIndex));
    const endSegFallback = Math.round(Number(meta.endSegmentIndex));
    if (!Number.isFinite(startSegFallback) || !Number.isFinite(endSegFallback)) {
      return null;
    }
    startNodeIndex = Math.max(0, Math.min(routePath.length - 2, startSegFallback));
    endNodeIndex = Math.max(startNodeIndex + 1, Math.min(routePath.length - 1, endSegFallback + 1));
  }

  startNodeIndex = Math.max(0, Math.min(routePath.length - 1, startNodeIndex));
  endNodeIndex = Math.max(0, Math.min(routePath.length - 1, endNodeIndex));
  if (endNodeIndex < startNodeIndex) {
    [startNodeIndex, endNodeIndex] = [endNodeIndex, startNodeIndex];
    [startAnchorSide, endAnchorSide] = [endAnchorSide, startAnchorSide];
  }
  if (endNodeIndex - startNodeIndex < 1) {
    return null;
  }
  for (let i = startNodeIndex + 1; i <= endNodeIndex; i += 1) {
    if (routePath[i]?.move) {
      return null;
    }
  }

  const startSegmentIndex = startNodeIndex;
  const endSegmentIndex = endNodeIndex - 1;
  if (endSegmentIndex < startSegmentIndex) {
    return null;
  }

  let totalLength = 0;
  for (let i = startSegmentIndex; i <= endSegmentIndex; i += 1) {
    const len = routeSegmentLength(routePath, i);
    if (len <= 1e-5) {
      continue;
    }
    totalLength += len;
  }
  if (totalLength <= 1e-5) {
    return null;
  }

  return {
    startNodeIndex,
    endNodeIndex,
    startSegmentIndex,
    endSegmentIndex,
    startAnchorSide,
    endAnchorSide,
    expansionMode: meta.expansionMode === "trim_previous" ? "trim_previous" : "node",
    transitionLengthM: Math.max(
      LANE_PROFILE_TRANSITION_MIN_M,
      Math.min(LANE_PROFILE_TRANSITION_MAX_M, Number(meta.transitionLengthM) || LANE_PROFILE_TRANSITION_DEFAULT_M),
    ),
    totalLength,
  };
}

function laneProfile3StateAtFrame(frame, checkpoints, routePath) {
  const frameSeg = Math.round(Number(frame?.segmentIndex));
  if (!Number.isFinite(frameSeg) || !Array.isArray(checkpoints) || !checkpoints.length) {
    return null;
  }

  for (const checkpoint of checkpoints) {
    if (checkpoint?.type !== "lane_profile_3") {
      continue;
    }
    const profile = laneProfile3RuntimeMeta(checkpoint, routePath);
    if (!profile) {
      continue;
    }
    const trimPrevMode = profile.expansionMode === "trim_previous";
    if (frameSeg < profile.startSegmentIndex || frameSeg > profile.endSegmentIndex) {
      continue;
    }

    let d = 0;
    for (let i = profile.startSegmentIndex; i <= profile.endSegmentIndex; i += 1) {
      const len = routeSegmentLength(routePath, i);
      if (i < frameSeg) {
        d += len;
      } else if (i === frameSeg) {
        d += len * clamp01(Number(frame.segmentT));
      }
    }

    const L = profile.totalLength;
    const Lt = Math.max(
      LANE_PROFILE_TRANSITION_MIN_M,
      Math.min(LANE_PROFILE_TRANSITION_MAX_M, Number(profile.transitionLengthM) || LANE_PROFILE_TRANSITION_DEFAULT_M),
    );

    // trim_previous = instant expansion at the start node (entry transition fixed to 0m),
    // while keeping configured transition for the exit end of the 3L tramo.
    const entry = trimPrevMode ? 1 : clamp01(d / Math.max(0.0001, Lt));
    const exit = clamp01((L - d) / Math.max(0.0001, Lt));
    const w = ROAD_EXTRA_LANE_WIDTH_M * Math.min(entry, exit);
    if (w <= 1e-4) {
      return {
        ...profile,
        d,
        w: 0,
        s: profile.startAnchorSide === "right" ? 1 : -1,
      };
    }

    const sStart = profile.startAnchorSide === "right" ? 1 : -1;
    const sEnd = profile.endAnchorSide === "right" ? 1 : -1;
    const dClamp = Math.max(0, Math.min(L, d));
    let s;
    if (L <= 2 * Lt) {
      s = lerpNumber(sStart, sEnd, dClamp / Math.max(0.0001, L));
    } else if (dClamp <= Lt) {
      s = sStart;
    } else if (dClamp >= L - Lt) {
      s = sEnd;
    } else {
      s = lerpNumber(sStart, sEnd, (dClamp - Lt) / Math.max(0.0001, L - 2 * Lt));
    }
    return {
      ...profile,
      d,
      w,
      s: Math.max(-1, Math.min(1, s)),
    };
  }

  return null;
}

function routeLaneDividerOffsets(halfWidths) {
  const left = Number(halfWidths?.left) || ROAD_BASE_WIDTH_M * 0.5;
  const right = Number(halfWidths?.right) || ROAD_BASE_WIDTH_M * 0.5;
  const totalExtra = Math.max(0, left + right - ROAD_BASE_WIDTH_M);
  if (totalExtra < 0.12) {
    return [0];
  }
  const blend = Math.max(0, Math.min(1, totalExtra / Math.max(0.0001, ROAD_EXTRA_LANE_WIDTH_M)));
  const sideBias = Math.max(-1, Math.min(1, (right - left) / Math.max(0.0001, totalExtra)));
  const t = (sideBias + 1) * 0.5;
  const leftDivider = (-ROAD_BASE_WIDTH_M * 0.5 + ROAD_BASE_WIDTH_M * 0.5 * t) * blend;
  const rightDivider = (ROAD_BASE_WIDTH_M * 0.5 * t) * blend;
  if (Math.abs(leftDivider - rightDivider) < 0.08) {
    return [leftDivider];
  }
  return [leftDivider, rightDivider];
}

function routeLaneDividerOffsetsForSegment(path, segmentIndex) {
  const i = Math.max(0, Math.round(Number(segmentIndex) || 0));
  const a = path?.[i];
  const b = path?.[i + 1];
  if (!a || !b || b.move) {
    return [];
  }
  const midX = (a.x + b.x) * 0.5;
  const midY = (a.y + b.y) * 0.5;
  const heading = Math.atan2(b.y - a.y, b.x - a.x);
  const halfWidths = routeRoadHalfWidthsAt(midX, midY, heading, i);
  return routeLaneDividerOffsets(halfWidths);
}

function hasLaneDividerOffsetMatch(offset, candidates, tolerance = 0.42) {
  if (!Array.isArray(candidates) || !candidates.length) {
    return false;
  }
  for (const candidate of candidates) {
    if (Math.abs(Number(candidate) - Number(offset)) <= tolerance) {
      return true;
    }
  }
  return false;
}

function routeRoadHalfWidthsAt(x, y, preferredHeading = null, preferredSegmentIndex = null) {
  const frame = routeFrameAt(x, y, preferredHeading, preferredSegmentIndex);
  const routePath = state.sim.routePath?.length ? state.sim.routePath : state.sim.routeDensePath;
  let laneCount = 2;
  const checkpoints = state.sim.route?.checkpoints || [];

  for (const checkpoint of checkpoints) {
    const dist = Math.hypot(x - checkpoint.x, y - checkpoint.y);
    if (dist > 16) {
      continue;
    }

    // Keep base carriageway width stable; parking is rendered as an external extension,
    // not as extra through-lanes in the main road.
    if (
      (checkpoint.type === "parking_parallel" || checkpoint.type === "parking_diagonal") &&
      checkpoint.meta?.extendRoad === true
    ) {
      laneCount = Math.max(laneCount, 3);
    }
    if (
      checkpoint.type === "speed_bump" ||
      checkpoint.type === "stop_line" ||
      checkpoint.type === "stop_line_free"
    ) {
      laneCount = Math.max(laneCount, Math.round(Number(checkpoint.meta?.laneCount) || 2));
    }
  }

  const defaultBaseHalf = ROAD_BASE_WIDTH_M * 0.5;
  let leftHalf = (laneCount >= 3 ? ROAD_THREE_LANE_WIDTH_M : ROAD_BASE_WIDTH_M) * 0.5;
  let rightHalf = leftHalf;

  const profileState = laneProfile3StateAtFrame(frame, checkpoints, routePath);
  const profileActive = Boolean(profileState);
  if (profileState) {
    const s = Math.max(-1, Math.min(1, Number(profileState.s) || 0));
    const w = Math.max(0, Number(profileState.w) || 0);
    leftHalf = defaultBaseHalf + ((1 - s) * w) / 2;
    rightHalf = defaultBaseHalf + ((1 + s) * w) / 2;
    if (w > 0.08) {
      laneCount = Math.max(laneCount, 3);
    }
  }

  for (const checkpoint of checkpoints) {
    if (checkpoint.type !== "lane_add") {
      continue;
    }
    if (profileActive) {
      // lane_profile_3 has priority over lane_add on overlapping segments.
      continue;
    }

    const dist = Math.hypot(x - checkpoint.x, y - checkpoint.y);
    const cpSeg = Number(checkpoint.meta?.snapSegmentIndex);
    const frameSeg = Number(frame.segmentIndex);
    if (Number.isFinite(cpSeg) && Number.isFinite(frameSeg)) {
      // Keep +1 lane scoped to the exact selected tramo only.
      if (Math.round(cpSeg) !== Math.round(frameSeg)) {
        continue;
      }
    } else if (dist > LANE_ADD_EFFECT_RADIUS_M) {
      continue;
    }

    let sideSign = Math.sign(Number(checkpoint.meta?.sideSign) || 0);
    if (!sideSign) {
      const lateral =
        (checkpoint.x - frame.center.x) * frame.right.x +
        (checkpoint.y - frame.center.y) * frame.right.y;
      sideSign = Math.sign(lateral) || 1;
    }
    const extraLanes = Math.max(1, Math.min(2, Math.round(Number(checkpoint.meta?.extraLanes) || 1)));
    const baseHalf = defaultBaseHalf;
    const addedWidth = ROAD_EXTRA_LANE_WIDTH_M * extraLanes;
    if (sideSign > 0) {
      rightHalf = Math.max(rightHalf, baseHalf + addedWidth);
    } else {
      leftHalf = Math.max(leftHalf, baseHalf + addedWidth);
    }
    laneCount = Math.max(laneCount, 2 + extraLanes);
  }

  const roadWidth = leftHalf + rightHalf;
  return {
    left: leftHalf,
    right: rightHalf,
    roadWidth,
    laneCount,
    frame,
    extraWidth: Math.max(0, roadWidth - ROAD_BASE_WIDTH_M),
    profileState,
  };
}

function routeRoadWidthAt(x, y, preferredHeading = null, preferredSegmentIndex = null) {
  return routeRoadHalfWidthsAt(x, y, preferredHeading, preferredSegmentIndex).roadWidth;
}

function parkingShape(checkpoint) {
  const headingDegMeta = Number(checkpoint?.meta?.headingDeg);
  const preferredHeading = Number.isFinite(headingDegMeta) ? toRadians(headingDegMeta) : null;
  const frame = routeFrameAt(checkpoint.x, checkpoint.y, preferredHeading);
  const baseHeading = frame.heading;
  let boxL = Number(checkpoint.meta.boxL || PARALLEL_PARK_BOX_L_M);
  let boxW = Number(checkpoint.meta.boxW || PARALLEL_PARK_BOX_W_M);
  if (checkpoint.type === "parking_diagonal") {
    // Keep diagonal slot width/length aligned with parallel slots for consistent car fit.
    boxL = PARALLEL_PARK_BOX_L_M;
    boxW = PARALLEL_PARK_BOX_W_M;
  }
  let slotSpan = checkpoint.type === "parking_diagonal" ? boxW : boxL;
  let slotDepth = checkpoint.type === "parking_diagonal" ? boxL : boxW;

  const defaultSide = checkpoint.type === "parking_parallel" ? 1 : -1;
  const metaSideSign = Math.sign(Number(checkpoint?.meta?.sideSign) || 0);
  const detectedSide = Math.sign(frame.lateral);
  const sideSign = metaSideSign || detectedSide || defaultSide;
  const halfWidths = routeRoadHalfWidthsAt(frame.center.x, frame.center.y, baseHeading, frame.segmentIndex);
  const roadHalfWidth = sideSign > 0 ? halfWidths.right : halfWidths.left;
  const outsideOffset = checkpoint.type === "parking_diagonal" ? Math.max(0.9, boxW * 0.55) : 0.02;
  const edgeOffset = roadHalfWidth + outsideOffset;
  const curbGap = 0.0;
  let sideOffset = edgeOffset + curbGap + slotDepth * 0.5;
  const rightNormal = frame.right;

  const cx = frame.center.x + rightNormal.x * sideOffset * sideSign;
  const cy = frame.center.y + rightNormal.y * sideOffset * sideSign;

  let orientation = baseHeading;
  let shiftAlong = 0;
  if (checkpoint.type === "parking_diagonal") {
    const diagonalDeg = Math.max(10, Math.min(80, Number(checkpoint.meta.angleDeg || 45)));
    const angleRad = toRadians(diagonalDeg);
    const sinA = Math.max(0.2, Math.sin(angleRad));
    const cosA = Math.cos(angleRad);
    orientation = baseHeading - angleRad * sideSign;

    // Build diagonal geometry from true parking dimensions:
    // width (boxW) measured perpendicular to slot axis, length (boxL) along slot axis.
    slotSpan = boxW / sinA;
    slotDepth = boxL * sinA;
    shiftAlong = boxL * cosA;
    sideOffset = edgeOffset + curbGap + slotDepth * 0.5;
  }

  const dir = frame.dir;
  const outward = { x: rightNormal.x * sideSign, y: rightNormal.y * sideSign };
  const slots = Math.max(1, Math.round(Number(checkpoint.meta.slots) || 1));
  const slotGapRaw = Number(checkpoint.meta.slotGapM);
  const defaultSlotGap = checkpoint.type === "parking_parallel" ? 0 : 0.3;
  const slotGap = Number.isFinite(slotGapRaw) ? Math.max(0, slotGapRaw) : defaultSlotGap;

  let corners;
  let innerCenter = {
    x: frame.center.x + outward.x * (edgeOffset + curbGap),
    y: frame.center.y + outward.y * (edgeOffset + curbGap),
  };
  let totalSpan = slots * slotSpan + (slots - 1) * slotGap;
  if (checkpoint.type === "parking_diagonal") {
    const innerStart = {
      x: innerCenter.x - dir.x * (totalSpan * 0.5),
      y: innerCenter.y - dir.y * (totalSpan * 0.5),
    };
    const innerEnd = {
      x: innerCenter.x + dir.x * (totalSpan * 0.5),
      y: innerCenter.y + dir.y * (totalSpan * 0.5),
    };
    const outerStart = {
      x: innerStart.x + outward.x * slotDepth + dir.x * shiftAlong,
      y: innerStart.y + outward.y * slotDepth + dir.y * shiftAlong,
    };
    const outerEnd = {
      x: innerEnd.x + outward.x * slotDepth + dir.x * shiftAlong,
      y: innerEnd.y + outward.y * slotDepth + dir.y * shiftAlong,
    };
    corners = [innerStart, innerEnd, outerEnd, outerStart];
  } else {
    const innerStart = {
      x: innerCenter.x - dir.x * (totalSpan * 0.5),
      y: innerCenter.y - dir.y * (totalSpan * 0.5),
    };
    const innerEnd = {
      x: innerCenter.x + dir.x * (totalSpan * 0.5),
      y: innerCenter.y + dir.y * (totalSpan * 0.5),
    };
    const outerStart = {
      x: innerStart.x + outward.x * slotDepth,
      y: innerStart.y + outward.y * slotDepth,
    };
    const outerEnd = {
      x: innerEnd.x + outward.x * slotDepth,
      y: innerEnd.y + outward.y * slotDepth,
    };
    corners = [innerStart, innerEnd, outerEnd, outerStart];
  }

  return {
    baseHeading,
    orientation,
    center: { x: cx, y: cy },
    dir,
    outward,
    innerCenter,
    totalSpan,
    slotGap,
    boxL,
    boxW,
    slotSpan,
    slotDepth,
    shiftAlong,
    sideSign,
    roadHalfWidth,
    frameCenter: frame.center,
    frameLateral: frame.lateral,
    edgeOffset,
    corners,
  };
}

function parkingSlotShapes(checkpoint) {
  const base = parkingShape(checkpoint);
  const slots = Math.max(1, Math.round(Number(checkpoint.meta.slots) || 1));
  const slotGapRaw = Number(checkpoint.meta.slotGapM);
  const defaultSlotGap = checkpoint.type === "parking_parallel" ? 0 : 0.3;
  const slotGap = Number.isFinite(slotGapRaw) ? Math.max(0, slotGapRaw) : defaultSlotGap;
  const centers = [];
  const slotPitch = base.slotSpan + slotGap;
  const slotShift = checkpoint.type === "parking_diagonal" ? base.shiftAlong : 0;
  for (let i = 0; i < slots; i += 1) {
    const start = -base.totalSpan * 0.5 + i * slotPitch;
    const end = start + base.slotSpan;
    const inner0 = {
      x: base.innerCenter.x + base.dir.x * start,
      y: base.innerCenter.y + base.dir.y * start,
    };
    const inner1 = {
      x: base.innerCenter.x + base.dir.x * end,
      y: base.innerCenter.y + base.dir.y * end,
    };
    const outer0 = {
      x: inner0.x + base.outward.x * base.slotDepth + base.dir.x * slotShift,
      y: inner0.y + base.outward.y * base.slotDepth + base.dir.y * slotShift,
    };
    const outer1 = {
      x: inner1.x + base.outward.x * base.slotDepth + base.dir.x * slotShift,
      y: inner1.y + base.outward.y * base.slotDepth + base.dir.y * slotShift,
    };
    centers.push({
      orientation: base.orientation,
      arrangementHeading: base.baseHeading,
      center: {
        x: (inner0.x + inner1.x + outer1.x + outer0.x) * 0.25,
        y: (inner0.y + inner1.y + outer1.y + outer0.y) * 0.25,
      },
      corners: [inner0, inner1, outer1, outer0],
    });
  }

  return centers;
}

function parkingConnectorShape(checkpoint, bayShape) {
  if (checkpoint.type === "parking_diagonal" || checkpoint.type === "parking_parallel") {
    const halfSpan = bayShape.totalSpan * 0.5;
    const roadEdgeCenter = {
      x: bayShape.frameCenter.x + bayShape.outward.x * bayShape.roadHalfWidth,
      y: bayShape.frameCenter.y + bayShape.outward.y * bayShape.roadHalfWidth,
    };
    const roadStart = {
      x: roadEdgeCenter.x - bayShape.dir.x * halfSpan,
      y: roadEdgeCenter.y - bayShape.dir.y * halfSpan,
    };
    const roadEnd = {
      x: roadEdgeCenter.x + bayShape.dir.x * halfSpan,
      y: roadEdgeCenter.y + bayShape.dir.y * halfSpan,
    };
    const innerStart = {
      x: bayShape.innerCenter.x - bayShape.dir.x * halfSpan,
      y: bayShape.innerCenter.y - bayShape.dir.y * halfSpan,
    };
    const innerEnd = {
      x: bayShape.innerCenter.x + bayShape.dir.x * halfSpan,
      y: bayShape.innerCenter.y + bayShape.dir.y * halfSpan,
    };

    return {
      orientation: bayShape.baseHeading,
      center: {
        x: (roadEdgeCenter.x + bayShape.innerCenter.x) * 0.5,
        y: (roadEdgeCenter.y + bayShape.innerCenter.y) * 0.5,
      },
      corners: [roadStart, roadEnd, innerEnd, innerStart],
    };
  }
  const heading = routeHeadingAt(checkpoint.x, checkpoint.y);
  const boxW = Number(checkpoint.meta.boxW || 2.5);
  const connectorLength = Math.max(
    0.9,
    Math.hypot(bayShape.center.x - checkpoint.x, bayShape.center.y - checkpoint.y) * 0.95,
  );
  const halfL = connectorLength * 0.5;
  const halfW = boxW * 0.42;
  const center = {
    x: (checkpoint.x + bayShape.center.x) * 0.5,
    y: (checkpoint.y + bayShape.center.y) * 0.5,
  };
  const cosV = Math.cos(heading);
  const sinV = Math.sin(heading);
  const cornersLocal = [
    { x: -halfL, y: -halfW },
    { x: halfL, y: -halfW },
    { x: halfL, y: halfW },
    { x: -halfL, y: halfW },
  ];
  const corners = cornersLocal.map((p) => ({
    x: center.x + p.x * cosV - p.y * sinV,
    y: center.y + p.x * sinV + p.y * cosV,
  }));

  return {
    orientation: heading,
    center,
    length: connectorLength,
    width: halfW * 2,
    corners,
  };
}

function normalizeHeadingDeltaDeg(aDeg, bDeg) {
  const a = normalizeHeading(aDeg);
  const b = normalizeHeading(bDeg);
  let delta = Math.abs(a - b);
  if (delta > 180) {
    delta = 360 - delta;
  }
  return delta;
}

function insetPolygon(corners, center, scale = 0.88) {
  return corners.map((corner) => ({
    x: center.x + (corner.x - center.x) * scale,
    y: center.y + (corner.y - center.y) * scale,
  }));
}

function pointInConvexPolygon(point, corners) {
  if (!point || !Array.isArray(corners) || corners.length < 3) {
    return false;
  }

  let sign = 0;
  const n = corners.length;
  for (let i = 0; i < n; i += 1) {
    const a = corners[i];
    const b = corners[(i + 1) % n];
    const cross = (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x);
    if (Math.abs(cross) < 1e-6) {
      continue;
    }
    const currentSign = cross > 0 ? 1 : -1;
    if (sign === 0) {
      sign = currentSign;
    } else if (sign !== currentSign) {
      return false;
    }
  }
  return true;
}

function parkingProbePointsFallback(car) {
  const heading = toRadians(car.headingDeg || 0);
  const forward = { x: Math.cos(heading), y: Math.sin(heading) };
  const right = { x: Math.sin(heading), y: -Math.cos(heading) };

  return [
    { x: car.x, y: car.y },
    { x: car.x + forward.x * 1.25, y: car.y + forward.y * 1.25 },
    { x: car.x - forward.x * 1.15, y: car.y - forward.y * 1.15 },
    { x: car.x + right.x * 0.45, y: car.y + right.y * 0.45 },
    { x: car.x - right.x * 0.45, y: car.y - right.y * 0.45 },
    { x: car.x + forward.x * 0.85 + right.x * 0.35, y: car.y + forward.y * 0.85 + right.y * 0.35 },
    { x: car.x + forward.x * 0.85 - right.x * 0.35, y: car.y + forward.y * 0.85 - right.y * 0.35 },
  ];
}

function routePointFromCarLocal(localX, localZ) {
  const car = state.sim.car;
  if (!car) {
    return null;
  }

  const yaw =
    toRadians(car.headingDeg || 0) +
    (state.sim.three.vehicleModelRoot ? state.sim.three.vehicleYawOffsetRad || 0 : 0);
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);

  return {
    x: car.x + cosY * localX + sinY * localZ,
    y: car.y + sinY * localX - cosY * localZ,
  };
}

function parkingVehicleGeometry() {
  const car = state.sim.car;
  if (!car) {
    return null;
  }

  const footprint = state.sim.three.vehicleFootprintLocal;
  if (state.sim.three.vehicleModelRoot && footprint) {
    const spanX = Math.max(0.8, footprint.maxX - footprint.minX);
    const spanZ = Math.max(1.6, footprint.maxZ - footprint.minZ);
    // Keep footprint close to actual body limits so green only appears when almost all car is in.
    let minX = footprint.minX + spanX * 0.07;
    let maxX = footprint.maxX - spanX * 0.07;
    let minZ = footprint.minZ + spanZ * 0.06;
    let maxZ = footprint.maxZ - spanZ * 0.06;

    if (maxX - minX < 0.3) {
      const cx = (footprint.minX + footprint.maxX) * 0.5;
      minX = cx - 0.15;
      maxX = cx + 0.15;
    }
    if (maxZ - minZ < 0.6) {
      const cz = (footprint.minZ + footprint.maxZ) * 0.5;
      minZ = cz - 0.3;
      maxZ = cz + 0.3;
    }

    const localPoints = [
      { x: (minX + maxX) * 0.5, z: (minZ + maxZ) * 0.5 },
      { x: minX, z: minZ },
      { x: maxX, z: minZ },
      { x: maxX, z: maxZ },
      { x: minX, z: maxZ },
      { x: (minX + maxX) * 0.5, z: minZ },
      { x: (minX + maxX) * 0.5, z: maxZ },
      { x: minX, z: (minZ + maxZ) * 0.5 },
      { x: maxX, z: (minZ + maxZ) * 0.5 },
    ];

    const probes = localPoints
      .map((point) => routePointFromCarLocal(point.x, point.z))
      .filter((point) => point && Number.isFinite(point.x) && Number.isFinite(point.y));
    if (probes.length > 0) {
      return {
        source: "model",
        center: probes[0],
        probes,
      };
    }
  }

  const probes = parkingProbePointsFallback(car);
  return {
    source: "fallback",
    center: probes[0],
    probes,
  };
}

function parkingHeadingErrorDeg(carHeadingDeg, shape) {
  const slotHeading = (shape.orientation * 180) / Math.PI;
  const directDelta = normalizeHeadingDeltaDeg(carHeadingDeg, slotHeading);
  return Math.min(directDelta, Math.abs(180 - directDelta));
}

function evaluateParkingSlotFit(checkpoint, shape) {
  const car = state.sim.car;
  if (!car || !shape) {
    return {
      occupied: false,
      centerDistM: Number.POSITIVE_INFINITY,
      headingErrDeg: Number.POSITIVE_INFINITY,
      centerInside: false,
      insideCount: 0,
      requiredInside: 0,
      probeSource: "none",
      rearClearM: Number.NEGATIVE_INFINITY,
      frontClearM: Number.NEGATIVE_INFINITY,
      frontRearMarginM: 0,
      frontRearOk: false,
      centerOffsetLongM: Number.POSITIVE_INFINITY,
      centerToleranceM: 0,
      centeredLongOk: false,
      clearBalanceM: Number.POSITIVE_INFINITY,
      clearBalanceToleranceM: 0,
      clearBalanceOk: false,
    };
  }

  const geometry = parkingVehicleGeometry();
  if (!geometry) {
    return {
      occupied: false,
      centerDistM: Number.POSITIVE_INFINITY,
      headingErrDeg: Number.POSITIVE_INFINITY,
      centerInside: false,
      insideCount: 0,
      requiredInside: 0,
      probeSource: "none",
      rearClearM: Number.NEGATIVE_INFINITY,
      frontClearM: Number.NEGATIVE_INFINITY,
      frontRearMarginM: 0,
      frontRearOk: false,
      centerOffsetLongM: Number.POSITIVE_INFINITY,
      centerToleranceM: 0,
      centeredLongOk: false,
      clearBalanceM: Number.POSITIVE_INFINITY,
      clearBalanceToleranceM: 0,
      clearBalanceOk: false,
    };
  }

  const centerDistM = Math.hypot(geometry.center.x - shape.center.x, geometry.center.y - shape.center.y);
  const slotArea = insetPolygon(shape.corners, shape.center, 1.0);
  const centerInside = pointInConvexPolygon(geometry.center, slotArea);
  let insideCount = 0;
  for (const probe of geometry.probes) {
    if (pointInConvexPolygon(probe, slotArea)) {
      insideCount += 1;
    }
  }
  const requiredInside = geometry.probes.length;
  const headingErrDeg = parkingHeadingErrorDeg(car.headingDeg, shape);

  let minSlotLong = Number.POSITIVE_INFINITY;
  let maxSlotLong = Number.NEGATIVE_INFINITY;
  const slotCos = Math.cos(shape.orientation);
  const slotSin = Math.sin(shape.orientation);
  for (const corner of shape.corners) {
    const relX = corner.x - shape.center.x;
    const relY = corner.y - shape.center.y;
    const longitudinal = relX * slotCos + relY * slotSin;
    minSlotLong = Math.min(minSlotLong, longitudinal);
    maxSlotLong = Math.max(maxSlotLong, longitudinal);
  }
  const slotRearBound = minSlotLong;
  const slotFrontBound = maxSlotLong;
  const rearMarginM = checkpoint.type === "parking_parallel" ? 0.32 : 0.28;
  const frontMarginM = checkpoint.type === "parking_parallel" ? 0.32 : 0.28;
  const frontRearMarginM = Math.max(rearMarginM, frontMarginM);
  const centerToleranceM = checkpoint.type === "parking_parallel" ? 0.42 : 0.8;
  const centerOffsetLongM = Math.abs(
    (geometry.center.x - shape.center.x) * slotCos + (geometry.center.y - shape.center.y) * slotSin,
  );
  const centeredLongOk = centerOffsetLongM <= centerToleranceM;
  let minLongitudinal = Number.POSITIVE_INFINITY;
  let maxLongitudinal = Number.NEGATIVE_INFINITY;
  for (const probe of geometry.probes) {
    const relX = probe.x - shape.center.x;
    const relY = probe.y - shape.center.y;
    const longitudinal = relX * slotCos + relY * slotSin;
    minLongitudinal = Math.min(minLongitudinal, longitudinal);
    maxLongitudinal = Math.max(maxLongitudinal, longitudinal);
  }
  // Use real projected slot bounds (not symmetric center assumption), especially important for skewed diagonal quads.
  const rearClearM = minLongitudinal - slotRearBound;
  const frontClearM = slotFrontBound - maxLongitudinal;
  const clearBalanceM = Math.abs(frontClearM - rearClearM);
  const clearBalanceToleranceM = checkpoint.type === "parking_parallel" ? 0.18 : Number.POSITIVE_INFINITY;
  const clearBalanceOk = checkpoint.type === "parking_parallel" ? clearBalanceM <= clearBalanceToleranceM : true;
  const frontRearOk =
    rearClearM >= rearMarginM &&
    frontClearM >= frontMarginM &&
    centeredLongOk &&
    clearBalanceOk;

  let headingOk = true;
  if (checkpoint.type === "parking_parallel" || checkpoint.type === "parking_diagonal") {
    const allow = checkpoint.type === "parking_parallel" ? 38 : 34;
    headingOk = headingErrDeg <= allow;
  }

  const occupied =
    Math.abs(car.speedKmh) <= 6.5 &&
    centerInside &&
    insideCount >= requiredInside &&
    frontRearOk &&
    headingOk;

  return {
    occupied,
    centerDistM,
    headingErrDeg,
    centerInside,
    insideCount,
    requiredInside,
    probeSource: geometry.source,
    rearClearM,
    frontClearM,
    frontRearMarginM,
    frontRearOk,
    centerOffsetLongM,
    centerToleranceM,
    centeredLongOk,
    clearBalanceM,
    clearBalanceToleranceM,
    clearBalanceOk,
  };
}

function isParkingSlotOccupied(checkpoint, shape) {
  const fit = evaluateParkingSlotFit(checkpoint, shape);
  return fit.occupied;
}

function parkingDetectionDebug(checkpoint) {
  if (!checkpoint || !state.sim.car) {
    return null;
  }

  const slots = parkingSlotShapes(checkpoint);
  if (!slots.length) {
    return null;
  }

  let nearestIndex = 0;
  let nearestFit = null;
  let occupiedIndex = -1;

  for (let i = 0; i < slots.length; i += 1) {
    const slot = slots[i];
    const fit = evaluateParkingSlotFit(checkpoint, slot);
    if (!nearestFit || fit.centerDistM < nearestFit.centerDistM) {
      nearestFit = fit;
      nearestIndex = i;
    }
    if (occupiedIndex < 0 && fit.occupied) {
      occupiedIndex = i;
    }
  }

  const displayFit = occupiedIndex >= 0
    ? evaluateParkingSlotFit(checkpoint, slots[occupiedIndex])
    : nearestFit;

  return {
    occupied: occupiedIndex >= 0,
    slotIndex: occupiedIndex >= 0 ? occupiedIndex : nearestIndex,
    slotCount: slots.length,
    centerDistM: displayFit?.centerDistM ?? Number.POSITIVE_INFINITY,
    headingErrDeg: displayFit?.headingErrDeg ?? Number.POSITIVE_INFINITY,
    centerInside: Boolean(displayFit?.centerInside),
    insideCount: displayFit?.insideCount ?? 0,
    requiredInside: displayFit?.requiredInside ?? 0,
    probeSource: displayFit?.probeSource || "none",
    rearClearM: displayFit?.rearClearM ?? Number.NEGATIVE_INFINITY,
    frontClearM: displayFit?.frontClearM ?? Number.NEGATIVE_INFINITY,
    frontRearMarginM: displayFit?.frontRearMarginM ?? 0,
    frontRearOk: Boolean(displayFit?.frontRearOk),
    centerOffsetLongM: displayFit?.centerOffsetLongM ?? Number.POSITIVE_INFINITY,
    centerToleranceM: displayFit?.centerToleranceM ?? 0,
    centeredLongOk: Boolean(displayFit?.centeredLongOk),
    clearBalanceM: displayFit?.clearBalanceM ?? Number.POSITIVE_INFINITY,
    clearBalanceToleranceM: displayFit?.clearBalanceToleranceM ?? 0,
    clearBalanceOk: Boolean(displayFit?.clearBalanceOk),
  };
}

function findOccupiedParkingSlot(checkpoint) {
  if (!checkpoint || !state.sim.car) {
    return null;
  }

  const slots = parkingSlotShapes(checkpoint);
  for (let i = 0; i < slots.length; i += 1) {
    const fit = evaluateParkingSlotFit(checkpoint, slots[i]);
    if (fit.occupied) {
      return { index: i, slotCount: slots.length, shape: slots[i], fit };
    }
  }
  return null;
}

function laneWidthAtCheckpoint(checkpoint, laneCount) {
  const lanes = Math.max(1, laneCount);
  const roadWidth = Math.max(0.8, routeRoadWidthAt(checkpoint.x, checkpoint.y));
  return roadWidth / lanes;
}

function speedBumpSegment(checkpoint) {
  const heading = checkpointHeadingAt(checkpoint);
  const laneCount = Math.max(1, Math.round(Number(checkpoint.meta?.laneCount) || 2));
  const lane = Math.max(1, Math.min(laneCount, Math.round(Number(checkpoint.meta?.lane) || 1)));
  const laneWidth = laneWidthAtCheckpoint(checkpoint, laneCount);
  const bumpHeight = Math.max(0.05, Math.min(0.25, Number(checkpoint.meta?.bumpHeightM) || 0.1));
  const laneOffset = ((lane - 0.5) - laneCount / 2) * laneWidth;
  const center = {
    x: checkpoint.x + Math.sin(heading) * laneOffset,
    y: checkpoint.y - Math.cos(heading) * laneOffset,
  };
  const halfLongitudinal = 0.25;
  const halfLateral = laneWidth / 2;
  const dir = { x: Math.cos(heading), y: Math.sin(heading) };
  const right = { x: Math.sin(heading), y: -Math.cos(heading) };

  return {
    heading,
    laneWidth,
    bumpHeight,
    halfLongitudinal,
    halfLateral,
    center,
    corners: [
      {
        x: center.x - dir.x * halfLongitudinal - right.x * halfLateral,
        y: center.y - dir.y * halfLongitudinal - right.y * halfLateral,
      },
      {
        x: center.x + dir.x * halfLongitudinal - right.x * halfLateral,
        y: center.y + dir.y * halfLongitudinal - right.y * halfLateral,
      },
      {
        x: center.x + dir.x * halfLongitudinal + right.x * halfLateral,
        y: center.y + dir.y * halfLongitudinal + right.y * halfLateral,
      },
      {
        x: center.x - dir.x * halfLongitudinal + right.x * halfLateral,
        y: center.y - dir.y * halfLongitudinal + right.y * halfLateral,
      },
    ],
  };
}

function stopLineSegment(checkpoint) {
  const heading = checkpointHeadingAt(checkpoint);
  const laneCount = Math.max(1, Math.round(Number(checkpoint.meta?.laneCount) || 2));
  const lane = Math.max(1, Math.min(laneCount, Math.round(Number(checkpoint.meta?.lane) || 1)));
  const laneWidth = laneWidthAtCheckpoint(checkpoint, laneCount);
  const laneOffset = ((lane - 0.5) - laneCount / 2) * laneWidth;
  const center = {
    x: checkpoint.x + Math.sin(heading) * laneOffset,
    y: checkpoint.y - Math.cos(heading) * laneOffset,
  };
  const lineWidth = Math.max(0.1, Math.min(0.8, Number(checkpoint.meta?.lineWidthM) || 0.26));
  const halfLongitudinal = lineWidth * 0.5;
  const halfLateral = laneWidth / 2;
  const dir = { x: Math.cos(heading), y: Math.sin(heading) };
  const right = { x: Math.sin(heading), y: -Math.cos(heading) };

  return {
    heading,
    laneWidth,
    center,
    lineWidth,
    corners: [
      {
        x: center.x - dir.x * halfLongitudinal - right.x * halfLateral,
        y: center.y - dir.y * halfLongitudinal - right.y * halfLateral,
      },
      {
        x: center.x + dir.x * halfLongitudinal - right.x * halfLateral,
        y: center.y + dir.y * halfLongitudinal - right.y * halfLateral,
      },
      {
        x: center.x + dir.x * halfLongitudinal + right.x * halfLateral,
        y: center.y + dir.y * halfLongitudinal + right.y * halfLateral,
      },
      {
        x: center.x - dir.x * halfLongitudinal + right.x * halfLateral,
        y: center.y - dir.y * halfLongitudinal + right.y * halfLateral,
      },
    ],
  };
}

function trafficLightPlacement(checkpoint) {
  const heading = checkpointHeadingAt(checkpoint);
  const facing = checkpoint.meta?.facing === "reverse" ? "reverse" : "with_path";
  const signalHeading = facing === "reverse" ? heading + Math.PI : heading;
  const sideSign = Math.sign(Number(checkpoint.meta?.sideSign) || 0) || 1;
  const preferredSeg = Number.isFinite(Number(checkpoint.meta?.snapSegmentIndex))
    ? Number(checkpoint.meta.snapSegmentIndex)
    : null;
  const halfWidths = routeRoadHalfWidthsAt(checkpoint.x, checkpoint.y, heading, preferredSeg);
  const roadHalfWidth = sideSign > 0 ? halfWidths.right : halfWidths.left;
  const right = { x: Math.sin(heading), y: -Math.cos(heading) };
  const poleOffset = roadHalfWidth + 0.9;
  const poleBase = {
    x: checkpoint.x + right.x * poleOffset * sideSign,
    y: checkpoint.y + right.y * poleOffset * sideSign,
  };

  return {
    heading,
    signalHeading,
    sideSign,
    poleBase,
  };
}

function guardTowerPlacement(checkpoint) {
  const heading = checkpointHeadingAt(checkpoint);
  const size = Math.max(0.75, Math.min(1.8, Number(checkpoint.meta?.size) || 1));
  const sideSign = Math.sign(Number(checkpoint.meta?.sideSign) || 0) || 1;
  const preferredSeg = Number.isFinite(Number(checkpoint.meta?.snapSegmentIndex))
    ? Number(checkpoint.meta.snapSegmentIndex)
    : null;
  const halfWidths = routeRoadHalfWidthsAt(checkpoint.x, checkpoint.y, heading, preferredSeg);
  const roadHalfWidth = sideSign > 0 ? halfWidths.right : halfWidths.left;
  const right = { x: Math.sin(heading), y: -Math.cos(heading) };
  // Keep the tower just outside the gray road edge (inside shoulder start), not outside the brown shoulder.
  // Offset is computed from tower depth so its near face sits a tiny gap from the road edge.
  const towerDepth = 3.2 * size;
  const nearGap = 0.08;
  const centerOffset = roadHalfWidth + towerDepth * 0.5 + nearGap;
  const center = {
    x: checkpoint.x + right.x * centerOffset * sideSign,
    y: checkpoint.y + right.y * centerOffset * sideSign,
  };
  const towardRoad = { x: -right.x * sideSign, y: -right.y * sideSign };
  const faceHeading = Math.atan2(towardRoad.y, towardRoad.x);
  return { center, faceHeading, heading, sideSign };
}

function startCanopyPlacement(checkpoint) {
  const heading = checkpointHeadingAt(checkpoint);
  const preferredSeg = Number.isFinite(Number(checkpoint.meta?.snapSegmentIndex))
    ? Number(checkpoint.meta.snapSegmentIndex)
    : null;
  const halfWidths = routeRoadHalfWidthsAt(checkpoint.x, checkpoint.y, heading, preferredSeg);
  const roadWidth = halfWidths.roadWidth;
  let rawLength = Number(checkpoint.meta?.lengthM);
  if (!Number.isFinite(rawLength)) {
    rawLength = 4.3;
  } else if (rawLength > 7.8) {
    // Backward-compatible shrink for legacy checkpoints.
    rawLength *= 0.5;
  }
  const length = Math.max(2.6, Math.min(7.75, rawLength));
  const height = Math.max(2.3, Math.min(5.2, Number(checkpoint.meta?.heightM) || 3.25));
  const roofWidth = roadWidth + 1.0;
  return { heading, roadWidth, length, height, roofWidth };
}

function createCanopyLabelTexture(THREE, text, options = {}) {
  const width = Math.max(64, Math.round(Number(options.width) || 512));
  const height = Math.max(64, Math.round(Number(options.height) || 192));
  const bg = options.bg || "rgba(0, 0, 0, 0)";
  const stroke = options.stroke || "rgba(3, 16, 28, 0.7)";
  const fill = options.fill || "#f2f7ff";
  const fontScale = Math.max(0.2, Math.min(0.9, Number(options.fontScale) || 0.54));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) {
    return null;
  }

  ctx2d.clearRect(0, 0, width, height);
  ctx2d.fillStyle = bg;
  ctx2d.fillRect(0, 0, width, height);
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "middle";
  const rawLines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const lines = rawLines.length ? rawLines : [String(text || "")];
  const fontPx = Math.round(height * fontScale);
  const lineHeight = Math.max(12, Math.round(fontPx * 0.88));
  const totalTextHeight = lineHeight * (lines.length - 1);
  const startY = height * 0.52 - totalTextHeight * 0.5;
  ctx2d.font = `800 ${fontPx}px Sora, Manrope, sans-serif`;
  ctx2d.lineWidth = Math.max(2, Math.round(height * 0.05));
  ctx2d.strokeStyle = stroke;
  ctx2d.fillStyle = fill;
  for (let i = 0; i < lines.length; i += 1) {
    const y = startY + i * lineHeight;
    ctx2d.strokeText(lines[i], width * 0.5, y);
    ctx2d.fillText(lines[i], width * 0.5, y);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  if ("colorSpace" in texture && THREE.SRGBColorSpace) {
    texture.colorSpace = THREE.SRGBColorSpace;
  } else if ("encoding" in texture && THREE.sRGBEncoding) {
    texture.encoding = THREE.sRGBEncoding;
  }
  return texture;
}

function clearThreeGroup(group) {
  if (!group) {
    return;
  }

  while (group.children.length > 0) {
    const child = group.children.pop();
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (Array.isArray(child.material)) {
      for (const mat of child.material) {
        mat.dispose();
      }
    } else if (child.material) {
      child.material.dispose();
    }
  }
}

function applyGroundAlignedYaw(object3d, yawRad) {
  // Keep geometry flat on ground and rotate only around world up axis.
  object3d.rotation.order = "YXZ";
  object3d.rotation.set(-Math.PI / 2, yawRad, 0);
}

function buildGroundQuadGeometry(THREE, corners) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    corners[0].x, 0, -corners[0].y,
    corners[1].x, 0, -corners[1].y,
    corners[2].x, 0, -corners[2].y,
    corners[3].x, 0, -corners[3].y,
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return geometry;
}

function buildGroundTriangleGeometry(THREE, points) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    points[0].x, 0, -points[0].y,
    points[1].x, 0, -points[1].y,
    points[2].x, 0, -points[2].y,
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2]);
  geometry.computeVertexNormals();
  return geometry;
}

function buildGroundLoopGeometry(THREE, corners) {
  const points = corners.map((corner) => new THREE.Vector3(corner.x, 0, -corner.y));
  points.push(new THREE.Vector3(corners[0].x, 0, -corners[0].y));
  return new THREE.BufferGeometry().setFromPoints(points);
}

function lineIntersection2D(p, dirP, q, dirQ) {
  const cross = dirP.x * dirQ.y - dirP.y * dirQ.x;
  if (Math.abs(cross) < 1e-6) {
    return null;
  }
  const qmpx = q.x - p.x;
  const qmpy = q.y - p.y;
  const t = (qmpx * dirQ.y - qmpy * dirQ.x) / cross;
  const u = (qmpx * dirP.y - qmpy * dirP.x) / cross;
  return {
    point: {
      x: p.x + dirP.x * t,
      y: p.y + dirP.y * t,
    },
    t,
    u,
  };
}

function buildGuardTowerGroup(THREE, checkpoint) {
  const size = Math.max(0.75, Math.min(1.8, Number(checkpoint.meta?.size) || 1));
  const placement = guardTowerPlacement(checkpoint);
  const group = new THREE.Group();
  group.position.set(placement.center.x, 0, -placement.center.y);
  // Local "front" points +Z; rotate so the cabin faces toward the road.
  group.rotation.y = Math.PI / 2 + placement.faceHeading;

  const slabMat = new THREE.MeshStandardMaterial({ color: 0x71767b, roughness: 0.9, metalness: 0.06 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f8, roughness: 0.94, metalness: 0.02 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x7f888f, roughness: 0.78, metalness: 0.12 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x3c4349, roughness: 0.75, metalness: 0.22 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xbfd4dd,
    roughness: 0.2,
    metalness: 0.03,
    transparent: true,
    opacity: 0.24,
  });
  const legoBlueMat = new THREE.MeshStandardMaterial({ color: 0x3f7ce4, roughness: 0.75, metalness: 0.05 });
  const legoSkinMat = new THREE.MeshStandardMaterial({ color: 0xffd19e, roughness: 0.8, metalness: 0.02 });
  const legoDarkMat = new THREE.MeshStandardMaterial({ color: 0x1f232a, roughness: 0.82, metalness: 0.02 });

  const basePad = new THREE.Mesh(new THREE.BoxGeometry(3.4 * size, 0.08 * size, 3.2 * size), slabMat);
  basePad.position.y = 0.04 * size;
  group.add(basePad);

  const towerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * size, 1.1 * size, 2.45 * size, 4), wallMat);
  towerBody.position.y = 1.23 * size;
  towerBody.rotation.y = Math.PI * 0.25;
  group.add(towerBody);

  const boothFloor = new THREE.Mesh(new THREE.BoxGeometry(2.18 * size, 0.08 * size, 2.18 * size), wallMat);
  boothFloor.position.y = 1.95 * size;
  group.add(boothFloor);

  const sillN = new THREE.Mesh(new THREE.BoxGeometry(1.95 * size, 0.24 * size, 0.08 * size), wallMat);
  sillN.position.set(0, 2.14 * size, 1.03 * size);
  group.add(sillN);
  const sillS = sillN.clone();
  sillS.position.z = -1.03 * size;
  group.add(sillS);
  const sillE = new THREE.Mesh(new THREE.BoxGeometry(0.08 * size, 0.24 * size, 1.95 * size), wallMat);
  sillE.position.set(1.03 * size, 2.14 * size, 0);
  group.add(sillE);
  const sillW = sillE.clone();
  sillW.position.x = -1.03 * size;
  group.add(sillW);

  const postGeo = new THREE.BoxGeometry(0.1 * size, 0.95 * size, 0.1 * size);
  const postNW = new THREE.Mesh(postGeo, wallMat);
  postNW.position.set(-1.02 * size, 2.5 * size, 1.02 * size);
  group.add(postNW);
  const postNE = postNW.clone();
  postNE.position.x = 1.02 * size;
  group.add(postNE);
  const postSW = postNW.clone();
  postSW.position.z = -1.02 * size;
  group.add(postSW);
  const postSE = postSW.clone();
  postSE.position.x = 1.02 * size;
  group.add(postSE);

  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.35 * size, 0.58 * size, 4), roofMat);
  roof.position.y = 3.32 * size;
  roof.rotation.y = Math.PI * 0.25;
  group.add(roof);

  const addWindow = (x, z, rotationY) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.22 * size, 0.52 * size), glassMat);
    panel.position.set(x, 2.52 * size, z);
    panel.rotation.y = rotationY;
    group.add(panel);
  };
  addWindow(0, 1.09 * size, 0);
  addWindow(0, -1.09 * size, Math.PI);
  addWindow(1.09 * size, 0, -Math.PI * 0.5);
  addWindow(-1.09 * size, 0, Math.PI * 0.5);

  const landing = new THREE.Mesh(new THREE.BoxGeometry(1.2 * size, 0.08 * size, 0.95 * size), wallMat);
  landing.position.set(1.32 * size, 1.8 * size, 0.82 * size);
  group.add(landing);

  for (let step = 0; step < 6; step += 1) {
    const stair = new THREE.Mesh(new THREE.BoxGeometry(0.58 * size, 0.08 * size, 0.26 * size), wallMat);
    stair.position.set(
      1.35 * size,
      (0.16 + step * 0.27) * size,
      (1.6 - step * 0.22) * size,
    );
    group.add(stair);
  }

  const addRailPole = (x, y, z) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018 * size, 0.018 * size, 0.52 * size, 8), railMat);
    pole.position.set(x, y, z);
    group.add(pole);
  };
  addRailPole(1.84 * size, 2.08 * size, 1.25 * size);
  addRailPole(1.84 * size, 2.08 * size, 0.66 * size);
  addRailPole(1.84 * size, 1.55 * size, 1.45 * size);

  const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.04 * size, 0.04 * size, 0.62 * size), railMat);
  railTop.position.set(1.84 * size, 2.34 * size, 0.95 * size);
  group.add(railTop);

  const observer = new THREE.Group();
  observer.position.set(0.02 * size, 2.08 * size, 0.45 * size);
  group.add(observer);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.12 * size, 0.24 * size, 0.12 * size), legoDarkMat);
  legL.position.set(-0.08 * size, 0.12 * size, 0);
  observer.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.08 * size;
  observer.add(legR);

  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34 * size, 0.32 * size, 0.2 * size), legoBlueMat);
  torso.position.set(0, 0.4 * size, 0);
  observer.add(torso);

  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.09 * size, 0.25 * size, 0.09 * size), legoBlueMat);
  armL.position.set(-0.24 * size, 0.4 * size, 0);
  observer.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.24 * size;
  observer.add(armR);

  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * size, 0.1 * size, 0.14 * size, 10), legoSkinMat);
  head.position.set(0, 0.66 * size, 0);
  observer.add(head);

  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11 * size, 10, 10), legoDarkMat);
  cap.position.set(0, 0.76 * size, 0);
  cap.scale.y = 0.55;
  observer.add(cap);

  return group;
}

function buildStartCanopyGroup(THREE, checkpoint) {
  const placement = startCanopyPlacement(checkpoint);
  const group = new THREE.Group();
  group.position.set(checkpoint.x, 0, -checkpoint.y);
  group.rotation.y = placement.heading;

  const postMat = new THREE.MeshStandardMaterial({ color: 0xf2f5f8, roughness: 0.9, metalness: 0.04 });
  const beamMat = new THREE.MeshStandardMaterial({ color: 0xa36a3f, roughness: 0.78, metalness: 0.08 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x3f73bd, roughness: 0.66, metalness: 0.16 });
  const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x2f5d9f, roughness: 0.62, metalness: 0.2 });

  const roofY = placement.height;
  const postHeight = Math.max(2.0, roofY - 0.14);
  const postInsetX = Math.max(0.45, placement.length * 0.5 - 0.55);
  const postInsetZ = Math.max(0.45, placement.roofWidth * 0.5 - 0.4);

  const addPost = (x, z) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, postHeight, 10), postMat);
    post.position.set(x, postHeight * 0.5, z);
    group.add(post);
  };
  addPost(-postInsetX, -postInsetZ);
  addPost(-postInsetX, postInsetZ);
  addPost(postInsetX, -postInsetZ);
  addPost(postInsetX, postInsetZ);

  const beamY = postHeight - 0.12;
  const frontBeam = new THREE.Mesh(
    new THREE.BoxGeometry(placement.length + 0.22, 0.12, 0.12),
    beamMat,
  );
  frontBeam.position.set(0, beamY, postInsetZ);
  group.add(frontBeam);
  const backBeam = frontBeam.clone();
  backBeam.position.z = -postInsetZ;
  group.add(backBeam);

  const sideBeamGeo = new THREE.BoxGeometry(0.12, 0.12, placement.roofWidth + 0.22);
  const sideBeamL = new THREE.Mesh(sideBeamGeo, beamMat);
  sideBeamL.position.set(-postInsetX, beamY, 0);
  group.add(sideBeamL);
  const sideBeamR = sideBeamL.clone();
  sideBeamR.position.x = postInsetX;
  group.add(sideBeamR);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(placement.length + 0.68, 0.09, placement.roofWidth + 0.48),
    roofMat,
  );
  roof.position.y = roofY;
  group.add(roof);

  const ribCount = Math.max(10, Math.round((placement.roofWidth + 0.48) / 0.32));
  const ribSpan = placement.roofWidth + 0.42;
  for (let i = 0; i < ribCount; i += 1) {
    const t = ribCount === 1 ? 0.5 : i / (ribCount - 1);
    const z = -ribSpan * 0.5 + t * ribSpan;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(placement.length + 0.72, 0.026, 0.062), ridgeMat);
    rib.position.set(0, roofY + 0.055, z);
    group.add(rib);
  }

  const laneWidth = placement.roadWidth * 0.5;
  const laneOffset = laneWidth * 0.5;
  const labelLength = Math.max(3.15, placement.length * 0.88);
  const labelLaneDepth = Math.max(1.34, laneWidth * 0.96);
  const labelRoofDepth = Math.max(1.52, placement.roofWidth * 0.39);

  const roofTextureA = createCanopyLabelTexture(THREE, "RUTA\nA", {
    width: 512,
    height: 176,
    bg: "rgba(0, 0, 0, 0.02)",
    fill: "#eaf3ff",
    stroke: "rgba(12, 28, 48, 0.78)",
    fontScale: 0.57,
  });
  const roofTextureB = createCanopyLabelTexture(THREE, "RUTA\nB", {
    width: 512,
    height: 176,
    bg: "rgba(0, 0, 0, 0.02)",
    fill: "#eaf3ff",
    stroke: "rgba(12, 28, 48, 0.78)",
    fontScale: 0.57,
  });
  const laneTextureA = createCanopyLabelTexture(THREE, "RUTA\nA", {
    width: 512,
    height: 192,
    bg: "rgba(0, 0, 0, 0)",
    fill: "rgba(247, 252, 255, 0.98)",
    stroke: "rgba(24, 45, 70, 0.62)",
    fontScale: 0.54,
  });
  const laneTextureB = createCanopyLabelTexture(THREE, "RUTA\nB", {
    width: 512,
    height: 192,
    bg: "rgba(0, 0, 0, 0)",
    fill: "rgba(247, 252, 255, 0.98)",
    stroke: "rgba(24, 45, 70, 0.62)",
    fontScale: 0.54,
  });

  const buildLabelMaterial = (texture) =>
    new THREE.MeshBasicMaterial({
      map: texture || null,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

  const roofLabelMatA = buildLabelMaterial(roofTextureA);
  const roofLabelMatB = buildLabelMaterial(roofTextureB);
  const laneLabelMatA = buildLabelMaterial(laneTextureA);
  const laneLabelMatB = buildLabelMaterial(laneTextureB);

  const roofLabelA = new THREE.Mesh(
    new THREE.PlaneGeometry(labelLength, labelRoofDepth),
    roofLabelMatA,
  );
  roofLabelA.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  roofLabelA.position.set(0, roofY + 0.102, -placement.roofWidth * 0.25);
  roofLabelA.renderOrder = 6;
  group.add(roofLabelA);

  const roofLabelB = new THREE.Mesh(
    new THREE.PlaneGeometry(labelLength, labelRoofDepth),
    roofLabelMatB,
  );
  roofLabelB.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  roofLabelB.position.set(0, roofY + 0.102, placement.roofWidth * 0.25);
  roofLabelB.renderOrder = 6;
  group.add(roofLabelB);

  const laneLabelA = new THREE.Mesh(
    new THREE.PlaneGeometry(labelLength, labelLaneDepth),
    laneLabelMatA,
  );
  laneLabelA.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  laneLabelA.position.set(0, 0.056, -laneOffset);
  laneLabelA.renderOrder = 5;
  group.add(laneLabelA);

  const laneLabelB = new THREE.Mesh(
    new THREE.PlaneGeometry(labelLength, labelLaneDepth),
    laneLabelMatB,
  );
  laneLabelB.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  laneLabelB.position.set(0, 0.056, laneOffset);
  laneLabelB.renderOrder = 5;
  group.add(laneLabelB);

  return group;
}

function buildDashDisplayGeometry(THREE, topScale = 0.78) {
  const clampedTop = Math.max(0.45, Math.min(1, topScale));
  const halfBottom = 0.5;
  const halfTop = 0.5 * clampedTop;
  const halfH = 0.5;
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -halfBottom,
    -halfH,
    0,
    halfBottom,
    -halfH,
    0,
    halfTop,
    halfH,
    0,
    -halfTop,
    halfH,
    0,
  ]);
  const uvs = new Float32Array([
    0,
    0,
    1,
    0,
    1,
    1,
    0,
    1,
  ]);
  const indices = [0, 1, 2, 0, 2, 3];
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function drawDashDisplayShapePath(ctx2d, x, y, w, h, topScale) {
  const clampedTop = Math.max(0.45, Math.min(1, topScale));
  const topW = w * clampedTop;
  const inset = (w - topW) * 0.5;
  ctx2d.beginPath();
  ctx2d.moveTo(x, y + h);
  ctx2d.lineTo(x + w, y + h);
  ctx2d.lineTo(x + w - inset, y);
  ctx2d.lineTo(x + inset, y);
  ctx2d.closePath();
}

function setDashDisplayTopScale(topScale = 0.78) {
  const three = state.sim.three;
  const mesh = three.dashDisplayMesh;
  if (!mesh || !three.lib) {
    return;
  }
  const clampedTop = Math.max(0.45, Math.min(1, topScale));
  if (Math.abs((three.dashDisplayTopScale ?? -1) - clampedTop) <= 0.0001) {
    return;
  }
  if (mesh.geometry) {
    mesh.geometry.dispose();
  }
  mesh.geometry = buildDashDisplayGeometry(three.lib, clampedTop);
  three.dashDisplayTopScale = clampedTop;
  // Force next frame redraw even if speed text didn't change.
  three.dashDisplayLastText = "";
}

function pickDashboardTargetMesh(THREE, modelRoot, carMarker, wheelLocal, seatLocal, forwardSign = 1) {
  if (!modelRoot || !carMarker) {
    return null;
  }

  const scoreAnchor =
    wheelLocal?.clone() ||
    seatLocal?.clone() ||
    new THREE.Vector3(forwardSign > 0 ? 0.1 : -0.1, 1.15, 0);
  const targetForward = new THREE.Vector3(forwardSign || 1, 0, 0);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  let best = null;

  modelRoot.traverse((node) => {
    if (!node.isMesh || node.visible === false || !node.geometry) {
      return;
    }

    const name = (node.name || "").toLowerCase();
    if (DASH_TARGET_REJECT_REGEX.test(name)) {
      return;
    }

    const bounds =
      computeMeshBoundsRelativeTo(THREE, node, carMarker, true) ||
      computeMeshBoundsRelativeTo(THREE, node, carMarker, false);
    if (!bounds) {
      return;
    }

    bounds.getSize(size);
    bounds.getCenter(center);
    const dims = [Math.abs(size.x), Math.abs(size.y), Math.abs(size.z)].sort((a, b) => a - b);
    const thickness = dims[0];
    const minor = dims[1];
    const major = dims[2];

    if (major < 0.08 || major > 1.25 || minor < 0.03 || minor > 0.42 || thickness > 0.2) {
      return;
    }

    const forwardDelta = (center.x - scoreAnchor.x) * (forwardSign || 1);
    const upDelta = center.y - scoreAnchor.y;
    const lateralDelta = Math.abs(center.z - scoreAnchor.z);

    if (forwardDelta < -0.08 || forwardDelta > 1.05 || upDelta < -0.35 || upDelta > 0.65 || lateralDelta > 0.95) {
      return;
    }

    const mats = Array.isArray(node.material) ? node.material : [node.material];
    const materialHint = mats.some((mat) => DASH_TARGET_NAME_HINT_REGEX.test((mat?.name || "").toLowerCase()));
    const hasUv = Boolean(node.geometry.attributes?.uv);
    const axisInfo = detectAxisForWorldDirection(THREE, node, targetForward);

    let score = 0;
    if (DASH_TARGET_NAME_HINT_REGEX.test(name)) {
      score += 45;
    }
    if (materialHint) {
      score += 20;
    }
    if (hasUv) {
      score += 12;
    }
    if (name.startsWith("plane")) {
      score += 8;
    }
    score += Math.max(0, 30 - Math.abs(forwardDelta - 0.22) * 70);
    score += Math.max(0, 22 - lateralDelta * 36);
    score += Math.max(0, 16 - Math.abs(upDelta - 0.12) * 34);
    score += Math.max(0, 14 - Math.abs(major - 0.34) * 46);
    score += Math.max(0, 10 - Math.abs(minor - 0.12) * 70);
    score += Math.max(0, 10 - thickness * 140);
    score += (axisInfo.confidence || 0) * 14;

    if (!best || score > best.score) {
      best = {
        node,
        name: node.name || "(unnamed)",
        score,
        center: center.clone(),
        major,
        minor,
      };
    }
  });

  if (!best || best.score < 32) {
    return null;
  }
  return best;
}

function bindDashDisplayToTargetMesh(THREE, mesh) {
  const three = state.sim.three;
  if (!mesh?.isMesh) {
    return false;
  }

  ensureDashDisplayResources(THREE);
  setDashDisplayTopScale(1);

  if (!three.dashDisplayTexture) {
    return false;
  }

  three.dashDisplayTexture.flipY = false;
  three.dashDisplayTexture.needsUpdate = true;

  mesh.material = new THREE.MeshBasicMaterial({
    map: three.dashDisplayTexture,
    transparent: true,
    alphaTest: 0.02,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -2,
  });
  mesh.renderOrder = 1000;
  mesh.frustumCulled = false;

  if (three.dashDisplayMesh) {
    three.dashDisplayMesh.visible = false;
  }
  three.dashDisplayMode = "mesh";
  three.dashDisplayTargetMesh = mesh;
  three.dashDisplayTargetName = mesh.name || "(unnamed)";
  return true;
}

function ensureDashDisplayResources(THREE) {
  const three = state.sim.three;
  if (!three.dashDisplayCanvas) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    three.dashDisplayCanvas = canvas;
    three.dashDisplayCtx = canvas.getContext("2d");
  }

  if (!three.dashDisplayTexture) {
    const texture = new THREE.CanvasTexture(three.dashDisplayCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    if ("colorSpace" in texture && THREE.SRGBColorSpace) {
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    three.dashDisplayTexture = texture;
  }

  if (!three.dashDisplayMesh) {
    const material = new THREE.MeshBasicMaterial({
      map: three.dashDisplayTexture,
      transparent: true,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(buildDashDisplayGeometry(THREE, MODEL_DASH_DISPLAY.topScale), material);
    mesh.name = "dash-speed-display";
    mesh.renderOrder = 12;
    three.dashDisplayMesh = mesh;
    three.dashDisplayTopScale = MODEL_DASH_DISPLAY.topScale;
  }
}

function drawDashDisplaySpeed(speedKmh = 0) {
  const three = state.sim.three;
  const ctx2d = three.dashDisplayCtx;
  const canvas = three.dashDisplayCanvas;
  if (!ctx2d || !canvas || !three.dashDisplayTexture) {
    return;
  }

  const safeSpeed = Math.max(0, speedKmh || 0);
  const speedLabel = `${Math.round(safeSpeed)}`;
  if (speedLabel === three.dashDisplayLastText) {
    return;
  }
  three.dashDisplayLastText = speedLabel;

  const w = canvas.width;
  const h = canvas.height;
  ctx2d.clearRect(0, 0, w, h);
  const topScale = three.dashDisplayMode === "mesh" ? 1 : three.dashDisplayTopScale ?? MODEL_DASH_DISPLAY.topScale;

  if (three.dashDisplayMode === "mesh") {
    ctx2d.textAlign = "center";
    ctx2d.textBaseline = "middle";
    ctx2d.shadowColor = "rgba(16, 34, 44, 0.55)";
    ctx2d.shadowBlur = 8;
    ctx2d.fillStyle = "#e9f4ff";
    ctx2d.font = "700 154px Sora, Manrope, sans-serif";
    ctx2d.fillText(speedLabel, w * 0.5, h * 0.5);
    ctx2d.shadowBlur = 0;
    ctx2d.fillStyle = "rgba(188, 214, 232, 0.86)";
    ctx2d.font = "700 25px Sora, Manrope, sans-serif";
    ctx2d.fillText("KM/H", w * 0.5, h * 0.8);
    three.dashDisplayTexture.needsUpdate = true;
    return;
  }

  if (three.dashDisplayMode === "target-overlay") {
    const uiShapeScale = TARGET_OVERLAY_UI_TOP_SCALE;
    const bg = ctx2d.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#081019");
    bg.addColorStop(1, "#0e1a26");
    ctx2d.fillStyle = bg;
    drawDashDisplayShapePath(ctx2d, 0, 0, w, h, uiShapeScale);
    ctx2d.fill();

    ctx2d.strokeStyle = "rgba(52, 170, 228, 0.55)";
    ctx2d.lineWidth = 6;
    drawDashDisplayShapePath(ctx2d, 7, 7, w - 14, h - 14, uiShapeScale * 0.98);
    ctx2d.stroke();

    ctx2d.textAlign = "center";
    ctx2d.textBaseline = "middle";
    ctx2d.shadowColor = "rgba(16, 34, 44, 0.5)";
    ctx2d.shadowBlur = 7;
    ctx2d.fillStyle = "#eaf5ff";
    ctx2d.font = "700 154px Sora, Manrope, sans-serif";
    ctx2d.fillText(speedLabel, w * 0.5, h * 0.5);
    ctx2d.shadowBlur = 0;
    ctx2d.fillStyle = "rgba(188, 214, 232, 0.9)";
    ctx2d.font = "700 25px Sora, Manrope, sans-serif";
    ctx2d.fillText("KM/H", w * 0.5, h * 0.8);
    three.dashDisplayTexture.needsUpdate = true;
    return;
  }

  const bg = ctx2d.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "rgba(8, 11, 15, 0.96)");
  bg.addColorStop(1, "rgba(22, 28, 36, 0.94)");
  ctx2d.fillStyle = bg;
  drawDashDisplayShapePath(ctx2d, 8, 8, w - 16, h - 16, topScale);
  ctx2d.fill();

  ctx2d.strokeStyle = "rgba(167, 206, 230, 0.36)";
  ctx2d.lineWidth = 4;
  drawDashDisplayShapePath(ctx2d, 10, 10, w - 20, h - 20, topScale * 0.98);
  ctx2d.stroke();

  ctx2d.fillStyle = "#e9f4ff";
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "middle";
  ctx2d.font = "700 148px Sora, Manrope, sans-serif";
  ctx2d.fillText(speedLabel, w * 0.52, h * 0.54);

  ctx2d.fillStyle = "rgba(194, 219, 239, 0.88)";
  ctx2d.font = "700 32px Sora, Manrope, sans-serif";
  ctx2d.fillText("KM/H", w * 0.52, h * 0.84);

  three.dashDisplayTexture.needsUpdate = true;
}

function placeDashDisplay(parent, position, rotationY, width, height, topScale = 0.78) {
  const three = state.sim.three;
  if (!parent || !three.lib) {
    return;
  }
  ensureDashDisplayResources(three.lib);
  setDashDisplayTopScale(topScale);
  three.dashDisplayMode = "overlay";
  three.dashDisplayTargetMesh = null;
  three.dashDisplayTargetName = "";
  if (three.dashDisplayTexture) {
    three.dashDisplayTexture.flipY = true;
    three.dashDisplayTexture.needsUpdate = true;
  }
  const mesh = three.dashDisplayMesh;
  if (!mesh) {
    return;
  }

  if (mesh.parent !== parent) {
    if (mesh.parent) {
      mesh.parent.remove(mesh);
    }
    parent.add(mesh);
  }

  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(0, rotationY, 0);
  mesh.scale.set(width, height, 1);
}

function createThreeCockpit(THREE) {
  const root = new THREE.Group();
  root.position.set(0, -0.95, -0.06);

  const darkMat = new THREE.MeshStandardMaterial({ color: 0x151a1f, roughness: 0.86, metalness: 0.08 });
  const softMat = new THREE.MeshStandardMaterial({ color: 0x343b42, roughness: 0.92, metalness: 0.06 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x96b9cb, roughness: 0.12, metalness: 0.1 });

  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.82), softMat);
  dash.position.set(0, -0.11, -0.48);
  root.add(dash);

  const clusterHood = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.24), darkMat);
  clusterHood.position.set(0.03, 0.03, -0.58);
  root.add(clusterHood);

  const clusterScreen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.02), glassMat);
  clusterScreen.position.set(0.03, 0.03, -0.7);
  root.add(clusterScreen);

  const topFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.12), darkMat);
  topFrame.position.set(0, 0.74, -0.18);
  root.add(topFrame);

  const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.25, 0.1), darkMat);
  leftPillar.position.set(-0.92, 0.14, -0.26);
  leftPillar.rotation.z = 0.18;
  root.add(leftPillar);

  const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.25, 0.14), darkMat);
  rightPillar.position.set(0.9, 0.14, -0.26);
  rightPillar.rotation.z = -0.3;
  root.add(rightPillar);

  const wheelGroup = new THREE.Group();
  wheelGroup.position.set(-0.18, -0.33, -0.36);
  root.add(wheelGroup);

  const wheelRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.19, 0.03, 20, 42),
    new THREE.MeshStandardMaterial({ color: 0x080b0f, roughness: 0.58, metalness: 0.24 }),
  );
  wheelGroup.add(wheelRing);

  const hub = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.07), darkMat);
  wheelGroup.add(hub);

  const spoke1 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.02), softMat);
  spoke1.position.set(0, 0.08, 0);
  wheelGroup.add(spoke1);

  const spoke2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.02), softMat);
  spoke2.position.set(-0.08, -0.09, 0);
  spoke2.rotation.z = -0.55;
  wheelGroup.add(spoke2);

  const spoke3 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.17, 0.02), softMat);
  spoke3.position.set(0.08, -0.09, 0);
  spoke3.rotation.z = 0.55;
  wheelGroup.add(spoke3);

  return { root, wheelGroup };
}

function renderLaneProfileEntryTrimPatches(THREE, routeGroup) {
  const checkpoints = state.sim.route?.checkpoints || [];
  if (!checkpoints.length) {
    return;
  }
  const routePath = state.sim.routePath?.length ? state.sim.routePath : state.sim.routeDensePath;
  if (!Array.isArray(routePath) || routePath.length < 3) {
    return;
  }

  const edgePointForSide = (node, right, leftHalf, rightHalf, sideSign) => {
    const centerShift = (rightHalf - leftHalf) * 0.5;
    const center = {
      x: node.x + right.x * centerShift,
      y: node.y + right.y * centerShift,
    };
    const sideOffset = sideSign > 0 ? rightHalf : -leftHalf;
    return {
      x: center.x + right.x * sideOffset,
      y: center.y + right.y * sideOffset,
    };
  };

  const roadPatchMat = new THREE.MeshStandardMaterial({
    color: 0x2e343b,
    roughness: 0.95,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });
  const shoulderPatchMat = new THREE.MeshStandardMaterial({
    color: 0x4f3f33,
    roughness: 1,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  for (const checkpoint of checkpoints) {
    if (checkpoint?.type !== "lane_profile_3") {
      continue;
    }
    const profile = laneProfile3RuntimeMeta(checkpoint, routePath);
    if (!profile || profile.expansionMode !== "trim_previous") {
      continue;
    }
    const startSeg = profile.startSegmentIndex;
    if (startSeg <= 0 || startSeg >= routePath.length - 1) {
      continue;
    }

    const prevStart = routePath[startSeg - 1];
    const node = routePath[startSeg];
    const nextNode = routePath[startSeg + 1];
    if (!prevStart || !node || !nextNode || node.move || nextNode.move) {
      continue;
    }

    const prevVec = { x: node.x - prevStart.x, y: node.y - prevStart.y };
    const nextVec = { x: nextNode.x - node.x, y: nextNode.y - node.y };
    const prevLen = Math.hypot(prevVec.x, prevVec.y);
    const nextLen = Math.hypot(nextVec.x, nextVec.y);
    if (prevLen < 0.8 || nextLen < 0.8) {
      continue;
    }
    const prevHeading = Math.atan2(prevVec.y, prevVec.x);
    const nextHeading = Math.atan2(nextVec.y, nextVec.x);
    const prevDir = { x: prevVec.x / prevLen, y: prevVec.y / prevLen };
    const prevRight = { x: Math.sin(prevHeading), y: -Math.cos(prevHeading) };
    const nextRight = { x: Math.sin(nextHeading), y: -Math.cos(nextHeading) };

    const samplePrev = {
      x: prevStart.x + prevVec.x * 0.985,
      y: prevStart.y + prevVec.y * 0.985,
    };
    const prevHalf = routeRoadHalfWidthsAt(samplePrev.x, samplePrev.y, prevHeading, startSeg - 1);

    const sStart = profile.startAnchorSide === "right" ? 1 : -1;
    const baseHalf = ROAD_BASE_WIDTH_M * 0.5;
    const targetLeft = baseHalf + ((1 - sStart) * ROAD_EXTRA_LANE_WIDTH_M) / 2;
    const targetRight = baseHalf + ((1 + sStart) * ROAD_EXTRA_LANE_WIDTH_M) / 2;
    const nextCenterShift = (targetRight - targetLeft) * 0.5;
    const nextCenterAtNode = {
      x: node.x + nextRight.x * nextCenterShift,
      y: node.y + nextRight.y * nextCenterShift,
    };
    // Keep trim depth automatic and stable for trim_previous mode (independent from Transition(m)).
    const autoTrimDepthM = ROAD_EXTRA_LANE_WIDTH_M + 0.9;
    const maxTrim = Math.max(
      0.8,
      Math.min(prevLen * 0.72, autoTrimDepthM),
    );

    for (const sideSign of [1, -1]) {
      const prevSideHalf = sideSign > 0 ? prevHalf.right : prevHalf.left;
      const targetSideHalf = sideSign > 0 ? targetRight : targetLeft;
      if (targetSideHalf <= prevSideHalf + 0.08) {
        continue;
      }

      const prevEdgeAtNode = edgePointForSide(node, prevRight, prevHalf.left, prevHalf.right, sideSign);
      const nextEdgeAtNode = edgePointForSide(node, nextRight, targetLeft, targetRight, sideSign);
      const hit = lineIntersection2D(prevEdgeAtNode, prevDir, nextCenterAtNode, nextRight);
      let trimDist = Math.min(maxTrim, Math.max(0.9, targetSideHalf - prevSideHalf + 0.45));
      if (hit && Number.isFinite(hit.t) && hit.t < -0.2) {
        trimDist = Math.min(maxTrim, Math.max(0.6, -hit.t));
      }
      const trimPoint = {
        x: prevEdgeAtNode.x - prevDir.x * trimDist,
        y: prevEdgeAtNode.y - prevDir.y * trimDist,
      };
      if (Math.hypot(trimPoint.x - prevEdgeAtNode.x, trimPoint.y - prevEdgeAtNode.y) < 0.35) {
        continue;
      }

      const shoulderPrevLeft = prevHalf.left + ROAD_SHOULDER_HALF_EXTRA_M;
      const shoulderPrevRight = prevHalf.right + ROAD_SHOULDER_HALF_EXTRA_M;
      const shoulderTargetLeft = targetLeft + ROAD_SHOULDER_HALF_EXTRA_M;
      const shoulderTargetRight = targetRight + ROAD_SHOULDER_HALF_EXTRA_M;
      const prevShoulderAtNode = edgePointForSide(node, prevRight, shoulderPrevLeft, shoulderPrevRight, sideSign);
      const nextShoulderAtNode = edgePointForSide(node, nextRight, shoulderTargetLeft, shoulderTargetRight, sideSign);
      const hitShoulder = lineIntersection2D(prevShoulderAtNode, prevDir, nextCenterAtNode, nextRight);
      let trimShoulderDist = trimDist + ROAD_SHOULDER_HALF_EXTRA_M * 0.6;
      if (hitShoulder && Number.isFinite(hitShoulder.t) && hitShoulder.t < -0.2) {
        trimShoulderDist = Math.min(maxTrim + ROAD_SHOULDER_HALF_EXTRA_M, Math.max(0.8, -hitShoulder.t));
      }
      const trimShoulderPoint = {
        x: prevShoulderAtNode.x - prevDir.x * trimShoulderDist,
        y: prevShoulderAtNode.y - prevDir.y * trimShoulderDist,
      };

      const shoulderPatch = new THREE.Mesh(
        buildGroundTriangleGeometry(THREE, [trimShoulderPoint, prevShoulderAtNode, nextShoulderAtNode]),
        shoulderPatchMat,
      );
      shoulderPatch.position.y = 0.008;
      routeGroup.add(shoulderPatch);

      const roadPatch = new THREE.Mesh(
        buildGroundTriangleGeometry(THREE, [trimPoint, prevEdgeAtNode, nextEdgeAtNode]),
        roadPatchMat,
      );
      roadPatch.position.y = 0.024;
      routeGroup.add(roadPatch);
    }
  }
}

function rebuildThreeRouteScene() {
  const three = state.sim.three;
  if (!three.ready || !state.sim.route) {
    return;
  }

  const THREE = three.lib;
  const { routeGroup } = three;
  if (!THREE || !routeGroup) {
    return;
  }

  clearThreeGroup(routeGroup);
  three.trafficLightRefs = [];
  three.parkingSlotRefs = [];

  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2e343b, roughness: 0.95, metalness: 0.03 });
  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x4f3f33, roughness: 1, metalness: 0 });
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xe7eaee, roughness: 0.65, metalness: 0 });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x496949, roughness: 1, metalness: 0 });

  const bounds = state.sim.routeBounds ?? computeRouteBounds(state.sim.routeDensePath);
  const groundW = Math.max(180, bounds.maxX - bounds.minX + 120);
  const groundH = Math.max(180, bounds.maxY - bounds.minY + 120);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(groundW, groundH), grassMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set((bounds.minX + bounds.maxX) / 2, -0.03, -((bounds.minY + bounds.maxY) / 2));
  routeGroup.add(ground);

  const rawPath = state.sim.routeDensePath?.length ? state.sim.routeDensePath : state.sim.routePath;
  const path = smoothRenderPath(rawPath);
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i];
    const b = path[Math.min(i + 1, path.length - 1)];
    if (!a || !b || b.move) {
      continue;
    }
    const ax = a.x;
    const az = -a.y;
    const bx = b.x;
    const bz = -b.y;
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.hypot(dx, dz);
    if (len < 0.4) {
      continue;
    }

    const angle = Math.atan2(dz, dx);
    const mx = (ax + bx) / 2;
    const mz = (az + bz) / 2;
    const segHeadingMap = Math.atan2(b.y - a.y, b.x - a.x);
    const rightMap = { x: Math.sin(segHeadingMap), y: -Math.cos(segHeadingMap) };
    const halfWidths = routeRoadHalfWidthsAt(mx, -mz, segHeadingMap);
    const roadLeft = halfWidths.left;
    const roadRight = halfWidths.right;
    const isAsymmetric = Math.abs(roadRight - roadLeft) > 0.05;

    if (!isAsymmetric) {
      const roadWidth = roadLeft + roadRight;
      const shoulderWidth = roadWidth + ROAD_SHOULDER_HALF_EXTRA_M * 2;

      const shoulder = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, shoulderWidth), shoulderMat);
      shoulder.position.set(mx, 0.005, mz);
      shoulder.rotation.y = -angle;
      routeGroup.add(shoulder);

      const road = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, roadWidth), roadMat);
      road.position.set(mx, 0.02, mz);
      road.rotation.y = -angle;
      routeGroup.add(road);
    } else {
      const roadWidth = roadLeft + roadRight;
      const shoulderWidth = roadWidth + ROAD_SHOULDER_HALF_EXTRA_M * 2;
      const centerShift = (roadRight - roadLeft) * 0.5;
      const centerX = mx + rightMap.x * centerShift;
      const centerY = -mz + rightMap.y * centerShift;
      const centerZ = -centerY;

      const shoulder = new THREE.Mesh(new THREE.BoxGeometry(len, 0.03, shoulderWidth), shoulderMat);
      shoulder.position.set(centerX, 0.005, centerZ);
      shoulder.rotation.y = -angle;
      routeGroup.add(shoulder);

      const road = new THREE.Mesh(new THREE.BoxGeometry(len, 0.04, roadWidth), roadMat);
      road.position.set(centerX, 0.02, centerZ);
      road.rotation.y = -angle;
      routeGroup.add(road);
    }

    const currentDividerOffsets = routeLaneDividerOffsets(halfWidths);
    const prevDividerOffsets = i > 0 && !a.move ? routeLaneDividerOffsetsForSegment(path, i - 1) : [];
    const nextDividerOffsets = i + 2 < path.length && !path[i + 2].move
      ? routeLaneDividerOffsetsForSegment(path, i + 1)
      : [];
    const prevHeading = i > 0 && !a.move
      ? Math.atan2(a.y - path[i - 1].y, a.x - path[i - 1].x)
      : null;
    const nextHeading = i + 2 < path.length && !path[i + 2].move
      ? Math.atan2(path[i + 2].y - b.y, path[i + 2].x - b.x)
      : null;
    const segmentHeading = Math.atan2(b.y - a.y, b.x - a.x);
    const startTurnAbs = prevHeading == null
      ? 0
      : normalizeHeadingDeltaRad(segmentHeading, prevHeading);
    const endTurnAbs = nextHeading == null
      ? 0
      : normalizeHeadingDeltaRad(nextHeading, segmentHeading);
    for (const dividerOffset of currentDividerOffsets) {
      const hasPrevMatch = hasLaneDividerOffsetMatch(dividerOffset, prevDividerOffsets);
      const hasNextMatch = hasLaneDividerOffsetMatch(dividerOffset, nextDividerOffsets);
      // Drop isolated divider fragments that appear at 2->3 / 3->2 transition corners.
      if (!hasPrevMatch && !hasNextMatch) {
        continue;
      }
      const baseDividerLen = len * 0.8;
      const edgeTrim = Math.min(0.95, baseDividerLen * 0.45);
      const trimStart = hasPrevMatch ? 0 : edgeTrim;
      const trimEnd = hasNextMatch ? 0 : edgeTrim;
      let effectiveTrimStart = trimStart;
      let effectiveTrimEnd = trimEnd;
      // On sharp corners, a full continuity match can still create a visible "bulge"
      // from overlapping dash boxes; gently trim each side by turn intensity.
      const turnTrimCap = Math.min(0.62, baseDividerLen * 0.34);
      if (hasPrevMatch && startTurnAbs > 0.24) {
        const t = Math.min(1, (startTurnAbs - 0.24) / 1.05);
        effectiveTrimStart = Math.max(effectiveTrimStart, turnTrimCap * t);
      }
      if (hasNextMatch && endTurnAbs > 0.24) {
        const t = Math.min(1, (endTurnAbs - 0.24) / 1.05);
        effectiveTrimEnd = Math.max(effectiveTrimEnd, turnTrimCap * t);
      }
      const dividerLen = baseDividerLen - effectiveTrimStart - effectiveTrimEnd;
      const hasOneSidedContinuation = hasPrevMatch !== hasNextMatch;
      // Avoid tiny one-sided divider remnants at sharp 2->3 / 3->2 corners.
      // They appear as floating mini-dashes with mixed heading.
      if (hasOneSidedContinuation && dividerLen < 0.95) {
        continue;
      }
      if (dividerLen < 0.22) {
        continue;
      }
      const shiftAlong = (effectiveTrimStart - effectiveTrimEnd) * 0.5;
      const dirX = dx / Math.max(0.001, len);
      const dirZ = dz / Math.max(0.001, len);
      const dividerX = mx + rightMap.x * dividerOffset;
      const dividerY = -mz + rightMap.y * dividerOffset;
      const divider = new THREE.Mesh(new THREE.BoxGeometry(dividerLen, 0.042, 0.14), lineMat);
      divider.position.set(dividerX + dirX * shiftAlong, 0.043, -dividerY - dirZ * shiftAlong);
      divider.rotation.y = -angle;
      routeGroup.add(divider);
    }
  }

  renderLaneProfileEntryTrimPatches(THREE, routeGroup);

  // Fill segment joints with rounded caps so curves/roundabouts look smooth
  // instead of showing polygonal wedge gaps between straight road pieces.
  for (let i = 0; i < path.length; i += 1) {
    const point = path[i];
    if (!point) {
      continue;
    }

    const prev = i > 0 ? path[i - 1] : null;
    const next = path[i + 1] || null;
    const hasPrevConnection = Boolean(prev && !point.move);
    const hasNextConnection = Boolean(next && !next.move);
    if (!(hasPrevConnection && hasNextConnection)) {
      continue;
    }

    const prevHeading = Math.atan2(point.y - prev.y, point.x - prev.x);
    const nextHeading = Math.atan2(next.y - point.y, next.x - point.x);
    const prevMid = { x: (prev.x + point.x) * 0.5, y: (prev.y + point.y) * 0.5 };
    const nextMid = { x: (next.x + point.x) * 0.5, y: (next.y + point.y) * 0.5 };
    const prevHalf = routeRoadHalfWidthsAt(prevMid.x, prevMid.y, prevHeading, i - 1);
    const nextHalf = routeRoadHalfWidthsAt(nextMid.x, nextMid.y, nextHeading, i);

    const leftDiff = Math.abs(prevHalf.left - nextHalf.left);
    const rightDiff = Math.abs(prevHalf.right - nextHalf.right);
    // Do not round-off transitions where width changes (e.g. +1 lane starts/ends),
    // otherwise caps visually extend the widened tramo.
    if (leftDiff > 0.15 || rightDiff > 0.15) {
      continue;
    }

    const avgLeft = (prevHalf.left + nextHalf.left) * 0.5;
    const avgRight = (prevHalf.right + nextHalf.right) * 0.5;
    const capOffset = (avgRight - avgLeft) * 0.5;
    const capFrame = routeFrameAt(point.x, point.y, nextHeading, i);
    const capCenterX = point.x + capFrame.right.x * capOffset;
    const capCenterY = point.y + capFrame.right.y * capOffset;
    const roadRadius = (avgLeft + avgRight) * 0.5;
    const shoulderRadius = roadRadius + ROAD_SHOULDER_HALF_EXTRA_M;

    const shoulderCap = new THREE.Mesh(
      new THREE.CylinderGeometry(shoulderRadius, shoulderRadius, 0.03, ROAD_RENDER_JOINT_SEGMENTS),
      shoulderMat,
    );
    shoulderCap.position.set(capCenterX, 0.005, -capCenterY);
    routeGroup.add(shoulderCap);

    const roadCap = new THREE.Mesh(
      new THREE.CylinderGeometry(roadRadius, roadRadius, 0.04, ROAD_RENDER_JOINT_SEGMENTS),
      roadMat,
    );
    roadCap.position.set(capCenterX, 0.02, -capCenterY);
    routeGroup.add(roadCap);
  }

  for (const checkpoint of state.sim.route.checkpoints) {
    if (checkpoint.type === "parking_parallel" || checkpoint.type === "parking_diagonal") {
      const baseShape = parkingShape(checkpoint);
      const slotShapes = parkingSlotShapes(checkpoint);
      const connector = parkingConnectorShape(checkpoint, baseShape);
      const boxL = Number(checkpoint.meta.boxL || 6.0);
      const boxW = Number(checkpoint.meta.boxW || 2.5);

      if (connector) {
        const connectorFill = new THREE.Mesh(
          connector.corners
            ? buildGroundQuadGeometry(THREE, connector.corners)
            : new THREE.PlaneGeometry(connector.length, connector.width),
          new THREE.MeshStandardMaterial({
            color: 0x2c333a,
            roughness: 0.94,
            metalness: 0.03,
            side: THREE.DoubleSide,
          }),
        );
        if (connector.corners) {
          connectorFill.position.y = 0.048;
        } else {
          applyGroundAlignedYaw(connectorFill, connector.orientation);
          connectorFill.position.set(connector.center.x, 0.048, -connector.center.y);
        }
        routeGroup.add(connectorFill);
      }

      for (const shape of slotShapes) {
        const bayMaterial = new THREE.MeshStandardMaterial({
          color: 0x2a3036,
          roughness: 0.94,
          metalness: 0.03,
          side: THREE.DoubleSide,
        });
        const bayFill = checkpoint.type === "parking_diagonal"
          ? new THREE.Mesh(buildGroundQuadGeometry(THREE, shape.corners), bayMaterial)
          : new THREE.Mesh(new THREE.PlaneGeometry(boxL * 1.04, boxW * 1.08), bayMaterial);
        if (checkpoint.type === "parking_diagonal") {
          bayFill.position.y = 0.055;
        } else {
          applyGroundAlignedYaw(bayFill, shape.orientation);
          bayFill.position.set(shape.center.x, 0.055, -shape.center.y);
        }
        routeGroup.add(bayFill);

        const frameMaterial = new THREE.LineBasicMaterial({ color: 0xeff4f8 });
        const frame = checkpoint.type === "parking_diagonal"
          ? new THREE.Line(buildGroundLoopGeometry(THREE, shape.corners), frameMaterial)
          : new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(boxL, boxW)), frameMaterial);
        if (checkpoint.type === "parking_diagonal") {
          frame.position.y = 0.065;
        } else {
          applyGroundAlignedYaw(frame, shape.orientation);
          frame.position.set(shape.center.x, 0.065, -shape.center.y);
        }
        routeGroup.add(frame);

        three.parkingSlotRefs.push({
          checkpointId: checkpoint.id,
          checkpointType: checkpoint.type,
          shape,
          bayMaterial,
          frameMaterial,
        });

      }
    }
  }

  const bumpCheckpoints = routeCheckpoints("speed_bump");
  for (const checkpoint of bumpCheckpoints) {
    const segment = speedBumpSegment(checkpoint);
    const { heading, laneWidth, bumpHeight } = segment;
    const centerX = segment.center.x;
    const centerY = segment.center.y;

    const bump = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, bumpHeight, laneWidth),
      new THREE.MeshStandardMaterial({ color: 0xf3d061, roughness: 0.74, metalness: 0.02 }),
    );
    bump.position.set(centerX, 0.055 + bumpHeight * 0.5, -centerY);
    bump.rotation.y = heading;
    routeGroup.add(bump);
  }

  const stopLineCps = routeStopLines();
  for (const checkpoint of stopLineCps) {
    const segment = stopLineSegment(checkpoint);
    const lineMesh = new THREE.Mesh(
      buildGroundQuadGeometry(THREE, segment.corners),
      new THREE.MeshStandardMaterial({
        color: 0xf3f8ff,
        roughness: 0.84,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
    );
    lineMesh.position.y = 0.063;
    routeGroup.add(lineMesh);
  }

  const startCanopyCheckpoints = routeCheckpoints("start_canopy");
  for (const checkpoint of startCanopyCheckpoints) {
    const canopyGroup = buildStartCanopyGroup(THREE, checkpoint);
    routeGroup.add(canopyGroup);
  }

  const trafficCps = routeCheckpoints("traffic_light");
  for (const trafficCp of trafficCps) {
    const placement = trafficLightPlacement(trafficCp);
    const poleX = placement.poleBase.x;
    const poleY = placement.poleBase.y;

    const tlGroup = new THREE.Group();
    tlGroup.position.set(poleX, 0, -poleY);
    // Local traffic-light mesh faces +Z; convert map heading (x,y) to world yaw (x,z).
    // Using +heading keeps vertical/diagonal orientation consistent with "with_path/reverse".
    tlGroup.rotation.y = Math.PI / 2 + placement.signalHeading;

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 3.4, 14),
      new THREE.MeshStandardMaterial({ color: 0x30363b, roughness: 0.7, metalness: 0.15 }),
    );
    pole.position.y = 1.7;
    tlGroup.add(pole);

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.82, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x121417, roughness: 0.5, metalness: 0.18 }),
    );
    box.position.y = 3.15;
    tlGroup.add(box);

    const redMat = new THREE.MeshStandardMaterial({ color: 0x55141a, emissive: 0x000000, roughness: 0.35 });
    const greenMat = new THREE.MeshStandardMaterial({ color: 0x1d5a3f, emissive: 0x000000, roughness: 0.35 });

    const redLamp = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), redMat);
    redLamp.position.set(0, 3.35, 0.15);
    tlGroup.add(redLamp);

    const greenLamp = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), greenMat);
    greenLamp.position.set(0, 2.95, 0.15);
    tlGroup.add(greenLamp);

    routeGroup.add(tlGroup);
    three.trafficLightRefs.push({ redMat, greenMat });
  }

  const guardTowerCheckpoints = routeCheckpoints("guard_tower");
  for (const checkpoint of guardTowerCheckpoints) {
    const towerGroup = buildGuardTowerGroup(THREE, checkpoint);
    routeGroup.add(towerGroup);
  }

  const treeCheckpoints = routeCheckpoints("tree");
  if (treeCheckpoints.length) {
    for (const checkpoint of treeCheckpoints) {
      const size = Math.max(0.6, Math.min(2.6, Number(checkpoint.meta?.size) || 1));
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16 * size, 0.22 * size, 1.8 * size, 8),
        new THREE.MeshStandardMaterial({ color: 0x4f3a2f, roughness: 1 }),
      );
      trunk.position.set(checkpoint.x, 0.9 * size, -checkpoint.y);
      routeGroup.add(trunk);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(1.0 * size, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x2d5f35, roughness: 0.95 }),
      );
      crown.position.set(checkpoint.x, 2.3 * size, -checkpoint.y);
      routeGroup.add(crown);
    }
  } else {
    // Lightweight tree scatter for extra depth when no explicit trees exist.
    for (let i = 0; i < path.length; i += 26) {
      const p = path[i];
      const next = path[Math.min(i + 1, path.length - 1)];
      if (!p || !next || next.move) {
        continue;
      }
      const heading = Math.atan2(next.y - p.y, next.x - p.x);
      const side = i % 2 === 0 ? 1 : -1;
      const offset = 16 + (i % 4) * 2.5;
      const tx = p.x + Math.sin(heading) * offset * side;
      const ty = p.y - Math.cos(heading) * offset * side;

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x4f3a2f, roughness: 1 }),
      );
      trunk.position.set(tx, 1.2, -ty);
      routeGroup.add(trunk);

      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(1.35, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0x2d5f35, roughness: 0.95 }),
      );
      crown.position.set(tx, 3.1, -ty);
      routeGroup.add(crown);
    }
  }
}

function drawMiniMapOverlay() {
  const ctxMini = miniCtx;
  const w = dom.miniMapCanvas.width;
  const h = dom.miniMapCanvas.height;
  ctxMini.clearRect(0, 0, w, h);

  if (!state.sim.route || !state.sim.routeDensePath.length) {
    ctxMini.fillStyle = "rgba(7, 21, 31, 0.92)";
    ctxMini.fillRect(0, 0, w, h);
    ctxMini.fillStyle = "#a9c8d9";
    ctxMini.font = "12px Sora, sans-serif";
    ctxMini.fillText("Map idle", 12, 20);
    return;
  }

  const bounds = state.sim.routeBounds ?? computeRouteBounds(state.sim.routeDensePath);
  const pad = 10;
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.min((w - pad * 2) / width, (h - pad * 2) / height);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  function mp(point) {
    return {
      x: w / 2 + (point.x - cx) * scale,
      y: h / 2 - (point.y - cy) * scale,
    };
  }

  ctxMini.fillStyle = "rgba(8, 22, 31, 0.86)";
  ctxMini.fillRect(0, 0, w, h);

  ctxMini.strokeStyle = "rgba(120, 95, 80, 0.95)";
  ctxMini.lineWidth = 6;
  ctxMini.beginPath();
  let started = false;
  for (const point of state.sim.routeDensePath) {
    if (point.move) {
      started = false;
      continue;
    }
    const p = mp(point);
    if (!started) {
      ctxMini.moveTo(p.x, p.y);
      started = true;
    } else {
      ctxMini.lineTo(p.x, p.y);
    }
  }
  ctxMini.stroke();

  ctxMini.strokeStyle = "rgba(228, 236, 244, 0.88)";
  ctxMini.lineWidth = 1.8;
  ctxMini.beginPath();
  started = false;
  for (const point of state.sim.routeDensePath) {
    if (point.move) {
      started = false;
      continue;
    }
    const p = mp(point);
    if (!started) {
      ctxMini.moveTo(p.x, p.y);
      started = true;
    } else {
      ctxMini.lineTo(p.x, p.y);
    }
  }
  ctxMini.stroke();

  for (const checkpoint of state.sim.route.checkpoints) {
    if (checkpoint.type === "lane_profile_3") {
      continue;
    }
    const p = mp(checkpoint);
    ctxMini.fillStyle = colorForCheckpoint(checkpoint.type);
    ctxMini.beginPath();
    ctxMini.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
    ctxMini.fill();
  }

  const nowMs = Date.now();
  const peers = peersForActiveRoute(nowMs);
  for (const peer of peers) {
    const pose = peerRenderPose(peer);
    const presence = peerPresenceState(peer, nowMs);
    const p = mp(pose);
    const heading = toRadians(pose.headingDeg || 0);
    const size = 5;
    ctxMini.fillStyle = presence === "afk" ? "#ffd166" : "#75d7ff";
    ctxMini.beginPath();
    ctxMini.moveTo(p.x + Math.cos(-heading) * size, p.y + Math.sin(-heading) * size);
    ctxMini.lineTo(
      p.x + Math.cos(-heading + 2.4) * (size * 0.78),
      p.y + Math.sin(-heading + 2.4) * (size * 0.78),
    );
    ctxMini.lineTo(
      p.x + Math.cos(-heading - 2.4) * (size * 0.78),
      p.y + Math.sin(-heading - 2.4) * (size * 0.78),
    );
    ctxMini.closePath();
    ctxMini.fill();
  }

  if (state.sim.car) {
    const p = mp(state.sim.car);
    const heading = toRadians(state.sim.car.headingDeg);
    const size = 6;
    ctxMini.fillStyle = "#ff7a21";
    ctxMini.beginPath();
    ctxMini.moveTo(p.x + Math.cos(-heading) * size, p.y + Math.sin(-heading) * size);
    ctxMini.lineTo(
      p.x + Math.cos(-heading + 2.4) * (size * 0.8),
      p.y + Math.sin(-heading + 2.4) * (size * 0.8),
    );
    ctxMini.lineTo(
      p.x + Math.cos(-heading - 2.4) * (size * 0.8),
      p.y + Math.sin(-heading - 2.4) * (size * 0.8),
    );
    ctxMini.closePath();
    ctxMini.fill();
  }
}

let lastCanvasSyncMs = 0;
let lastHudOverlayMs = 0;
let lastMiniMapOverlayMs = 0;

function maybeSyncCanvas(nowMs) {
  if (nowMs - lastCanvasSyncMs >= CANVAS_SYNC_INTERVAL_MS) {
    syncCanvasSize();
    lastCanvasSyncMs = nowMs;
  }
}

function maybeUpdateOverlays(nowMs) {
  const hudInterval = state.sim.sessionId ? HUD_UPDATE_INTERVAL_ACTIVE_MS : HUD_UPDATE_INTERVAL_IDLE_MS;
  if (nowMs - lastHudOverlayMs >= hudInterval) {
    updateHudOverlay();
    lastHudOverlayMs = nowMs;
  }

  const mapInterval = state.sim.sessionId ? MINIMAP_UPDATE_INTERVAL_ACTIVE_MS : MINIMAP_UPDATE_INTERVAL_IDLE_MS;
  if (nowMs - lastMiniMapOverlayMs >= mapInterval) {
    drawMiniMapOverlay();
    lastMiniMapOverlayMs = nowMs;
  }

  if (state.multiplayer.connected && state.multiplayer.roomId) {
    const peers = peersForActiveRoute(nowMs);
    const active = peers.filter((peer) => peerPresenceState(peer, nowMs) === "active").length;
    const afk = Math.max(0, peers.length - active);
    const suffix = peers.length === 1 ? "player" : "players";
    const extra = afk > 0 ? `, ${afk} afk` : "";
    setMultiplayerStatus(`connected to "${state.multiplayer.roomId}" (${peers.length} other ${suffix}: ${active} active${extra}).`);
  }
}

function findSteeringNode(root) {
  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  let fallback = null;
  root.traverse((node) => {
    const name = (node.name || "").toLowerCase();
    if (!name) {
      return;
    }

    let score = 0;
    if (STEERING_HINT_REGEX.test(name)) {
      score += 48;
    }
    if (/(steering|volante|manubrio|timon)/.test(name)) {
      score += 120;
    }
    if (/(sw_empty|sw_base|steering_wheel|steeringwheel)/.test(name)) {
      score += 86;
    }
    if (STEERING_REJECT_REGEX.test(name)) {
      score -= 140;
    }

    if (score > bestScore) {
      bestScore = score;
      best = node;
    }

    if (!fallback && /wheel/.test(name) && INTERIOR_HINT_REGEX.test(name)) {
      fallback = node;
    }
  });

  if (bestScore > 0) {
    return best;
  }
  return fallback || null;
}

function findSteeringRotationNode(steeringNode) {
  if (!steeringNode) {
    return null;
  }

  let best = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  steeringNode.traverse((node) => {
    if (node === steeringNode) {
      return;
    }

    const name = (node.name || "").toLowerCase();
    if (!name || STEERING_REJECT_REGEX.test(name)) {
      return;
    }

    let score = 0;
    if (/(sw_base|steeringwheel|steering_wheel|volante)/.test(name)) {
      score += 130;
    }
    if (/(steer|wheel|sw_)/.test(name)) {
      score += 58;
    }
    if (node.isMesh) {
      score += 24;
    }
    if (/empty/.test(name)) {
      score -= 30;
    }

    if (score > bestScore) {
      bestScore = score;
      best = node;
    }
  });

  return best || steeringNode;
}

function axisVectorInWorld(THREE, node, axis) {
  const origin = node.getWorldPosition(new THREE.Vector3());
  const p = axis === "x" ? new THREE.Vector3(1, 0, 0) : axis === "y" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
  const worldP = node.localToWorld(p);
  return worldP.sub(origin).normalize();
}

function detectAxisForWorldDirection(THREE, node, targetWorldDirection) {
  const target = targetWorldDirection.clone().normalize();
  let bestAxis = "y";
  let bestVec = axisVectorInWorld(THREE, node, "y");
  let bestScore = Math.abs(bestVec.dot(target));

  for (const axis of ["x", "z"]) {
    const vec = axisVectorInWorld(THREE, node, axis);
    const score = Math.abs(vec.dot(target));
    if (score > bestScore) {
      bestScore = score;
      bestAxis = axis;
      bestVec = vec;
    }
  }

  const sign = Math.sign(bestVec.dot(target)) || 1;
  return { axis: bestAxis, sign, confidence: bestScore };
}

function isolateSteeringAssembly(steeringNode) {
  if (!steeringNode?.name || !/sw_empty/i.test(steeringNode.name) || !steeringNode.parent) {
    return;
  }

  const parent = steeringNode.parent;
  const toDetach = [];
  for (const child of steeringNode.children) {
    const name = (child.name || "").toLowerCase();
    if (/empty\.044|cube\.087/.test(name)) {
      toDetach.push(child);
    }
  }

  for (const node of toDetach) {
    parent.attach(node);
  }
}

function collectFrontWheelSteerRefs(root) {
  const refs = [];
  const frontWheelNames = new Set(["emptyflwheels", "emptyfrwheels"]);
  root.traverse((node) => {
    const name = (node.name || "").toLowerCase();
    if (!name) {
      return;
    }

    const normalized = name.replace(/[^a-z0-9]/g, "");
    if (frontWheelNames.has(normalized)) {
      refs.push({
        node,
        steerAxis: "y",
        steerSign: 1,
        baseY: node.rotation.y,
      });
    }
  });
  return refs;
}

function collectRimRollRefs(THREE, root, frontSteerRefs = []) {
  const refs = [];
  const seen = new Set();
  const upDir = new THREE.Vector3(0, 1, 0);
  void frontSteerRefs;

  root.traverse((node) => {
    const name = (node.name || "").toLowerCase();
    if (!name) {
      return;
    }

    const isRimSteerGroup =
      (name.includes("wheelcon") && name.includes("coll")) ||
      name.includes("wheel_cover") ||
      name.includes("rims");
    if (!isRimSteerGroup) {
      return;
    }

    if (seen.has(node.uuid)) {
      return;
    }
    seen.add(node.uuid);

    const axisInfo = detectAxisForWorldDirection(THREE, node, upDir);
    refs.push({
      node,
      steerAxis: axisInfo.axis,
      steerSign: axisInfo.sign || 1,
      base: node.rotation[axisInfo.axis],
    });
  });

  return refs;
}

function buildSteeringPivotFromSwEmpty(THREE, steeringNode) {
  if (!steeringNode?.name || !/sw_empty/i.test(steeringNode.name) || !steeringNode.parent) {
    return null;
  }

  const parent = steeringNode.parent;
  let pivot = parent.children.find((child) => child.name === "sw_visual_pivot");
  if (!pivot) {
    pivot = new THREE.Group();
    pivot.name = "sw_visual_pivot";
    pivot.position.copy(steeringNode.position);
    pivot.quaternion.copy(steeringNode.quaternion);
    pivot.scale.copy(steeringNode.scale);
    parent.add(pivot);
    pivot.updateMatrixWorld(true);
  }

  const wheelParts = [];
  for (const child of [...steeringNode.children]) {
    const name = (child.name || "").toLowerCase();
    const isWheelPart =
      /(torus|sw_base|cube\.07[2-9]|cube\.080)/.test(name) &&
      !/(blocker|blackhole|empty\.044|display|cluster|text|light)/.test(name);
    if (isWheelPart) {
      wheelParts.push(child);
    }
  }

  for (const part of wheelParts) {
    pivot.attach(part);
  }

  return pivot.children.length ? pivot : null;
}

function attachWheelCoversToNearestWheelGroup(THREE, modelRoot) {
  const wheelGroups = [];
  const covers = [];

  modelRoot.traverse((node) => {
    const name = (node.name || "").toLowerCase();
    if (!name) {
      return;
    }

    const isWheelGroup =
      name.includes("empty") &&
      name.includes("wheel") &&
      (name.includes("fl") || name.includes("fr")) &&
      !name.includes("rear");
    if (isWheelGroup) {
      wheelGroups.push(node);
      return;
    }

    if (name.includes("wheel_cover")) {
      covers.push(node);
    }
  });

  if (!wheelGroups.length || !covers.length) {
    return;
  }

  for (const cover of covers) {
    const coverLocal = modelRoot.worldToLocal(cover.getWorldPosition(new THREE.Vector3()));
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const wheel of wheelGroups) {
      const wheelLocal = modelRoot.worldToLocal(wheel.getWorldPosition(new THREE.Vector3()));
      const dx = coverLocal.x - wheelLocal.x;
      const dz = coverLocal.z - wheelLocal.z;
      const score = dx * dx + dz * dz;
      if (score < bestScore) {
        bestScore = score;
        best = wheel;
      }
    }
    if (best) {
      best.attach(cover);
    }
  }
}

function detectSteeringAxis(THREE, node) {
  const box = computeMeshBoundsRelativeTo(THREE, node, node, true) || computeMeshBoundsRelativeTo(THREE, node, node, false);
  if (!box) {
    return "z";
  }
  const size = box.getSize(new THREE.Vector3());
  const entries = [
    { axis: "x", size: size.x },
    { axis: "y", size: size.y },
    { axis: "z", size: size.z },
  ].sort((a, b) => a.size - b.size);
  return entries[0]?.axis || "z";
}

function findDriverSeatNode(THREE, root, steeringNode) {
  const seatCandidates = [];
  root.traverse((node) => {
    const name = (node.name || "").toLowerCase();
    if (!name) {
      return;
    }
    if (/(seat|seats)_?empty/.test(name) || /seat/.test(name)) {
      seatCandidates.push(node);
    }
  });

  if (!seatCandidates.length) {
    return null;
  }
  if (!steeringNode) {
    return seatCandidates[0];
  }

  const steeringPos = steeringNode.getWorldPosition(new THREE.Vector3());
  let best = seatCandidates[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const seat of seatCandidates) {
    const seatPos = seat.getWorldPosition(new THREE.Vector3());
    const dx = seatPos.x - steeringPos.x;
    const dz = seatPos.z - steeringPos.z;
    const score = Math.hypot(dx, dz);
    if (score < bestScore) {
      bestScore = score;
      best = seat;
    }
  }

  return best;
}

function isDescendantOf(node, ancestor) {
  let current = node;
  while (current) {
    if (current === ancestor) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function applyInteriorVisibilityFilter(root, steeringNode) {
  let meshCount = 0;
  let hiddenByName = 0;

  root.traverse((node) => {
    if (!node.isMesh) {
      return;
    }
    meshCount += 1;

    if (steeringNode && isDescendantOf(node, steeringNode)) {
      return;
    }

    const name = (node.name || "").toLowerCase();
    const isInterior = INTERIOR_HINT_REGEX.test(name);
    const isExterior = EXTERIOR_HINT_REGEX.test(name);

    if (isExterior && !isInterior) {
      node.visible = false;
      hiddenByName += 1;
    }
  });

  return { meshCount, hiddenByName };
}

function applyInteriorSpatialFilter(THREE, root, steeringNode) {
  const defaultFocus = new THREE.Vector3(-0.18, -0.34, -0.4);
  const focusWorld = steeringNode ? steeringNode.getWorldPosition(new THREE.Vector3()) : root.localToWorld(defaultFocus.clone());
  const focusLocal = root.worldToLocal(focusWorld.clone());

  let meshCount = 0;
  let hiddenBySpace = 0;
  const box = new THREE.Box3();
  const centerWorld = new THREE.Vector3();
  const centerLocal = new THREE.Vector3();
  const size = new THREE.Vector3();

  root.traverse((node) => {
    if (!node.isMesh || node.visible === false) {
      return;
    }

    if (steeringNode && isDescendantOf(node, steeringNode)) {
      return;
    }

    meshCount += 1;
    box.setFromObject(node);
    box.getCenter(centerWorld);
    box.getSize(size);
    centerLocal.copy(root.worldToLocal(centerWorld.clone()));

    const distToFocus = centerLocal.distanceTo(focusLocal);
    const inCockpitRange =
      Math.abs(centerLocal.x) < 1.55 &&
      centerLocal.y > -1.9 &&
      centerLocal.y < 1.2 &&
      centerLocal.z > -2.8 &&
      centerLocal.z < 0.95;
    const hugeExteriorPiece = size.x > 2.4 || size.y > 1.9 || size.z > 5.5;

    const keep = inCockpitRange || distToFocus < 1.9;
    if (!keep || hugeExteriorPiece) {
      node.visible = false;
      hiddenBySpace += 1;
    }
  });

  return { meshCount, hiddenBySpace };
}

function countVisibleMeshes(root) {
  let count = 0;
  root.traverse((node) => {
    if (node.isMesh && node.visible !== false) {
      count += 1;
    }
  });
  return count;
}

function setAllMeshesVisible(root) {
  let count = 0;
  root.traverse((node) => {
    if (node.isMesh) {
      node.visible = true;
      count += 1;
    }
  });
  return count;
}

function computeMeshBoundsRelativeTo(THREE, root, ancestor, onlyVisible = false) {
  root.updateMatrixWorld(true);
  ancestor.updateMatrixWorld(true);
  const invAncestor = ancestor.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  const meshBox = new THREE.Box3();
  const relativeMatrix = new THREE.Matrix4();
  let hasMesh = false;

  root.traverse((node) => {
    if (!node.isMesh || !node.geometry) {
      return;
    }
    if (onlyVisible && node.visible === false) {
      return;
    }

    if (!node.geometry.boundingBox) {
      node.geometry.computeBoundingBox();
    }
    if (!node.geometry.boundingBox) {
      return;
    }

    meshBox.copy(node.geometry.boundingBox);
    relativeMatrix.copy(invAncestor).multiply(node.matrixWorld);
    meshBox.applyMatrix4(relativeMatrix);
    if (!hasMesh) {
      box.copy(meshBox);
      hasMesh = true;
    } else {
      box.union(meshBox);
    }
  });

  return hasMesh ? box : null;
}

function computeLocalMeshBounds(THREE, root, onlyVisible = false) {
  return computeMeshBoundsRelativeTo(THREE, root, root, onlyVisible);
}

function computeLocalMeshBoundsFiltered(THREE, root, includeRegex, excludeRegex, onlyVisible = false) {
  root.updateMatrixWorld(true);
  const invRoot = root.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  const meshBox = new THREE.Box3();
  const localMatrix = new THREE.Matrix4();
  let hasMesh = false;

  root.traverse((node) => {
    if (!node.isMesh || !node.geometry) {
      return;
    }
    if (onlyVisible && node.visible === false) {
      return;
    }
    const name = (node.name || "").toLowerCase();
    if (includeRegex && !includeRegex.test(name)) {
      return;
    }
    if (excludeRegex && excludeRegex.test(name)) {
      return;
    }

    if (!node.geometry.boundingBox) {
      node.geometry.computeBoundingBox();
    }
    if (!node.geometry.boundingBox) {
      return;
    }

    meshBox.copy(node.geometry.boundingBox);
    localMatrix.copy(invRoot).multiply(node.matrixWorld);
    meshBox.applyMatrix4(localMatrix);
    if (!hasMesh) {
      box.copy(meshBox);
      hasMesh = true;
    } else {
      box.union(meshBox);
    }
  });

  return hasMesh ? box : null;
}

function hideBlockerMeshes(root) {
  let hidden = 0;
  root.traverse((node) => {
    if (!node.isMesh) {
      return;
    }
    const name = (node.name || "").toLowerCase();
    if (BLOCKER_HINT_REGEX.test(name)) {
      node.visible = false;
      hidden += 1;
    }
  });
  return hidden;
}

function pickBestYawForCabinAlignment(THREE, modelRoot) {
  const baseYaw = modelRoot.rotation.y;
  const candidates = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const size = new THREE.Vector3();
  let best = { yaw: 0, score: Number.NEGATIVE_INFINITY };

  for (const yaw of candidates) {
    modelRoot.rotation.y = baseYaw + yaw;
    modelRoot.updateMatrixWorld(true);
    const localBox = computeLocalMeshBounds(THREE, modelRoot);
    if (!localBox) {
      continue;
    }
    localBox.getSize(size);

    // Car cabin should be deeper than wide once aligned to camera forward axis.
    const score = size.z * 2.6 - size.x * 1.4 - Math.abs(size.y - 1.35);
    if (score > best.score) {
      best = { yaw, score };
    }
  }

  modelRoot.rotation.y = baseYaw + best.yaw;
  modelRoot.updateMatrixWorld(true);
  return best.yaw;
}

function alignModelForLeftHandDriveSeat(THREE, modelRoot) {
  const box = computeLocalMeshBounds(THREE, modelRoot);
  if (!box) {
    return;
  }
  const min = box.min.clone();
  const max = box.max.clone();
  const size = box.getSize(new THREE.Vector3());

  if (size.x <= 0.001 || size.y <= 0.001 || size.z <= 0.001) {
    return;
  }

  const eyeEstimate = new THREE.Vector3(
    min.x + size.x * 0.3,
    min.y + size.y * 0.54,
    max.z - size.z * 0.34,
  );

  modelRoot.position.x -= eyeEstimate.x;
  modelRoot.position.y -= eyeEstimate.y;
  modelRoot.position.z -= eyeEstimate.z;

  // Small comfort bias to place dashboard ahead and seat slightly left.
  modelRoot.position.x -= 0.06;
  modelRoot.position.z -= 0.14;
  modelRoot.updateMatrixWorld(true);
}

function normalizeModelTransform(THREE, camera, modelRoot, steeringNode) {
  // Normalize scale and centering so arbitrary car assets fit cockpit space.
  const box = computeLocalMeshBounds(THREE, modelRoot);
  if (!box) {
    return;
  }
  const size = box.getSize(new THREE.Vector3());

  const targetWidth = steeringNode ? 2.6 : 3.1;
  const scale = size.x > 0.001 ? targetWidth / size.x : 1;
  modelRoot.scale.setScalar(scale);
  modelRoot.updateMatrixWorld(true);

  pickBestYawForCabinAlignment(THREE, modelRoot);

  const boxScaled = computeLocalMeshBounds(THREE, modelRoot);
  if (!boxScaled) {
    return;
  }
  const sizeScaled = boxScaled.getSize(new THREE.Vector3());
  const centerScaled = boxScaled.getCenter(new THREE.Vector3());

  modelRoot.position.sub(centerScaled);
  modelRoot.position.y -= sizeScaled.y * 0.5;
  modelRoot.updateMatrixWorld(true);

  if (steeringNode) {
    const currentWorld = new THREE.Vector3();
    steeringNode.getWorldPosition(currentWorld);
    const wheelLocal = camera.worldToLocal(currentWorld.clone());
    const targetWheelLocal = new THREE.Vector3(-0.18, -0.34, -0.38);
    const delta = targetWheelLocal.sub(wheelLocal);
    modelRoot.position.add(delta);
    modelRoot.updateMatrixWorld(true);
  } else {
    alignModelForLeftHandDriveSeat(THREE, modelRoot);
  }

  const postBox = computeLocalMeshBounds(THREE, modelRoot);
  if (!postBox) {
    return;
  }
  const frontMost = postBox.max.z;
  const targetFront = -0.18;
  if (Number.isFinite(frontMost)) {
    modelRoot.position.z += targetFront - frontMost;
    modelRoot.updateMatrixWorld(true);
  }
}

function alignUsingDriverSeat(THREE, camera, modelRoot, seatNode) {
  if (!seatNode) {
    return;
  }
  const seatWorld = new THREE.Vector3();
  seatNode.getWorldPosition(seatWorld);
  const seatLocal = camera.worldToLocal(seatWorld.clone());
  const targetSeatLocal = new THREE.Vector3(-0.14, -0.88, -0.15);
  const delta = targetSeatLocal.sub(seatLocal);
  modelRoot.position.add(delta);
  modelRoot.updateMatrixWorld(true);
}

function normalizeVehicleModelTransform(THREE, modelRoot) {
  function findNamedNode(regex) {
    let match = null;
    modelRoot.traverse((node) => {
      if (match || !node.name) {
        return;
      }
      if (regex.test(node.name.toLowerCase())) {
        match = node;
      }
    });
    return match;
  }

  function alignYawUsingAxles() {
    const frontNode = findNamedNode(/frontwheels|front_wheels|frontwheel/);
    const rearNode = findNamedNode(/rearwheels|rear_wheels|rearwheel/);
    if (!frontNode || !rearNode) {
      return false;
    }

    const frontLocal = modelRoot.worldToLocal(frontNode.getWorldPosition(new THREE.Vector3()));
    const rearLocal = modelRoot.worldToLocal(rearNode.getWorldPosition(new THREE.Vector3()));
    const dir = frontLocal.sub(rearLocal);
    const yaw = Math.atan2(dir.z, dir.x);
    if (!Number.isFinite(yaw)) {
      return false;
    }

    modelRoot.rotation.y -= yaw;
    modelRoot.updateMatrixWorld(true);
    return true;
  }

  function enforceForwardPositiveX() {
    const frontNode = findNamedNode(/frontwheels|front_wheels|frontwheel/);
    const rearNode = findNamedNode(/rearwheels|rear_wheels|rearwheel/);
    if (!frontNode || !rearNode) {
      return;
    }
    const frontLocal = modelRoot.worldToLocal(frontNode.getWorldPosition(new THREE.Vector3()));
    const rearLocal = modelRoot.worldToLocal(rearNode.getWorldPosition(new THREE.Vector3()));
    if (frontLocal.x < rearLocal.x) {
      modelRoot.rotation.y += Math.PI;
      modelRoot.updateMatrixWorld(true);
    }
  }

  function collectAxleCentersLocal() {
    const frontPoints = [];
    const rearPoints = [];
    modelRoot.traverse((node) => {
      const name = (node.name || "").toLowerCase();
      if (!name) {
        return;
      }
      if (!/(wheel|tire|tyre|rim)/.test(name)) {
        return;
      }
      if (/(coll|collision|blocker|proxy|helper|occluder)/.test(name)) {
        return;
      }

      const normalized = name.replace(/[^a-z0-9]/g, "");
      const isFront =
        normalized.includes("front") ||
        normalized.includes("flwheel") ||
        normalized.includes("frwheel") ||
        normalized.includes("flwheels") ||
        normalized.includes("frwheels");
      const isRear =
        normalized.includes("rear") ||
        normalized.includes("rlwheel") ||
        normalized.includes("rrwheel") ||
        normalized.includes("rlwheels") ||
        normalized.includes("rrwheels") ||
        normalized.includes("backwheel");
      if (isFront === isRear) {
        return;
      }

      const local = modelRoot.worldToLocal(node.getWorldPosition(new THREE.Vector3()));
      if (!Number.isFinite(local.x) || !Number.isFinite(local.y) || !Number.isFinite(local.z)) {
        return;
      }
      if (isFront) {
        frontPoints.push(local);
      } else {
        rearPoints.push(local);
      }
    });

    if (!frontPoints.length || !rearPoints.length) {
      return null;
    }

    const avg = (points) => {
      const sum = points.reduce((acc, p) => acc.add(p), new THREE.Vector3());
      return sum.multiplyScalar(1 / points.length);
    };
    return {
      front: avg(frontPoints),
      rear: avg(rearPoints),
    };
  }

  pickBestYawForCabinAlignment(THREE, modelRoot);
  if (!alignYawUsingAxles()) {
    const boxPre = computeLocalMeshBounds(THREE, modelRoot);
    if (!boxPre) {
      return;
    }
    const sizePre = boxPre.getSize(new THREE.Vector3());
    if (sizePre.z > sizePre.x) {
      modelRoot.rotation.y -= Math.PI / 2;
      modelRoot.updateMatrixWorld(true);
    }
  }

  const baseBox = computeLocalMeshBounds(THREE, modelRoot, true) || computeLocalMeshBounds(THREE, modelRoot);
  if (!baseBox) {
    return;
  }
  const baseSize = baseBox.getSize(new THREE.Vector3());
  const lengthBasis = Math.max(baseSize.x, baseSize.z);
  const targetLength = 4.35;
  const scale = lengthBasis > 0.001 ? targetLength / lengthBasis : 1;
  modelRoot.scale.setScalar(scale);
  modelRoot.updateMatrixWorld(true);
  enforceForwardPositiveX();

  const box = computeLocalMeshBounds(THREE, modelRoot, true) || computeLocalMeshBounds(THREE, modelRoot);
  if (!box) {
    return;
  }
  const center = box.getCenter(new THREE.Vector3());

  const wheelBox =
    computeLocalMeshBoundsFiltered(
      THREE,
      modelRoot,
      /(wheel|tire|tyre|rim)/i,
      /(coll|collision|blocker|helper|proxy|occluder)/i,
      true,
    ) ||
    computeLocalMeshBoundsFiltered(
      THREE,
      modelRoot,
      /(wheel|tire|tyre|rim)/i,
      /(coll|collision|blocker|helper|proxy|occluder)/i,
      false,
    );

  modelRoot.position.x -= center.x;
  modelRoot.position.z -= center.z;
  const groundMinY = wheelBox ? wheelBox.min.y : box.min.y;
  modelRoot.position.y -= groundMinY;
  modelRoot.position.y += 0.005;

  const axleCenters = collectAxleCentersLocal();
  if (axleCenters) {
    const rearWorld = modelRoot.localToWorld(axleCenters.rear.clone());
    // Put rear axle midpoint at marker origin, so turns feel like a real passenger car.
    modelRoot.position.x -= rearWorld.x;
    modelRoot.position.z -= rearWorld.z;
  } else {
    // Fallback when axle nodes are not identifiable.
    const rearAxlePivotBias = Math.max(0.38, Math.min(0.95, baseSize.x * 0.18));
    modelRoot.position.x += rearAxlePivotBias;
  }
  modelRoot.updateMatrixWorld(true);
}

function enforceCockpitInFrontOfCamera(THREE, camera, modelRoot) {
  let camBounds = computeMeshBoundsRelativeTo(THREE, modelRoot, camera, true);
  if (!camBounds) {
    camBounds = computeMeshBoundsRelativeTo(THREE, modelRoot, camera, false);
  }
  if (!camBounds) {
    return null;
  }

  // If cockpit ends up behind/at camera, force it into the visible front volume.
  if (camBounds.max.z > -0.22) {
    modelRoot.position.z += -0.22 - camBounds.max.z;
    modelRoot.updateMatrixWorld(true);
    camBounds = computeMeshBoundsRelativeTo(THREE, modelRoot, camera, true) || camBounds;
  }

  // Keep some interior depth in front to avoid "no cockpit" view.
  if (camBounds.min.z > -0.9) {
    modelRoot.position.z += -0.9 - camBounds.min.z;
    modelRoot.updateMatrixWorld(true);
    camBounds = computeMeshBoundsRelativeTo(THREE, modelRoot, camera, true) || camBounds;
  }

  // Avoid pushing the whole model too far away in front.
  if (camBounds.max.z < -7.5) {
    modelRoot.position.z += -1.2 - camBounds.max.z;
    modelRoot.updateMatrixWorld(true);
    camBounds = computeMeshBoundsRelativeTo(THREE, modelRoot, camera, true) || camBounds;
  }

  return camBounds;
}

function calibrateModelYaw(THREE, modelRoot, steeringNode) {
  if (!steeringNode) {
    return { yaw: 0, score: null };
  }

  const candidates = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  const baseYaw = modelRoot.rotation.y;
  let best = { yaw: 0, score: Number.POSITIVE_INFINITY };
  const wheelWorld = new THREE.Vector3();

  for (const yaw of candidates) {
    modelRoot.rotation.y = baseYaw + yaw;
    modelRoot.updateMatrixWorld(true);
    steeringNode.getWorldPosition(wheelWorld);
    const wheelLocal = modelRoot.worldToLocal(wheelWorld.clone());

    const score =
      Math.abs(wheelLocal.x + 0.18) * 2.5 +
      Math.abs(wheelLocal.z + 0.38) * 3.2 +
      (wheelLocal.x > 0 ? 12 : 0) +
      (wheelLocal.z > 0 ? 10 : 0);

    if (score < best.score) {
      best = { yaw, score };
    }
  }

  modelRoot.rotation.y = baseYaw + best.yaw;
  modelRoot.updateMatrixWorld(true);
  return best;
}

function summarizeLoadError(error) {
  if (!error) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error.message) {
    return error.message;
  }
  if (error.target?.status) {
    return `HTTP ${error.target.status}`;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "unserializable error";
  }
}

function cockpitDebugSummary() {
  const three = state.sim.three;
  const modelRoot = three.vehicleModelRoot || three.cockpitModelRoot;
  if (three.cockpitSource !== "model" || !modelRoot) {
    return "source=procedural";
  }

  const root = modelRoot;
  const visibleMeshes = countVisibleMeshes(root);
  const seat = three.driverSeatLocal
    ? ` seat=(${three.driverSeatLocal.x.toFixed(2)}, ${three.driverSeatLocal.y.toFixed(2)}, ${three.driverSeatLocal.z.toFixed(2)})`
    : "";
  const camBounds = three.camera
    ? computeMeshBoundsRelativeTo(three.lib, root, three.camera, true) ||
      computeMeshBoundsRelativeTo(three.lib, root, three.camera, false)
    : null;
  const zRange = camBounds ? ` camZ=[${camBounds.min.z.toFixed(2)}, ${camBounds.max.z.toFixed(2)}]` : "";
  const dash =
    three.dashDisplayMode === "mesh"
      ? ` dash=mesh(${three.dashDisplayTargetName || "unknown"})`
      : three.dashDisplayMode === "target-overlay"
        ? ` dash=target-overlay(${three.dashDisplayTargetName || "detected"})`
        : " dash=overlay";
  return (
    `source=model visibleMeshes=${visibleMeshes} ` +
    `pos=(${root.position.x.toFixed(2)}, ${root.position.y.toFixed(2)}, ${root.position.z.toFixed(2)})` +
    `${zRange}${seat}${dash} parent=${root.parent?.type || "none"}`
  );
}

function mountCockpitModelToCamera() {
  const three = state.sim.three;
  const model = three.cockpitModelRoot;
  if (!model || !three.camera) {
    return;
  }
  if (model.parent === three.camera) {
    return;
  }
  if (model.parent) {
    model.parent.remove(model);
  }
  three.camera.add(model);
}

function unmountCockpitModelFromCamera() {
  const three = state.sim.three;
  const model = three.cockpitModelRoot;
  if (!model) {
    return;
  }
  if (model.parent) {
    model.parent.remove(model);
  }
}

async function loadRealCockpitModel() {
  const three = state.sim.three;
  if (!three.ready || !three.lib || !three.camera) {
    return;
  }

  if (three.cockpitModelRoot) {
    return;
  }

  try {
    const [{ GLTFLoader }, { DRACOLoader }, meshoptModule] = await Promise.all([
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/loaders/DRACOLoader.js"),
      import("three/addons/libs/meshopt_decoder.module.js"),
    ]);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/");
    loader.setDRACOLoader(dracoLoader);
    if (meshoptModule?.MeshoptDecoder) {
      loader.setMeshoptDecoder(meshoptModule.MeshoptDecoder);
    }

    let gltf = null;
    const loadErrors = [];
    for (const modelUrl of COCKPIT_MODEL_URLS) {
      // eslint-disable-next-line no-await-in-loop
      const loaded = await new Promise((resolve) => {
        loader.load(
          modelUrl,
          (asset) => resolve(asset),
          undefined,
          (error) => {
            loadErrors.push(`${modelUrl}: ${summarizeLoadError(error)}`);
            resolve(null);
          },
        );
      });

      if (loaded) {
        gltf = loaded;
        break;
      }
    }

    if (!gltf) {
      throw new Error(loadErrors.join(" | ") || "cockpit model not found");
    }

    const modelRoot = gltf.scene;
    const THREE = three.lib;
    let wheelCandidate = null;
    modelRoot.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = false;
        node.receiveShadow = false;
        node.frustumCulled = false;
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of materials) {
          if (!material) {
            continue;
          }
          if (material.metalness !== undefined) {
            material.metalness = Math.min(0.35, material.metalness + 0.05);
            material.roughness = Math.max(0.35, material.roughness ?? 0.75);
          }
          if (material.side !== undefined) {
            material.side = THREE.DoubleSide;
          }
          material.needsUpdate = true;
        }

        const name = (node.name || "").toLowerCase();
        if (BLOCKER_HINT_REGEX.test(name)) {
          node.visible = false;
        }
      }
    });

    if (three.carMarker) {
      if (three.vehicleModelRoot?.parent) {
        three.vehicleModelRoot.parent.remove(three.vehicleModelRoot);
      }
      three.carMarker.add(modelRoot);
      const blockerHidden = hideBlockerMeshes(modelRoot);
      normalizeVehicleModelTransform(THREE, modelRoot);
      attachWheelCoversToNearestWheelGroup(THREE, modelRoot);
      const visibleMeshes = countVisibleMeshes(modelRoot);

      const markerBody = three.carMarker.getObjectByName("car-marker-body");
      if (markerBody) {
        markerBody.visible = false;
      }
      three.vehicleModelRoot = modelRoot;
      three.vehicleFootprintLocal = null;
      three.vehicleGlassMeshes = [];
      modelRoot.traverse((node) => {
        if (!node.isMesh) {
          return;
        }
        const name = (node.name || "").toLowerCase();
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        const hasGlassMaterial = materials.some((material) => {
          if (!material) {
            return false;
          }
          const materialName = (material.name || "").toLowerCase();
          return (
            GLASS_HINT_REGEX.test(materialName) ||
            material.transparent === true ||
            (typeof material.opacity === "number" && material.opacity < 0.98) ||
            (typeof material.transmission === "number" && material.transmission > 0.01)
          );
        });
        if (GLASS_HINT_REGEX.test(name) || hasGlassMaterial) {
          three.vehicleGlassMeshes.push(node);
        }
      });
      three.frontWheelSteerRefs = collectFrontWheelSteerRefs(modelRoot);
      for (const ref of three.frontWheelSteerRefs) {
        // Keep front wheel steering on local yaw to avoid orbit/swing artifacts.
        ref.steerAxis = "y";
        ref.steerSign = 1;
        ref.base = ref.node.rotation.y;
      }
      three.rimRollRefs = collectRimRollRefs(THREE, modelRoot, three.frontWheelSteerRefs);
      three.cockpitModelRoot = null;
      three.cockpitSource = "model";

      const modelBoundsLocal = computeMeshBoundsRelativeTo(THREE, modelRoot, three.carMarker, true);
      if (modelBoundsLocal) {
        three.vehicleFootprintLocal = {
          minX: modelBoundsLocal.min.x,
          maxX: modelBoundsLocal.max.x,
          minY: modelBoundsLocal.min.y,
          maxY: modelBoundsLocal.max.y,
          minZ: modelBoundsLocal.min.z,
          maxZ: modelBoundsLocal.max.z,
        };
      }

      wheelCandidate = findSteeringNode(modelRoot);
      isolateSteeringAssembly(wheelCandidate);
      let wheelVisualNode = buildSteeringPivotFromSwEmpty(THREE, wheelCandidate) || findSteeringRotationNode(wheelCandidate);
      const forwardDir = new THREE.Vector3(1, 0, 0);
      const wheelAxisInfo = wheelVisualNode
        ? detectAxisForWorldDirection(THREE, wheelVisualNode, forwardDir)
        : { axis: "x", sign: 1, confidence: 0 };
      const wheelVisualAxis = wheelAxisInfo.axis;
      const seatCandidate = findDriverSeatNode(THREE, modelRoot, wheelCandidate);

      const wheelLocal = wheelCandidate
        ? three.carMarker.worldToLocal(wheelCandidate.getWorldPosition(new THREE.Vector3()))
        : null;

      if (seatCandidate) {
        const seatWorld = seatCandidate.getWorldPosition(new THREE.Vector3());
        const seatLocal = three.carMarker.worldToLocal(seatWorld.clone());
        const eye = seatLocal.clone();
        if (wheelLocal) {
          const forwardSign = Math.sign(wheelLocal.x - seatLocal.x) || 1;
          three.driverForwardSign = forwardSign;
          three.vehicleYawOffsetRad = forwardSign < 0 ? Math.PI : 0;
          // Keep eye behind steering wheel and slightly above it.
          eye.x = wheelLocal.x - forwardSign * 0.62;
          eye.y = Math.max(seatLocal.y + 0.84, wheelLocal.y + 0.45);
          eye.z = seatLocal.z * 0.72 + wheelLocal.z * 0.28;
        } else {
          eye.x = seatLocal.x - 0.34;
          eye.y = seatLocal.y + 0.84;
          eye.z = seatLocal.z;
          three.driverForwardSign = 1;
          three.vehicleYawOffsetRad = 0;
        }
        three.driverSeatLocal = eye;
      } else if (wheelLocal) {
        three.driverSeatLocal = wheelLocal.clone().add(new THREE.Vector3(-0.62, 0.34, 0.0));
        three.driverForwardSign = Math.sign(wheelLocal.x) || 1;
        three.vehicleYawOffsetRad = three.driverForwardSign < 0 ? Math.PI : 0;
      } else {
        three.driverSeatLocal = new THREE.Vector3(-0.28, 1.16, 0.0);
        three.driverForwardSign = 1;
        three.vehicleYawOffsetRad = 0;
      }

      if (wheelCandidate) {
        three.wheelMesh = wheelVisualNode;
        three.wheelSteerRef = {
          node: wheelVisualNode,
          axis: wheelVisualAxis,
          sign: wheelAxisInfo.sign,
          base: wheelVisualNode.rotation[wheelVisualAxis],
        };
      }

      const dashForwardSign = three.driverForwardSign || 1;
      const dashTarget = pickDashboardTargetMesh(
        THREE,
        modelRoot,
        three.carMarker,
        wheelLocal,
        three.driverSeatLocal,
        dashForwardSign,
      );
      let dashModeDebug = "overlay";
      if (dashTarget) {
        const dashPos = dashTarget.center.clone();
        const outwardOffset = Math.max(0.003, Math.min(0.012, dashTarget.major * 0.028));
        dashPos.x += -(dashForwardSign || 1) * outwardOffset;
        const fittedWidth = Math.max(0.18, Math.min(0.52, dashTarget.major * 1.06));
        const fittedHeight = Math.max(0.07, Math.min(0.24, dashTarget.minor * 1.14));
        placeDashDisplay(
          three.carMarker,
          dashPos,
          dashForwardSign > 0 ? -Math.PI / 2 : Math.PI / 2,
          fittedWidth,
          fittedHeight,
          1,
        );
        three.dashDisplayMode = "target-overlay";
        three.dashDisplayTargetName = dashTarget.name || "(unnamed)";
        dashModeDebug = `target-overlay:${dashTarget.name} score=${dashTarget.score.toFixed(1)} off=${outwardOffset.toFixed(3)}`;
      } else {
        const dashAnchor = wheelLocal
          ? wheelLocal.clone().add(
              new THREE.Vector3(
                dashForwardSign * MODEL_DASH_DISPLAY.forwardFromWheel,
                MODEL_DASH_DISPLAY.upFromWheel,
                0.0,
              ),
            )
          : three.driverSeatLocal
            ? three.driverSeatLocal.clone().add(
                new THREE.Vector3(
                  dashForwardSign * MODEL_DASH_DISPLAY.fallbackForwardFromSeat,
                  MODEL_DASH_DISPLAY.fallbackUpFromSeat,
                  0.0,
                ),
              )
            : new THREE.Vector3(dashForwardSign * MODEL_DASH_DISPLAY.fallbackX, MODEL_DASH_DISPLAY.fallbackY, 0.0);
        placeDashDisplay(
          three.carMarker,
          dashAnchor,
          dashForwardSign > 0 ? -Math.PI / 2 : Math.PI / 2,
          MODEL_DASH_DISPLAY.width,
          MODEL_DASH_DISPLAY.height,
          MODEL_DASH_DISPLAY.topScale,
        );
      }
      drawDashDisplaySpeed(state.sim.car?.speedKmh ?? 0);

      three.modelError = "";
      const steerRefPreview = three.frontWheelSteerRefs
        .slice(0, 6)
        .map((ref) => ref.node?.name || "?")
        .join(", ");
      const rimSteerPreview = three.rimRollRefs
        .slice(0, 6)
        .map((ref) => ref.node?.name || "?")
        .join(", ");
      const details =
        `Real cockpit loaded (${blockerHidden} hidden meshes, ${visibleMeshes} visible). ` +
        `Wheel node: ${wheelCandidate?.name || "not found"}, wheel visual: ${wheelVisualNode?.name || "not found"} (${wheelVisualAxis}, sign=${wheelAxisInfo.sign}), seat node: ${seatCandidate?.name || "not found"}, wheel steer refs=${three.frontWheelSteerRefs.length}${steerRefPreview ? ` [${steerRefPreview}]` : ""}, rim steer refs=${three.rimRollRefs.length}${rimSteerPreview ? ` [${rimSteerPreview}]` : ""}, dash mode=${dashModeDebug}. ${cockpitDebugSummary()}`;
      setWebglStatus(details);
      dom.simOutput.textContent = details;
    } else {
      throw new Error("car marker not initialized");
    }
  } catch (error) {
    const errorMessage = summarizeLoadError(error);
    three.modelError = errorMessage;
    three.cockpitSource = "procedural";
    if (three.vehicleModelRoot?.parent) {
      three.vehicleModelRoot.parent.remove(three.vehicleModelRoot);
    }
    three.vehicleModelRoot = null;
    three.vehicleFootprintLocal = null;
    three.vehicleGlassMeshes = [];
    three.frontWheelSteerRefs = [];
    three.wheelSteerRef = null;
    three.rimRollRefs = [];
    three.driverSeatLocal = null;
    three.driverForwardSign = 1;
    three.vehicleYawOffsetRad = 0;
    three.dashDisplayMode = "overlay";
    three.dashDisplayTargetMesh = null;
    three.dashDisplayTargetName = "";
    const markerBody = three.carMarker?.getObjectByName("car-marker-body");
    if (markerBody) {
      markerBody.visible = true;
    }
    if (three.cockpitRoot) {
      three.cockpitRoot.visible = true;
    }
    if (three.cockpitRoot && three.lib) {
      placeDashDisplay(
        three.cockpitRoot,
        new three.lib.Vector3(PROCEDURAL_DASH_DISPLAY.x, PROCEDURAL_DASH_DISPLAY.y, PROCEDURAL_DASH_DISPLAY.z),
        PROCEDURAL_DASH_DISPLAY.rotationY,
        PROCEDURAL_DASH_DISPLAY.width,
        PROCEDURAL_DASH_DISPLAY.height,
        PROCEDURAL_DASH_DISPLAY.topScale,
      );
      drawDashDisplaySpeed(state.sim.car?.speedKmh ?? 0);
    }
    dom.simOutput.textContent = `Cockpit model load failed: ${errorMessage}`;
    // eslint-disable-next-line no-console
    console.warn("Cockpit model load failed:", error);
  }
}

async function initThreeEngine() {
  const three = state.sim.three;
  if (three.ready || three.loading) {
    return;
  }

  three.loading = true;
  setWebglStatus("Loading 3D engine...");

  try {
    const THREE = await import("three");
    three.lib = THREE;

    const renderer = new THREE.WebGLRenderer({
      canvas: dom.glCanvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_RENDER_PIXEL_RATIO));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x79a8c7);
    scene.fog = new THREE.Fog(0x79a8c7, 80, 260);

    const camera = new THREE.PerspectiveCamera(
      68,
      dom.glCanvas.clientWidth / Math.max(1, dom.glCanvas.clientHeight),
      0.05,
      420,
    );
    camera.position.set(0, 1.5, 10);

    const hemi = new THREE.HemisphereLight(0xc6e3ff, 0x446341, 0.76);
    hemi.position.set(0, 60, 0);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff7e6, 0.92);
    sun.position.set(30, 45, 18);
    scene.add(sun);

    const routeGroup = new THREE.Group();
    scene.add(routeGroup);
    const remotePlayersGroup = new THREE.Group();
    scene.add(remotePlayersGroup);

    const carMarker = new THREE.Group();
    const carBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.65, 0.92),
      new THREE.MeshStandardMaterial({ color: 0x1a2732, roughness: 0.72 }),
    );
    carBody.name = "car-marker-body";
    carBody.position.y = 0.48;
    carMarker.add(carBody);
    scene.add(carMarker);

    const cockpit = createThreeCockpit(THREE);
    camera.add(cockpit.root);
    scene.add(camera);

    three.renderer = renderer;
    three.scene = scene;
    three.camera = camera;
    three.routeGroup = routeGroup;
    three.remotePlayersGroup = remotePlayersGroup;
    three.remotePlayerMarkers = new Map();
    three.remoteAfkLabelMaterial = null;
    three.remoteAfkLabelTexture = null;
    three.carMarker = carMarker;
    three.vehicleModelRoot = null;
    three.vehicleFootprintLocal = null;
    three.vehicleGlassMeshes = [];
    three.frontWheelSteerRefs = [];
    three.wheelSteerRef = {
      node: cockpit.wheelGroup,
      axis: "z",
      sign: 1,
      base: cockpit.wheelGroup.rotation.z,
    };
    three.rimRollRefs = [];
    three.driverSeatLocal = null;
    three.driverForwardSign = 1;
    three.vehicleYawOffsetRad = 0;
    three.cockpitRoot = cockpit.root;
    three.cockpitModelRoot = null;
    three.cockpitSource = "procedural";
    three.thirdCameraPos = null;
    three.thirdCameraLook = null;
    three.externalCameraMode = null;
    three.wheelMesh = cockpit.wheelGroup;
    three.dashDisplayMesh = null;
    three.dashDisplayTexture = null;
    three.dashDisplayCanvas = null;
    three.dashDisplayCtx = null;
    three.dashDisplayLastText = "";
    three.dashDisplayTopScale = null;
    three.dashDisplayMode = "overlay";
    three.dashDisplayTargetMesh = null;
    three.dashDisplayTargetName = "";
    three.ready = true;
    three.failed = false;
    three.loading = false;

    placeDashDisplay(
      cockpit.root,
      new THREE.Vector3(PROCEDURAL_DASH_DISPLAY.x, PROCEDURAL_DASH_DISPLAY.y, PROCEDURAL_DASH_DISPLAY.z),
      PROCEDURAL_DASH_DISPLAY.rotationY,
      PROCEDURAL_DASH_DISPLAY.width,
      PROCEDURAL_DASH_DISPLAY.height,
      PROCEDURAL_DASH_DISPLAY.topScale,
    );
    drawDashDisplaySpeed(state.sim.car?.speedKmh ?? 0);

    syncCanvasSize();
    dom.canvas.style.opacity = "0";
    if (state.sim.route) {
      rebuildThreeRouteScene();
    }
    setWebglStatus("3D renderer active. Loading cockpit model if available...");
    loadRealCockpitModel().finally(() => {
      if (three.cockpitSource === "procedural") {
        const detail = three.modelError ? ` Reason: ${three.modelError}` : "";
        const fallbackMessage =
          "Using procedural cockpit. Add /public/assets/models/cockpit_lhd.glb or /public/assets/models/cockpit_lhd/scene.gltf." +
          detail;
        setWebglStatus(fallbackMessage, true);
        dom.simOutput.textContent = fallbackMessage;
      } else {
        const okMessage = "Realistic cockpit model loaded and active.";
        setWebglStatus(okMessage);
        dom.simOutput.textContent = `${dom.simOutput.textContent || ""}\n${okMessage}`.trim();
      }
    });
  } catch (error) {
    three.failed = true;
    three.loading = false;
    setWebglStatus("3D engine failed to load. Falling back to lightweight renderer.", true);
    dom.canvas.style.opacity = "1";
    // eslint-disable-next-line no-console
    console.error(error);
  }
}

function peerColorHex(peerId = "") {
  let hash = 0;
  for (let i = 0; i < peerId.length; i += 1) {
    hash = (hash << 5) - hash + peerId.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  const s = 72;
  const l = 54;
  // HSL to RGB
  const c = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100);
  const hp = hue / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hp >= 0 && hp < 1) {
    r1 = c;
    g1 = x;
  } else if (hp < 2) {
    r1 = x;
    g1 = c;
  } else if (hp < 3) {
    g1 = c;
    b1 = x;
  } else if (hp < 4) {
    g1 = x;
    b1 = c;
  } else if (hp < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }
  const m = l / 100 - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return (r << 16) + (g << 8) + b;
}

function peerDisplayName(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "player";
  }
  return raw.length > 18 ? `${raw.slice(0, 17)}…` : raw;
}

function paintRemoteNameLabel(canvas, ctx2d, label) {
  const w = canvas.width;
  const h = canvas.height;
  const radius = 18;
  const pad = 6;
  ctx2d.clearRect(0, 0, w, h);
  ctx2d.fillStyle = "rgba(9, 16, 24, 0.82)";
  ctx2d.beginPath();
  ctx2d.moveTo(pad + radius, pad);
  ctx2d.lineTo(w - pad - radius, pad);
  ctx2d.quadraticCurveTo(w - pad, pad, w - pad, pad + radius);
  ctx2d.lineTo(w - pad, h - pad - radius);
  ctx2d.quadraticCurveTo(w - pad, h - pad, w - pad - radius, h - pad);
  ctx2d.lineTo(pad + radius, h - pad);
  ctx2d.quadraticCurveTo(pad, h - pad, pad, h - pad - radius);
  ctx2d.lineTo(pad, pad + radius);
  ctx2d.quadraticCurveTo(pad, pad, pad + radius, pad);
  ctx2d.closePath();
  ctx2d.fill();

  ctx2d.strokeStyle = "rgba(119, 218, 255, 0.92)";
  ctx2d.lineWidth = 3;
  ctx2d.stroke();

  const dynamicSize = label.length <= 10 ? 42 : label.length <= 14 ? 36 : 31;
  ctx2d.fillStyle = "#f2fbff";
  ctx2d.font = `700 ${dynamicSize}px Sora, sans-serif`;
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "middle";
  ctx2d.fillText(label, w / 2, h / 2 + 2);
}

function computeRemoteLabelAnchor(THREE, marker) {
  let centerX = 0;
  let centerZ = 0;
  const footprint = state.sim.three.vehicleFootprintLocal;
  if (footprint && Number.isFinite(footprint.minX) && Number.isFinite(footprint.maxX)) {
    centerX = (footprint.minX + footprint.maxX) * 0.5;
  }
  if (footprint && Number.isFinite(footprint.minZ) && Number.isFinite(footprint.maxZ)) {
    centerZ = (footprint.minZ + footprint.maxZ) * 0.5;
  }

  let roofY = Number.isFinite(footprint?.maxY) ? footprint.maxY : 1.0;
  const box = new THREE.Box3();
  box.setFromObject(marker);
  if (Number.isFinite(box.max.y)) {
    roofY = box.max.y;
  }
  if (!footprint && Number.isFinite(box.min.x) && Number.isFinite(box.max.x)) {
    centerX = (box.min.x + box.max.x) * 0.5;
  }
  if (!footprint && Number.isFinite(box.min.z) && Number.isFinite(box.max.z)) {
    centerZ = (box.min.z + box.max.z) * 0.5;
  }

  return {
    x: centerX,
    y: roofY,
    z: centerZ,
  };
}

function ensureRemoteNameLabel(THREE, marker, username) {
  if (!marker?.userData) {
    return;
  }
  const label = peerDisplayName(username);
  if (!marker.userData.nameLabelSprite) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) {
      return;
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    material.sizeAttenuation = true;
    const sprite = new THREE.Sprite(material);
    sprite.name = `${marker.name || "remote"}-name`;
    sprite.center.set(0.5, 0);
    const anchor = marker.userData.labelAnchor || { x: 0, y: 1.0, z: 0 };
    sprite.position.set(anchor.x, anchor.y + 0.7, anchor.z);
    sprite.scale.set(2.45, 0.62, 1);
    marker.add(sprite);
    marker.userData.nameLabelSprite = sprite;
    marker.userData.nameLabelCanvas = canvas;
    marker.userData.nameLabelCtx = ctx2d;
    marker.userData.nameLabelTexture = texture;
    marker.userData.nameLabelMaterial = material;
    marker.userData.nameLabelText = "";
  }

  if (marker.userData.nameLabelText === label) {
    return;
  }
  paintRemoteNameLabel(marker.userData.nameLabelCanvas, marker.userData.nameLabelCtx, label);
  marker.userData.nameLabelTexture.needsUpdate = true;
  marker.userData.nameLabelText = label;
}

function ensureRemoteAfkLabelMaterial(THREE) {
  if (state.sim.three.remoteAfkLabelMaterial) {
    return state.sim.three.remoteAfkLabelMaterial;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) {
    return null;
  }

  const radius = 14;
  const w = canvas.width - 8;
  const h = canvas.height - 8;
  const x = 4;
  const y = 4;
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  ctx2d.fillStyle = "rgba(12, 19, 27, 0.86)";
  ctx2d.beginPath();
  ctx2d.moveTo(x + radius, y);
  ctx2d.lineTo(x + w - radius, y);
  ctx2d.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx2d.lineTo(x + w, y + h - radius);
  ctx2d.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx2d.lineTo(x + radius, y + h);
  ctx2d.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx2d.lineTo(x, y + radius);
  ctx2d.quadraticCurveTo(x, y, x + radius, y);
  ctx2d.closePath();
  ctx2d.fill();

  ctx2d.strokeStyle = "rgba(255, 211, 116, 0.95)";
  ctx2d.lineWidth = 4;
  ctx2d.stroke();

  ctx2d.fillStyle = "#ffd166";
  ctx2d.font = "700 44px Sora, sans-serif";
  ctx2d.textAlign = "center";
  ctx2d.textBaseline = "middle";
  ctx2d.fillText("AFK", canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  material.sizeAttenuation = true;

  state.sim.three.remoteAfkLabelTexture = texture;
  state.sim.three.remoteAfkLabelMaterial = material;
  return material;
}

function createRemotePlayerMarker(THREE, peerId, username = "player") {
  const marker = new THREE.Group();
  marker.name = `remote-${peerId}`;
  marker.userData.kind = "fallback";
  marker.userData.yawOffset = 0;

  const templateModel = state.sim.three.vehicleModelRoot;
  if (templateModel) {
    const modelClone = templateModel.clone(true);
    modelClone.name = `${templateModel.name || "vehicle-model"}-peer-${peerId}`;
    modelClone.traverse((node) => {
      if (!node.isMesh) {
        return;
      }
      const nodeName = (node.name || "").toLowerCase();
      // Remote cars should always render complete exterior, regardless of local first-person visibility toggles.
      node.visible = !BLOCKER_HINT_REGEX.test(nodeName);
      node.castShadow = false;
      node.receiveShadow = false;
      node.frustumCulled = false;
    });
    marker.add(modelClone);
    marker.userData.kind = "model";
    marker.userData.yawOffset = Number(state.sim.three.vehicleYawOffsetRad || 0);
  } else {
    const color = peerColorHex(peerId);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.62, 0.58, 0.9),
      new THREE.MeshStandardMaterial({ color, roughness: 0.65 }),
    );
    body.position.y = 0.47;
    marker.add(body);

    const nose = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.22, 0.74),
      new THREE.MeshStandardMaterial({ color: 0xa5f0ff, roughness: 0.55 }),
    );
    nose.position.set(0.62, 0.58, 0);
    marker.add(nose);
  }

  marker.userData.labelAnchor = computeRemoteLabelAnchor(THREE, marker);

  const afkMaterial = ensureRemoteAfkLabelMaterial(THREE);
  if (afkMaterial) {
    const afkLabel = new THREE.Sprite(afkMaterial);
    afkLabel.name = `remote-${peerId}-afk`;
    afkLabel.center.set(0.5, 0);
    const anchor = marker.userData.labelAnchor || { x: 0, y: 1.0, z: 0 };
    afkLabel.position.set(anchor.x, anchor.y + 0.12, anchor.z);
    afkLabel.scale.set(1.5, 0.56, 1);
    afkLabel.visible = false;
    marker.add(afkLabel);
    marker.userData.afkLabel = afkLabel;
  }

  ensureRemoteNameLabel(THREE, marker, username);

  return marker;
}

function syncThreeRemotePlayers() {
  const three = state.sim.three;
  if (!three.ready || !three.lib || !three.remotePlayersGroup || !three.remotePlayerMarkers) {
    return;
  }

  const nowMs = Date.now();
  const visiblePeers = peersForActiveRoute(nowMs);
  const keep = new Set();
  const wantsModelMarkers = Boolean(three.vehicleModelRoot);
  for (const peer of visiblePeers) {
    const pose = peerRenderPose(peer);
    const presence = peerPresenceState(peer, nowMs);
    keep.add(peer.user_id);
    let marker = three.remotePlayerMarkers.get(peer.user_id);
    if (marker && wantsModelMarkers && marker.userData?.kind !== "model") {
      removeRemotePlayerMarker(peer.user_id);
      marker = null;
    }
    if (!marker) {
      marker = createRemotePlayerMarker(three.lib, peer.user_id, peer.username || "player");
      three.remotePlayerMarkers.set(peer.user_id, marker);
      three.remotePlayersGroup.add(marker);
    }
    ensureRemoteNameLabel(three.lib, marker, peer.username || "player");
    marker.visible = true;
    marker.position.set(pose.x, 0, -pose.y);
    marker.rotation.order = "YXZ";
    const yawOffset = Number(marker.userData?.yawOffset || 0);
    marker.rotation.set(0, toRadians(pose.headingDeg || 0) + yawOffset, 0);
    if (marker.userData?.afkLabel) {
      marker.userData.afkLabel.visible = presence === "afk";
    }
  }

  for (const peerId of three.remotePlayerMarkers.keys()) {
    if (keep.has(peerId)) {
      continue;
    }
    removeRemotePlayerMarker(peerId);
  }
}

function updateThreeScene(dt = 1 / 60) {
  const three = state.sim.three;
  if (!three.ready || !three.renderer || !three.scene || !three.camera) {
    return false;
  }

  const { camera, renderer, scene, carMarker, cockpitRoot, cockpitModelRoot, vehicleModelRoot, wheelMesh, trafficLightRefs } = three;
  const car = state.sim.car;
  const heading = toRadians(car?.headingDeg ?? 0);
  const bumpLift = (state.sim.bumpOffset || 0) + (state.sim.bumpSupport || 0);
  const bumpPitch = state.sim.bumpPitch || 0;
  const bumpRoll = state.sim.bumpRoll || 0;

    if (car) {
      if (carMarker) {
        const modelYawOffset = vehicleModelRoot ? three.vehicleYawOffsetRad || 0 : 0;
        carMarker.visible = true;
        carMarker.position.set(car.x, bumpLift * 0.72, -car.y);
        carMarker.rotation.order = "YXZ";
        carMarker.rotation.set(bumpPitch, heading + modelYawOffset, bumpRoll);
      }

    if (state.sim.camera === "first") {
      // Ensure first-person never inherits top-down camera roll/up vector.
      camera.up.set(0, 1, 0);
      if (vehicleModelRoot && carMarker && three.driverSeatLocal && three.lib) {
        const eyeWorld = carMarker.localToWorld(three.driverSeatLocal.clone());
        eyeWorld.y += bumpLift * 0.72;
        const forwardX = Math.cos(heading);
        const forwardZ = -Math.sin(heading);
        // Keep cockpit seat anchoring from model, but orient look direction from driving physics heading
        // to avoid mirrored/flip artifacts from model-local forward axes.
        const lookWorld = new three.lib.Vector3(
          eyeWorld.x + forwardX * 13,
          eyeWorld.y + 0.06,
          eyeWorld.z + forwardZ * 13,
        );

        if (camera.fov !== 74) {
          camera.fov = 74;
          camera.updateProjectionMatrix();
        }
        camera.up.set(Math.sin(bumpRoll * 0.8), 1, 0);
        camera.position.copy(eyeWorld);
        camera.lookAt(lookWorld);
      } else {
        const leftX = -Math.sin(heading);
        const leftZ = -Math.cos(heading);
        const forwardX = Math.cos(heading);
        const forwardZ = -Math.sin(heading);
        const seatOffset = 0.42;
        const forwardOffset = 0.16;
        const camX = car.x + leftX * seatOffset + forwardX * forwardOffset;
        const camZ = -car.y + leftZ * seatOffset + forwardZ * forwardOffset;

        camera.up.set(Math.sin(bumpRoll * 0.8), 1, 0);
        camera.position.set(camX, 1.34 + bumpLift * 0.82, camZ);
        camera.lookAt(
          camX + forwardX * 13,
          1.5 + bumpLift * 0.58 + bumpPitch * 2.2,
          camZ + forwardZ * 13,
        );
      }
      if (cockpitRoot) {
        cockpitRoot.visible = !vehicleModelRoot && !cockpitModelRoot;
      }
      if (cockpitModelRoot) {
        if (!vehicleModelRoot) {
          mountCockpitModelToCamera();
        } else {
          unmountCockpitModelFromCamera();
        }
        cockpitModelRoot.visible = true;
      }
      if (carMarker) {
        carMarker.visible = !!vehicleModelRoot;
      }
      if (vehicleModelRoot && three.vehicleGlassMeshes.length) {
        for (const mesh of three.vehicleGlassMeshes) {
          mesh.visible = false;
        }
      }
      three.thirdCameraPos = null;
      three.thirdCameraLook = null;
      three.externalCameraMode = null;
    } else {
      const mode = externalCameraMode(state.sim.camera);
      const rig = buildExternalCameraRig(mode, heading, car, bumpLift);
      if (camera.fov !== rig.fov) {
        camera.fov = rig.fov;
        camera.updateProjectionMatrix();
      }
      if (mode === "top") {
        // Keep map-like orientation in strict top-down view.
        camera.up.set(0, 0, -1);
      } else {
        camera.up.set(0, 1, 0);
      }

      if (three.externalCameraMode !== mode) {
        three.thirdCameraPos = null;
        three.thirdCameraLook = null;
        three.externalCameraMode = mode;
      }

      if (!three.thirdCameraPos || !three.thirdCameraLook) {
        const { targetPos, targetLook } = rig;
        three.thirdCameraPos = { ...targetPos };
        three.thirdCameraLook = { ...targetLook };
      } else {
        const { targetPos, targetLook, posLag, lookLag } = rig;
        three.thirdCameraPos.x = smoothTowards(three.thirdCameraPos.x, targetPos.x, posLag, dt);
        three.thirdCameraPos.y = smoothTowards(three.thirdCameraPos.y, targetPos.y, posLag, dt);
        three.thirdCameraPos.z = smoothTowards(three.thirdCameraPos.z, targetPos.z, posLag, dt);
        three.thirdCameraLook.x = smoothTowards(three.thirdCameraLook.x, targetLook.x, lookLag, dt);
        three.thirdCameraLook.y = smoothTowards(three.thirdCameraLook.y, targetLook.y, lookLag, dt);
        three.thirdCameraLook.z = smoothTowards(three.thirdCameraLook.z, targetLook.z, lookLag, dt);
      }

      camera.position.set(three.thirdCameraPos.x, three.thirdCameraPos.y, three.thirdCameraPos.z);
      camera.lookAt(three.thirdCameraLook.x, three.thirdCameraLook.y, three.thirdCameraLook.z);
      if (cockpitRoot) {
        cockpitRoot.visible = false;
      }
      if (cockpitModelRoot) {
        unmountCockpitModelFromCamera();
        cockpitModelRoot.visible = false;
      }
      if (carMarker) {
        carMarker.visible = true;
      }
      if (vehicleModelRoot && three.vehicleGlassMeshes.length) {
        for (const mesh of three.vehicleGlassMeshes) {
          mesh.visible = true;
        }
      }
    }
  } else {
    camera.up.set(0, 1, 0);
    camera.position.set(0, 1.5, 10);
    camera.lookAt(0, 1.3, 0);
    if (cockpitRoot) {
      cockpitRoot.visible = false;
    }
    if (cockpitModelRoot) {
      unmountCockpitModelFromCamera();
      cockpitModelRoot.visible = false;
    }
    if (carMarker) {
      carMarker.visible = false;
    }
    if (vehicleModelRoot && three.vehicleGlassMeshes.length) {
      for (const mesh of three.vehicleGlassMeshes) {
        mesh.visible = true;
      }
    }
    three.thirdCameraPos = null;
    three.thirdCameraLook = null;
    three.externalCameraMode = null;
  }

  if (three.wheelSteerRef?.node) {
    const steerAngle = -toRadians(state.sim.steerVisualAngle * 1.15);
    const { node, axis, sign = 1, base } = three.wheelSteerRef;
    node.rotation[axis] = base + steerAngle * sign;
  } else if (wheelMesh) {
    wheelMesh.rotation.z = -toRadians(state.sim.steerVisualAngle * 1.15);
  }
  const steerWheelAngle = -toRadians(state.sim.steerVisualAngle * 0.075);
  const rimSteerAngle = toRadians(state.sim.steerVisualAngle * 0.075);
  if (vehicleModelRoot && three.frontWheelSteerRefs.length) {
    for (const ref of three.frontWheelSteerRefs) {
      const base = ref.base ?? ref.baseY;
      ref.node.rotation[ref.steerAxis] = base + steerWheelAngle * (ref.steerSign || 1);
    }
  }
  if (vehicleModelRoot && three.rimRollRefs.length) {
    for (const ref of three.rimRollRefs) {
      ref.node.rotation[ref.steerAxis] = ref.base + rimSteerAngle * (ref.steerSign || 1);
    }
  }
  if (Array.isArray(trafficLightRefs) && trafficLightRefs.length) {
    const redOn = isTrafficLightRed();
    for (const refs of trafficLightRefs) {
      refs.redMat.emissive.setHex(redOn ? 0xd21f2e : 0x1a0205);
      refs.greenMat.emissive.setHex(redOn ? 0x041009 : 0x26ba82);
    }
  }
  if (Array.isArray(three.parkingSlotRefs) && three.parkingSlotRefs.length) {
    for (const ref of three.parkingSlotRefs) {
      const checkpoint = routeCheckpoint(ref.checkpointType || "parking_parallel");
      const occupied = checkpoint?.id === ref.checkpointId && isParkingSlotOccupied(checkpoint, ref.shape);
      ref.bayMaterial.color.setHex(occupied ? 0x2f9f5e : 0x2a3036);
      ref.frameMaterial.color.setHex(occupied ? 0xb9ffd0 : 0xeff4f8);
    }
  }
  if (three.dashDisplayMesh) {
    three.dashDisplayMesh.visible =
      three.dashDisplayMode !== "mesh" && Boolean(car) && state.sim.camera === "first";
  }
  if (three.dashDisplayTargetMesh) {
    three.dashDisplayTargetMesh.visible = Boolean(car) && state.sim.camera === "first";
  }
  drawDashDisplaySpeed(car?.speedKmh ?? 0);
  syncThreeRemotePlayers();

  renderer.render(scene, camera);
  return true;
}

function projectWorldPoint(x, y, horizonY) {
  const local = worldToLocal(x, y);
  return projectPerspective(local.right, local.forward, horizonY);
}

function drawTrafficLightStructure(horizonY) {
  const checkpoints = routeCheckpoints("traffic_light");
  if (!checkpoints.length) {
    return;
  }

  for (const checkpoint of checkpoints) {
    const placement = trafficLightPlacement(checkpoint);
    const poleBaseWorld = placement.poleBase;

    const local = worldToLocal(poleBaseWorld.x, poleBaseWorld.y);
    if (local.forward <= 2 || local.forward > 140) {
      continue;
    }

    const base = projectPerspective(local.right, local.forward, horizonY);
    const top = projectPerspective(local.right, local.forward + 1.4, horizonY - Math.max(10, 210 / local.forward));
    if (!base || !top) {
      continue;
    }

    ctx.strokeStyle = "#2f353b";
    ctx.lineWidth = Math.max(2, 26 / local.forward);
    ctx.beginPath();
    ctx.moveTo(base.x, base.y + 8);
    ctx.lineTo(top.x, top.y);
    ctx.stroke();

    const boxW = Math.max(10, 160 / local.forward);
    const boxH = boxW * 2.2;
    ctx.fillStyle = "rgba(18, 22, 27, 0.96)";
    ctx.beginPath();
    ctx.roundRect(top.x - boxW / 2, top.y - boxH * 0.25, boxW, boxH, boxW * 0.16);
    ctx.fill();

    const redY = top.y + boxH * 0.1;
    const greenY = top.y + boxH * 0.72;
    const lampR = boxW * 0.23;

    const redOn = isTrafficLightRed();
    ctx.fillStyle = redOn ? "#f34f5f" : "rgba(105, 32, 42, 0.65)";
    ctx.beginPath();
    ctx.arc(top.x, redY, lampR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = redOn ? "rgba(37, 71, 53, 0.55)" : "#29c18f";
    ctx.beginPath();
    ctx.arc(top.x, greenY, lampR, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawParkingZonesPerspective(horizonY) {
  const parkingCheckpoints = state.sim.route.checkpoints.filter(
    (checkpoint) => checkpoint.type === "parking_parallel" || checkpoint.type === "parking_diagonal",
  );

  for (const checkpoint of parkingCheckpoints) {
    const baseShape = parkingShape(checkpoint);
    const connector = parkingConnectorShape(checkpoint, baseShape);
    const slotShapes = parkingSlotShapes(checkpoint);
    let connectorProjected = null;
    if (connector) {
      connectorProjected = connector.corners.map((corner) =>
        projectWorldPoint(corner.x, corner.y, horizonY),
      );
      if (connectorProjected.some((point) => !point)) {
        continue;
      }
    }

    const asphalt = "rgba(44, 52, 60, 0.95)";
    const asphaltOk = "rgba(44, 128, 74, 0.95)";
    const stroke = "rgba(238, 244, 248, 0.9)";
    const strokeOk = "rgba(199, 255, 217, 0.96)";

    if (connectorProjected) {
      ctx.fillStyle = asphalt;
      ctx.beginPath();
      ctx.moveTo(connectorProjected[0].x, connectorProjected[0].y);
      for (let i = 1; i < connectorProjected.length; i += 1) {
        ctx.lineTo(connectorProjected[i].x, connectorProjected[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    for (const shape of slotShapes) {
      const projected = shape.corners.map((corner) => projectWorldPoint(corner.x, corner.y, horizonY));
      if (projected.some((point) => !point)) {
        continue;
      }
      const occupied = isParkingSlotOccupied(checkpoint, shape);

      ctx.fillStyle = occupied ? asphaltOk : asphalt;
      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < projected.length; i += 1) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = occupied ? strokeOk : stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projected[0].x, projected[0].y);
      for (let i = 1; i < projected.length; i += 1) {
        ctx.lineTo(projected[i].x, projected[i].y);
      }
      ctx.closePath();
      ctx.stroke();

    }
  }
}

function drawSpeedBumpsPerspective(horizonY) {
  const bumps = routeCheckpoints("speed_bump");
  for (const checkpoint of bumps) {
    const segment = speedBumpSegment(checkpoint);
    const projected = segment.corners.map((corner) => projectWorldPoint(corner.x, corner.y, horizonY));
    if (projected.some((point) => !point)) {
      continue;
    }

    ctx.fillStyle = "rgba(250, 212, 98, 0.86)";
    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (let i = 1; i < projected.length; i += 1) {
      ctx.lineTo(projected[i].x, projected[i].y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(186, 124, 46, 0.95)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

function drawStopLinesPerspective(horizonY) {
  const stopLines = routeStopLines();
  for (const checkpoint of stopLines) {
    const segment = stopLineSegment(checkpoint);
    const projected = segment.corners.map((corner) => projectWorldPoint(corner.x, corner.y, horizonY));
    if (projected.some((point) => !point)) {
      continue;
    }

    ctx.fillStyle = "rgba(243, 248, 255, 0.95)";
    ctx.beginPath();
    ctx.moveTo(projected[0].x, projected[0].y);
    for (let i = 1; i < projected.length; i += 1) {
      ctx.lineTo(projected[i].x, projected[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawParkingZonesThirdPerson() {
  const parkingCheckpoints = state.sim.route.checkpoints.filter(
    (checkpoint) => checkpoint.type === "parking_parallel" || checkpoint.type === "parking_diagonal",
  );

  for (const checkpoint of parkingCheckpoints) {
    const baseShape = parkingShape(checkpoint);
    const connector = parkingConnectorShape(checkpoint, baseShape);
    const slotShapes = parkingSlotShapes(checkpoint);
    const connectorCorners = connector ? connector.corners.map((corner) => worldToThirdPersonCanvas(corner.x, corner.y)) : null;

    const fill = "rgba(43, 51, 58, 0.95)";
    const fillOk = "rgba(44, 128, 74, 0.95)";
    const stroke = "rgba(238, 244, 248, 0.95)";
    const strokeOk = "rgba(199, 255, 217, 0.96)";

    if (connectorCorners) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(connectorCorners[0].x, connectorCorners[0].y);
      for (let i = 1; i < connectorCorners.length; i += 1) {
        ctx.lineTo(connectorCorners[i].x, connectorCorners[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    for (const shape of slotShapes) {
      const corners = shape.corners.map((corner) => worldToThirdPersonCanvas(corner.x, corner.y));
      const occupied = isParkingSlotOccupied(checkpoint, shape);
      ctx.fillStyle = occupied ? fillOk : fill;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i += 1) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = occupied ? strokeOk : stroke;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i += 1) {
        ctx.lineTo(corners[i].x, corners[i].y);
      }
      ctx.closePath();
      ctx.stroke();

    }
  }
}

function drawSpeedBumpsThirdPerson() {
  const bumps = routeCheckpoints("speed_bump");
  for (const checkpoint of bumps) {
    const segment = speedBumpSegment(checkpoint);
    const corners = segment.corners.map((corner) => worldToThirdPersonCanvas(corner.x, corner.y));

    ctx.fillStyle = "rgba(250, 212, 98, 0.86)";
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i += 1) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(186, 124, 46, 0.95)";
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
}

function drawStopLinesThirdPerson() {
  const stopLines = routeStopLines();
  for (const checkpoint of stopLines) {
    const segment = stopLineSegment(checkpoint);
    const corners = segment.corners.map((corner) => worldToThirdPersonCanvas(corner.x, corner.y));

    ctx.fillStyle = "rgba(243, 248, 255, 0.95)";
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    for (let i = 1; i < corners.length; i += 1) {
      ctx.lineTo(corners[i].x, corners[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }
}

function drawNoSessionScene() {
  const w = dom.canvas.width;
  const h = dom.canvas.height;

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#152d3e");
  sky.addColorStop(0.52, "#2b5266");
  sky.addColorStop(1, "#0b1a26");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(6, 20, 30, 0.62)";
  ctx.fillRect(0, h * 0.3, w, h * 0.7);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    ctx.moveTo((w / 6) * i, h * 0.3);
    ctx.lineTo((w / 6) * i + 120, h);
    ctx.stroke();
  }

  ctx.fillStyle = "#dbeaf4";
  ctx.font = "600 34px Sora, Manrope, sans-serif";
  ctx.fillText("Route Simulator Ready", 40, 80);
  ctx.font = "500 17px Sora, Manrope, sans-serif";
  ctx.fillStyle = "#b4cedb";
  ctx.fillText("Start a simulation session to enter first-person driving mode.", 40, 114);
}

function drawRoadPerspective(horizonY) {
  const densePath = state.sim.routeDensePath;

  if (!densePath.length) {
    return;
  }

  const candidates = [];

  for (const point of densePath) {
    if (point.move) {
      continue;
    }
    const local = worldToLocal(point.x, point.y);
    if (local.forward > 1.2 && local.forward < 140 && Math.abs(local.right) < 68) {
      candidates.push({ ...local, x: point.x, y: point.y });
    }
  }

  candidates.sort((a, b) => b.forward - a.forward);

  const sampled = [];
  let lastForward = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    if (lastForward - candidate.forward > 0.7) {
      sampled.push(candidate);
      lastForward = candidate.forward;
    }
  }

  if (sampled.length < 2) {
    return;
  }

  for (let i = 0; i < sampled.length - 1; i += 1) {
    const far = sampled[i];
    const near = sampled[i + 1];
    const farFrame = routeFrameAt(far.x, far.y);
    const nearFrame = routeFrameAt(near.x, near.y);
    const farHalfWidths = routeRoadHalfWidthsAt(far.x, far.y, farFrame.heading, farFrame.segmentIndex);
    const nearHalfWidths = routeRoadHalfWidthsAt(near.x, near.y, nearFrame.heading, nearFrame.segmentIndex);

    const shoulderFarLeft = projectWorldPoint(
      far.x - farFrame.right.x * (farHalfWidths.left + ROAD_SHOULDER_HALF_EXTRA_M),
      far.y - farFrame.right.y * (farHalfWidths.left + ROAD_SHOULDER_HALF_EXTRA_M),
      horizonY,
    );
    const shoulderFarRight = projectWorldPoint(
      far.x + farFrame.right.x * (farHalfWidths.right + ROAD_SHOULDER_HALF_EXTRA_M),
      far.y + farFrame.right.y * (farHalfWidths.right + ROAD_SHOULDER_HALF_EXTRA_M),
      horizonY,
    );
    const shoulderNearLeft = projectWorldPoint(
      near.x - nearFrame.right.x * (nearHalfWidths.left + ROAD_SHOULDER_HALF_EXTRA_M),
      near.y - nearFrame.right.y * (nearHalfWidths.left + ROAD_SHOULDER_HALF_EXTRA_M),
      horizonY,
    );
    const shoulderNearRight = projectWorldPoint(
      near.x + nearFrame.right.x * (nearHalfWidths.right + ROAD_SHOULDER_HALF_EXTRA_M),
      near.y + nearFrame.right.y * (nearHalfWidths.right + ROAD_SHOULDER_HALF_EXTRA_M),
      horizonY,
    );

    if (!shoulderFarLeft || !shoulderFarRight || !shoulderNearLeft || !shoulderNearRight) {
      continue;
    }

    ctx.fillStyle = i % 2 === 0 ? "#5a4339" : "#4b382f";
    ctx.beginPath();
    ctx.moveTo(shoulderFarLeft.x, shoulderFarLeft.y);
    ctx.lineTo(shoulderFarRight.x, shoulderFarRight.y);
    ctx.lineTo(shoulderNearRight.x, shoulderNearRight.y);
    ctx.lineTo(shoulderNearLeft.x, shoulderNearLeft.y);
    ctx.closePath();
    ctx.fill();

    const roadFarLeft = projectWorldPoint(
      far.x - farFrame.right.x * farHalfWidths.left,
      far.y - farFrame.right.y * farHalfWidths.left,
      horizonY,
    );
    const roadFarRight = projectWorldPoint(
      far.x + farFrame.right.x * farHalfWidths.right,
      far.y + farFrame.right.y * farHalfWidths.right,
      horizonY,
    );
    const roadNearLeft = projectWorldPoint(
      near.x - nearFrame.right.x * nearHalfWidths.left,
      near.y - nearFrame.right.y * nearHalfWidths.left,
      horizonY,
    );
    const roadNearRight = projectWorldPoint(
      near.x + nearFrame.right.x * nearHalfWidths.right,
      near.y + nearFrame.right.y * nearHalfWidths.right,
      horizonY,
    );

    if (!roadFarLeft || !roadFarRight || !roadNearLeft || !roadNearRight) {
      continue;
    }

    ctx.fillStyle = i % 2 === 0 ? "#262d33" : "#303942";
    ctx.beginPath();
    ctx.moveTo(roadFarLeft.x, roadFarLeft.y);
    ctx.lineTo(roadFarRight.x, roadFarRight.y);
    ctx.lineTo(roadNearRight.x, roadNearRight.y);
    ctx.lineTo(roadNearLeft.x, roadNearLeft.y);
    ctx.closePath();
    ctx.fill();

    if (i % 2 === 0) {
      const dividerOffsets = routeLaneDividerOffsets({
        left: (farHalfWidths.left + nearHalfWidths.left) * 0.5,
        right: (farHalfWidths.right + nearHalfWidths.right) * 0.5,
      });
      for (const offset of dividerOffsets) {
        const dividerFar = projectWorldPoint(
          far.x + farFrame.right.x * offset,
          far.y + farFrame.right.y * offset,
          horizonY,
        );
        const dividerNear = projectWorldPoint(
          near.x + nearFrame.right.x * offset,
          near.y + nearFrame.right.y * offset,
          horizonY,
        );
        if (!dividerFar || !dividerNear) {
          continue;
        }
        ctx.strokeStyle = "#f2f4f7";
        ctx.lineWidth = Math.max(1, 6 / Math.max(near.forward, 1));
        ctx.beginPath();
        ctx.moveTo(dividerFar.x, dividerFar.y);
        ctx.lineTo(dividerNear.x, dividerNear.y);
        ctx.stroke();
      }
    }
  }
}

function drawCheckpointSigns(horizonY) {
  for (const checkpoint of state.sim.route.checkpoints) {
    if (
      checkpoint.type === "parking_parallel" ||
      checkpoint.type === "parking_diagonal" ||
      checkpoint.type === "traffic_light" ||
      checkpoint.type === "stop_line" ||
      checkpoint.type === "stop_line_free" ||
      checkpoint.type === "lane_add" ||
      checkpoint.type === "lane_profile_3"
    ) {
      continue;
    }

    const local = worldToLocal(checkpoint.x, checkpoint.y);
    if (local.forward <= 2 || local.forward > 120) {
      continue;
    }

    const screen = projectPerspective(local.right, local.forward, horizonY);
    if (!screen) {
      continue;
    }

    const size = Math.max(6, 190 / local.forward);

    ctx.strokeStyle = "rgba(228, 239, 246, 0.72)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(screen.x, screen.y + size * 1.45);
    ctx.lineTo(screen.x, screen.y + size * 2.6);
    ctx.stroke();

    ctx.fillStyle = colorForCheckpoint(checkpoint.type);
    ctx.beginPath();
    ctx.arc(screen.x, screen.y + size, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(4, 12, 18, 0.92)";
    ctx.font = `${Math.max(8, size * 0.9)}px Sora, Manrope, sans-serif`;

    const shortText = checkpoint.type
      .replace("parking_", "pk ")
      .replace("traffic_light", "tl")
      .replace("stop_line_free", "line")
      .replace("stop_line", "line")
      .replace("speed_zone", "spd")
      .replace("roundabout", "ovl")
      .replace("speed_bump", "bmp")
      .replace("lane_add", "lane+")
      .replace("start_canopy", "canopy")
      .replace("guard_tower", "gtw")
      .replace("tree", "tree");

    ctx.fillText(shortText, screen.x + size * 1.25, screen.y + size * 1.5);
  }
}

function drawMiniMap() {
  if (!state.sim.route || !state.sim.car || !state.sim.routeDensePath.length) {
    return;
  }

  const bounds = state.sim.routeBounds ?? computeRouteBounds(state.sim.routeDensePath);
  const mapW = 184;
  const mapH = 146;
  const mapX = dom.canvas.width - mapW - 20;
  const mapY = 76;
  const pad = 12;

  ctx.fillStyle = "rgba(5, 16, 24, 0.72)";
  ctx.fillRect(mapX, mapY, mapW, mapH);
  ctx.strokeStyle = "rgba(170, 215, 233, 0.44)";
  ctx.strokeRect(mapX, mapY, mapW, mapH);

  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.min((mapW - pad * 2) / width, (mapH - pad * 2) / height);
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  function mapPoint(point) {
    return {
      x: mapX + mapW / 2 + (point.x - centerX) * scale,
      y: mapY + mapH / 2 - (point.y - centerY) * scale,
    };
  }

  ctx.strokeStyle = "rgba(114, 97, 90, 0.88)";
  ctx.lineWidth = 7;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  let started = false;
  for (const point of state.sim.routeDensePath) {
    if (point.move) {
      started = false;
      continue;
    }
    const p = mapPoint(point);
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(218, 229, 237, 0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  started = false;
  for (const point of state.sim.routeDensePath) {
    if (point.move) {
      started = false;
      continue;
    }
    const p = mapPoint(point);
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();

  for (const checkpoint of state.sim.route.checkpoints) {
    if (checkpoint.type === "lane_profile_3") {
      continue;
    }
    const p = mapPoint(checkpoint);
    ctx.fillStyle = colorForCheckpoint(checkpoint.type);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const car = mapPoint(state.sim.car);
  const heading = toRadians(state.sim.car.headingDeg);
  const size = 8;
  ctx.fillStyle = "#ff7a21";
  ctx.beginPath();
  ctx.moveTo(car.x + Math.cos(-heading) * size, car.y + Math.sin(-heading) * size);
  ctx.lineTo(car.x + Math.cos(-heading + 2.4) * (size * 0.8), car.y + Math.sin(-heading + 2.4) * (size * 0.8));
  ctx.lineTo(car.x + Math.cos(-heading - 2.4) * (size * 0.8), car.y + Math.sin(-heading - 2.4) * (size * 0.8));
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#d9eff8";
  ctx.font = "600 11px Sora, Manrope, sans-serif";
  ctx.fillText("Route Map", mapX + 10, mapY + 16);
}

function drawSteeringWheel(x, y, radius, rotationRad) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotationRad);

  const ring = ctx.createLinearGradient(-radius, -radius, radius, radius);
  ring.addColorStop(0, "#1f2429");
  ring.addColorStop(1, "#050709");
  ctx.strokeStyle = ring;
  ctx.lineWidth = 17;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(94, 112, 126, 0.9)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -radius + 10);
  ctx.lineTo(-radius * 0.56, radius * 0.2);
  ctx.moveTo(0, -radius + 10);
  ctx.lineTo(radius * 0.56, radius * 0.2);
  ctx.moveTo(0, -radius + 10);
  ctx.lineTo(0, radius * 0.6);
  ctx.stroke();

  ctx.fillStyle = "#11181f";
  ctx.beginPath();
  ctx.roundRect(-radius * 0.45, radius * 0.18, radius * 0.9, radius * 0.7, radius * 0.12);
  ctx.fill();

  ctx.strokeStyle = "rgba(147, 164, 179, 0.48)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawCockpitOverlay() {
  const w = dom.canvas.width;
  const h = dom.canvas.height;

  const topShade = ctx.createLinearGradient(0, 0, 0, h * 0.12);
  topShade.addColorStop(0, "rgba(0, 0, 0, 0.9)");
  topShade.addColorStop(1, "rgba(0, 0, 0, 0.06)");
  ctx.fillStyle = topShade;
  ctx.fillRect(0, 0, w, h * 0.12);

  ctx.fillStyle = "rgba(7, 12, 18, 0.92)";
  ctx.fillRect(0, 0, w, h * 0.02);

  // Slim left A-pillar
  ctx.fillStyle = "rgba(8, 14, 20, 0.9)";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.82);
  ctx.lineTo(0, h * 0.09);
  ctx.lineTo(w * 0.03, h * 0.11);
  ctx.lineTo(w * 0.075, h * 0.72);
  ctx.lineTo(w * 0.065, h);
  ctx.closePath();
  ctx.fill();

  // Right A-pillar, visually stronger as in reference image
  ctx.beginPath();
  ctx.moveTo(w, h * 0.8);
  ctx.lineTo(w, h * 0.08);
  ctx.lineTo(w * 0.935, h * 0.18);
  ctx.lineTo(w * 0.77, h * 0.72);
  ctx.lineTo(w * 0.8, h);
  ctx.closePath();
  ctx.fill();

  // Dashboard volume
  const dashGrad = ctx.createLinearGradient(0, h * 0.64, 0, h);
  dashGrad.addColorStop(0, "rgba(74, 80, 84, 0.88)");
  dashGrad.addColorStop(1, "rgba(23, 27, 31, 0.99)");
  ctx.fillStyle = dashGrad;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, h * 0.82);
  ctx.quadraticCurveTo(w * 0.28, h * 0.74, w * 0.48, h * 0.76);
  ctx.quadraticCurveTo(w * 0.68, h * 0.78, w, h * 0.72);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();

  // Instrument cluster hood
  ctx.fillStyle = "rgba(18, 23, 29, 0.94)";
  ctx.beginPath();
  ctx.roundRect(w * 0.43, h * 0.685, w * 0.2, h * 0.125, 26);
  ctx.fill();

  // Instrument display
  ctx.fillStyle = "rgba(9, 12, 16, 0.94)";
  ctx.beginPath();
  ctx.roundRect(w * 0.455, h * 0.71, w * 0.15, h * 0.09, 18);
  ctx.fill();
  ctx.fillStyle = "rgba(174, 194, 206, 0.8)";
  ctx.font = "600 13px Sora, Manrope, sans-serif";
  ctx.fillText(`${Math.max(0, state.sim.car.speedKmh).toFixed(0)} km/h`, w * 0.498, h * 0.762);

  // Lower center console block
  ctx.fillStyle = "rgba(22, 28, 34, 0.92)";
  ctx.beginPath();
  ctx.roundRect(w * 0.42, h * 0.87, w * 0.16, h * 0.14, 16);
  ctx.fill();

  // Left-hand drive steering wheel (slightly left of center)
  const wheelX = w * 0.45;
  const wheelY = h * 0.9;
  const wheelRadius = 80;
  drawSteeringWheel(wheelX, wheelY, wheelRadius, toRadians(state.sim.steerVisualAngle));

  // Rear-view mirror
  ctx.fillStyle = "rgba(16, 21, 27, 0.88)";
  ctx.beginPath();
  ctx.roundRect(w * 0.43, h * 0.03, w * 0.14, h * 0.05, 8);
  ctx.fill();
}

function drawHeadsUpDisplay() {
  const w = dom.canvas.width;
  const isRed = isTrafficLightRed();
  const remaining = trafficLightSecondsRemaining();

  ctx.fillStyle = "rgba(8, 20, 30, 0.62)";
  ctx.fillRect(18, 20, 228, 72);

  ctx.fillStyle = "#e4f2f9";
  ctx.font = "600 13px Sora, Manrope, sans-serif";
  ctx.fillText(`Speed ${Math.max(0, state.sim.car.speedKmh).toFixed(1)} km/h`, 28, 42);
  ctx.fillText(`Signal ${state.sim.lastSignal || "off"}`, 28, 61);
  ctx.fillStyle = isRed ? "#ff969e" : "#7cf2bd";
  const lightLabel = state.sim.trafficLightManual === null ? `Light ${isRed ? "RED" : "GREEN"} (${remaining}s)` : `Light ${isRed ? "RED" : "GREEN"} (manual)`;
  ctx.fillText(lightLabel, 28, 80);

  ctx.fillStyle = "rgba(8, 20, 30, 0.56)";
  ctx.fillRect(w - 212, 20, 84, 44);
  ctx.fillStyle = "#f7fcff";
  ctx.fillText(`Cam`, w - 188, 48);

  drawMiniMap();
}

function drawFirstPersonScene() {
  const w = dom.canvas.width;
  const h = dom.canvas.height;
  const horizonY = h * 0.3;

  const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
  sky.addColorStop(0, "#295778");
  sky.addColorStop(1, "#6ea0be");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizonY);

  const ground = ctx.createLinearGradient(0, horizonY, 0, h);
  ground.addColorStop(0, "#5a7d62");
  ground.addColorStop(1, "#34503d");
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizonY, w, h - horizonY);

  ctx.fillStyle = "rgba(255, 194, 129, 0.2)";
  ctx.beginPath();
  ctx.arc(w * 0.82, 78, 44, 0, Math.PI * 2);
  ctx.fill();

  drawRoadPerspective(horizonY);
  drawSpeedBumpsPerspective(horizonY);
  drawStopLinesPerspective(horizonY);
  drawParkingZonesPerspective(horizonY);
  drawTrafficLightStructure(horizonY);
  drawCheckpointSigns(horizonY);
  drawCockpitOverlay();
  drawHeadsUpDisplay();
}

function externalCameraYawFor2D(mode, headingRad) {
  if (mode === "top") {
    return 0;
  }
  if (mode === "right") {
    return headingRad - Math.PI / 2;
  }
  if (mode === "front") {
    return headingRad + Math.PI;
  }
  if (mode === "left") {
    return headingRad + Math.PI / 2;
  }
  return 0;
}

function worldToThirdPersonCanvas(x, y) {
  const car = state.sim.car;
  const mode = externalCameraMode(state.sim.camera);
  const zoom = mode === "top" ? 8 : 6;
  if (mode === "third") {
    return {
      x: dom.canvas.width / 2 + (x - car.x) * zoom,
      y: dom.canvas.height * 0.72 - (y - car.y) * zoom,
    };
  }
  if (mode === "top") {
    return {
      x: dom.canvas.width / 2 + (x - car.x) * zoom,
      y: dom.canvas.height / 2 - (y - car.y) * zoom,
    };
  }

  const heading = toRadians(car.headingDeg || 0);
  const yaw = externalCameraYawFor2D(mode, heading);
  const dx = x - car.x;
  const dy = y - car.y;
  const right = dx * -Math.sin(yaw) + dy * Math.cos(yaw);
  const forward = dx * Math.cos(yaw) + dy * Math.sin(yaw);

  return {
    x: dom.canvas.width / 2 + right * zoom,
    y: dom.canvas.height * 0.72 - forward * zoom,
  };
}

function drawThirdPersonScene() {
  const w = dom.canvas.width;
  const h = dom.canvas.height;

  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#142734");
  bg.addColorStop(1, "#1f3e31");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#59453b";
  ctx.lineWidth = 34;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  let started = false;
  for (const point of state.sim.routePath) {
    if (point.move) {
      started = false;
      continue;
    }
    const p = worldToThirdPersonCanvas(point.x, point.y);
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();

  ctx.strokeStyle = "#29323d";
  ctx.lineWidth = 26;
  ctx.beginPath();
  started = false;
  for (const point of state.sim.routePath) {
    if (point.move) {
      started = false;
      continue;
    }
    const p = worldToThirdPersonCanvas(point.x, point.y);
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();

  ctx.setLineDash([12, 10]);
  ctx.strokeStyle = "rgba(242, 245, 247, 0.84)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  started = false;
  for (const point of state.sim.routePath) {
    if (point.move) {
      started = false;
      continue;
    }
    const p = worldToThirdPersonCanvas(point.x, point.y);
    if (!started) {
      ctx.moveTo(p.x, p.y);
      started = true;
    } else {
      ctx.lineTo(p.x, p.y);
    }
  }
  ctx.stroke();
  ctx.setLineDash([]);

  drawSpeedBumpsThirdPerson();
  drawStopLinesThirdPerson();
  drawParkingZonesThirdPerson();

  for (const checkpoint of state.sim.route.checkpoints) {
    if (
      checkpoint.type === "parking_parallel" ||
      checkpoint.type === "parking_diagonal" ||
      checkpoint.type === "stop_line" ||
      checkpoint.type === "stop_line_free" ||
      checkpoint.type === "lane_add" ||
      checkpoint.type === "lane_profile_3"
    ) {
      continue;
    }

    const p = worldToThirdPersonCanvas(checkpoint.x, checkpoint.y);
    ctx.fillStyle = colorForCheckpoint(checkpoint.type);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  const nowMs = Date.now();
  for (const peer of peersForActiveRoute(nowMs)) {
    const pose = peerRenderPose(peer);
    const presence = peerPresenceState(peer, nowMs);
    const peerPos = worldToThirdPersonCanvas(pose.x, pose.y);
    const peerHeading = toRadians(pose.headingDeg || 0);
    const mode = externalCameraMode(state.sim.camera);
    const viewYaw = externalCameraYawFor2D(mode, toRadians(state.sim.car.headingDeg || 0));
    const carLengthPeer = 14;
    const carWidthPeer = 9;

    ctx.save();
    ctx.translate(peerPos.x, peerPos.y);
    ctx.rotate(-(peerHeading - viewYaw));
    ctx.fillStyle = presence === "afk" ? "#4a4630" : "#0b3d57";
    ctx.fillRect(-carLengthPeer / 2, -carWidthPeer / 2, carLengthPeer, carWidthPeer);
    ctx.fillStyle = presence === "afk" ? "#ffd89b" : "#8fe8ff";
    ctx.fillRect(carLengthPeer / 4, -carWidthPeer / 2, carLengthPeer / 4, carWidthPeer);
    ctx.restore();

    if (presence === "afk") {
      ctx.save();
      const label = "AFK";
      ctx.font = "700 11px Sora, sans-serif";
      const labelWidth = Math.ceil(ctx.measureText(label).width) + 10;
      const labelHeight = 15;
      const lx = Math.round(peerPos.x - labelWidth / 2);
      const ly = Math.round(peerPos.y - carWidthPeer - 18);
      ctx.fillStyle = "rgba(10, 18, 28, 0.86)";
      ctx.fillRect(lx, ly, labelWidth, labelHeight);
      ctx.strokeStyle = "rgba(255, 209, 102, 0.92)";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(lx + 0.5, ly + 0.5, labelWidth - 1, labelHeight - 1);
      ctx.fillStyle = "#ffd166";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, lx + labelWidth / 2, ly + labelHeight / 2 + 0.3);
      ctx.restore();
    }
  }

  const car = state.sim.car;
  const carPos = worldToThirdPersonCanvas(car.x, car.y);
  const heading = toRadians(car.headingDeg);
  const mode = externalCameraMode(state.sim.camera);
  const viewYaw = externalCameraYawFor2D(mode, heading);
  const carLength = 16;
  const carWidth = 10;

  ctx.save();
  ctx.translate(carPos.x, carPos.y);
  ctx.rotate(-(heading - viewYaw));
  ctx.fillStyle = "#0a1520";
  ctx.fillRect(-carLength / 2, -carWidth / 2, carLength, carWidth);
  ctx.fillStyle = "#ff7a21";
  ctx.fillRect(carLength / 4, -carWidth / 2, carLength / 4, carWidth);
  ctx.restore();

  drawHeadsUpDisplay();
}

function drawSimulation() {
  ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);

  if (!state.sim.route || !state.sim.car) {
    drawNoSessionScene();
    return;
  }

  if (state.sim.camera === "first") {
    drawFirstPersonScene();
  } else {
    drawThirdPersonScene();
  }
}

function setSignal(signal, options = {}) {
  const toggle = Boolean(options?.toggle);
  if (toggle && state.sim.lastSignal === signal) {
    state.sim.lastSignal = null;
  } else {
    state.sim.lastSignal = signal;
  }
  updateHudOverlay();
}

function simInputIdleTimeoutMs() {
  const value = Number(state.sim.inputIdleTimeoutMs);
  if (Number.isFinite(value) && value > 0) {
    return Math.max(60 * 1000, value);
  }
  return SIM_INPUT_IDLE_TIMEOUT_DEFAULT_MS;
}

function simKeepAliveIntervalMs() {
  const value = Number(state.sim.keepAliveIntervalMs);
  if (Number.isFinite(value) && value > 0) {
    return Math.max(5000, value);
  }
  return SIM_KEEPALIVE_INTERVAL_DEFAULT_MS;
}

function simInputIdleTimeoutLabel() {
  const minutes = Math.max(1, Math.round(simInputIdleTimeoutMs() / 60000));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function inactivityDisconnectNoticeText() {
  return "You were disconnected for inactivity (refresh the page to start a new practice).";
}

function inactivityReconnectHintText() {
  return "You were disconnected for inactivity. Press Start Session to begin a new practice.";
}

function notifyInactivityDisconnectIfNeeded() {
  if (state.sim.inactivityAlertShown) {
    return;
  }
  if (document.hidden) {
    state.sim.inactivityAlertPending = true;
    return;
  }
  state.sim.inactivityAlertShown = true;
  state.sim.inactivityAlertPending = false;
  alert(inactivityReconnectHintText());
}

function flushPendingInactivityDisconnectAlert() {
  if (!state.sim.inactivityAlertPending || state.sim.inactivityAlertShown) {
    return;
  }
  state.sim.inactivityAlertShown = true;
  state.sim.inactivityAlertPending = false;
  alert(inactivityReconnectHintText());
}

function canUseSupabaseKeepAliveDirect() {
  return Boolean(
    state.sim.sessionId && state.sim.sessionHeartbeatToken && state.multiplayer.url && state.multiplayer.anonKey,
  );
}

function parseSupabaseKeepAliveAck(payload) {
  if (payload === true) {
    return true;
  }
  if (payload === false || payload == null) {
    return false;
  }
  if (Array.isArray(payload)) {
    if (!payload.length) {
      return false;
    }
    if (payload.length === 1) {
      return parseSupabaseKeepAliveAck(payload[0]);
    }
  }
  if (typeof payload === "object") {
    for (const [key, value] of Object.entries(payload)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes("sim_session_keepalive") || lowerKey.includes("keepalive")) {
        if (value === true) {
          return true;
        }
        if (value === false) {
          return false;
        }
      }
    }
  }
  return true;
}

function markSimInput(nowMs = Date.now()) {
  if (!state.sim.sessionId) {
    return;
  }
  state.sim.lastInputAt = nowMs;
}

async function abandonSimulation(reasonText = "Session ended due to inactivity.", options = {}) {
  const inactivityDisconnect = Boolean(options?.inactivityDisconnect);
  if (!state.sim.sessionId) {
    state.sim.idleAbandoning = false;
    return;
  }

  const sessionId = state.sim.sessionId;
  stopSimKeepAliveLoop();
  try {
    await api(`/v1/sim/sessions/${sessionId}/abandon`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ reason: "input_idle_timeout" }),
    });
  } catch (error) {
    if (!String(error?.message || "").toLowerCase().includes("sim session not found")) {
      dom.simOutput.textContent = `Abandon warning: ${error.message}`;
    }
  }

  state.sim.sessionId = null;
  state.sim.sessionHeartbeatToken = null;
  state.sim.lastKeepAliveAt = 0;
  state.sim.lastInputAt = 0;
  state.sim.idleAbandoning = false;
  state.sim.trafficLightManual = null;
  state.keys.clear();
  state.sim.stopLineContacts = {};
  if (inactivityDisconnect) {
    const notice = inactivityReconnectHintText();
    dom.simState.textContent = notice;
    dom.simOutput.textContent = notice;
    showPenaltyCard("Disconnected for inactivity.", 5600);
    notifyInactivityDisconnectIfNeeded();
  } else {
    dom.simState.textContent = reasonText;
  }
  dom.toggleLightBtn.textContent = "Manual Light Override";
  if (!inactivityDisconnect) {
    hidePenaltyCard();
  }
  updateHudOverlay();
}

function sendSimEvent(triggerKey, meta = {}, options = {}) {
  if (!state.sim.sessionId) {
    return false;
  }

  const dedupe = options.dedupe !== false;
  if (dedupe) {
    const dedupeKey = `${triggerKey}:${meta.checkpoint || ""}`;
    if (state.sim.triggered.has(dedupeKey)) {
      return false;
    }
    state.sim.triggered.add(dedupeKey);
  }

  api(`/v1/sim/sessions/${state.sim.sessionId}/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      events: [
        {
          triggerKey,
          atMs: Date.now() - state.sim.startedAt,
          meta,
        },
      ],
    }),
  }).catch((error) => {
    dom.simOutput.textContent = `Event error: ${error.message}`;
  });
  return true;
}

function stopSimKeepAliveLoop() {
  if (state.sim.keepAliveTimer) {
    clearInterval(state.sim.keepAliveTimer);
    state.sim.keepAliveTimer = null;
  }
}

function sendSimKeepAliveViaApi() {
  api(`/v1/sim/sessions/${state.sim.sessionId}/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ events: [] }),
  }).catch((error) => {
    dom.simOutput.textContent = `Keepalive warning: ${error.message}`;
  });
}

function sendSimKeepAliveViaSupabase() {
  const url = `${String(state.multiplayer.url || "").replace(/\/+$/, "")}/rest/v1/rpc/sim_session_keepalive`;
  const anonKey = String(state.multiplayer.anonKey || "");
  const sessionId = String(state.sim.sessionId || "");
  const heartbeatToken = String(state.sim.sessionHeartbeatToken || "");

  fetch(url, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_session_id: sessionId,
      p_heartbeat_token: heartbeatToken,
    }),
  })
    .then(async (response) => {
      const text = await response.text();
      let payload = null;
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = null;
        }
      }
      if (!response.ok || !parseSupabaseKeepAliveAck(payload)) {
        throw new Error("supabase keepalive rejected");
      }
    })
    .catch(() => {
      // Fallback to API path if direct Supabase RPC is unavailable.
      sendSimKeepAliveViaApi();
    });
}

function sendSimKeepAlive(nowMs = Date.now()) {
  if (!state.sim.sessionId || !state.token) {
    return;
  }
  if (state.sim.lastInputAt && nowMs - state.sim.lastInputAt >= simInputIdleTimeoutMs()) {
    if (!state.sim.idleAbandoning) {
      state.sim.idleAbandoning = true;
      abandonSimulation(`Session ended after ${simInputIdleTimeoutLabel()} without simulator input.`, {
        inactivityDisconnect: true,
      }).catch((error) => {
        dom.simOutput.textContent = `Idle timeout warning: ${error.message}`;
      });
    }
    return;
  }
  if (nowMs - Number(state.sim.lastKeepAliveAt || 0) < simKeepAliveIntervalMs()) {
    return;
  }
  state.sim.lastKeepAliveAt = nowMs;
  if (canUseSupabaseKeepAliveDirect()) {
    sendSimKeepAliveViaSupabase();
    return;
  }
  sendSimKeepAliveViaApi();
}

function startSimKeepAliveLoop() {
  stopSimKeepAliveLoop();
  state.sim.lastKeepAliveAt = 0;
  state.sim.keepAliveTimer = setInterval(() => {
    sendSimKeepAlive(Date.now());
  }, simKeepAliveIntervalMs());
}

function routeCheckpoint(type) {
  return routeCheckpoints(type)[0] ?? null;
}

function routeCheckpoints(type) {
  if (!state.sim.route?.checkpoints?.length) {
    return [];
  }
  return state.sim.route.checkpoints.filter((checkpoint) => checkpoint.type === type);
}

function routeStopLines() {
  if (!state.sim.route?.checkpoints?.length) {
    return [];
  }
  return state.sim.route.checkpoints.filter(
    (checkpoint) => checkpoint.type === "stop_line" || checkpoint.type === "stop_line_free",
  );
}

function distanceTo(checkpoint) {
  const dx = state.sim.car.x - checkpoint.x;
  const dy = state.sim.car.y - checkpoint.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function stopLineExpectedApproachHeading(stopLine) {
  if (!stopLine) {
    return 0;
  }
  const laneCount = Math.max(1, Math.round(Number(stopLine.meta?.laneCount) || 2));
  const lane = Math.max(1, Math.min(laneCount, Math.round(Number(stopLine.meta?.lane) || 1)));
  const heading = checkpointHeadingAt(stopLine);
  const withPath = lane - 0.5 >= laneCount / 2;
  return withPath ? heading : heading + Math.PI;
}

function trafficLightControlledApproachHeading(trafficLight) {
  const placement = trafficLightPlacement(trafficLight);
  return placement.signalHeading + Math.PI;
}

function resolvedControlledApproachHeading(stopLine, trafficLight) {
  // Keep semaforo-facing authoritative for control direction.
  // Lane-side hints can be wrong in diagonals/intersections and invert penalties.
  return trafficLightControlledApproachHeading(trafficLight);
}

function stopLineTrafficLightMatchScore(stopLine, trafficLight) {
  const dist = Math.hypot(stopLine.x - trafficLight.x, stopLine.y - trafficLight.y);
  const controlledApproach = trafficLightControlledApproachHeading(trafficLight);
  const stopHeading = checkpointHeadingAt(stopLine);
  // Stop-line can be crossed in either heading direction depending on lane side;
  // use the closest longitudinal direction to avoid diagonal lane-side inversion.
  const deltaForward = normalizeHeadingDeltaRad(stopHeading, controlledApproach);
  const deltaReverse = normalizeHeadingDeltaRad(stopHeading + Math.PI, controlledApproach);
  const delta = Math.min(deltaForward, deltaReverse);
  const headingPenaltyM = delta * 8;
  let score = dist * dist + headingPenaltyM * headingPenaltyM;

  // Prefer same snapped segment when available, so duplicated ids still pair correctly.
  const slSeg = Number(stopLine?.meta?.snapSegmentIndex);
  const tlSeg = Number(trafficLight?.meta?.snapSegmentIndex);
  if (Number.isFinite(slSeg) && Number.isFinite(tlSeg)) {
    const segDiff = Math.abs(Math.round(slSeg) - Math.round(tlSeg));
    if (segDiff === 0) {
      score *= 0.35;
    } else if (segDiff === 1) {
      score *= 0.75;
    } else {
      score += segDiff * segDiff * 4;
    }
  }

  return { score, dist, delta, controlledApproach };
}

function trafficLightForStopLine(stopLine) {
  const trafficLights = routeCheckpoints("traffic_light");
  if (!trafficLights.length) {
    return null;
  }

  const linkedId = stopLine?.meta?.trafficLightId;
  if (linkedId) {
    const linkedMatches = trafficLights.filter((tl) => tl.id === linkedId);
    if (linkedMatches.length === 1) {
      return linkedMatches[0];
    }
    if (linkedMatches.length > 1) {
      let linkedBest = null;
      for (const trafficLight of linkedMatches) {
        const match = stopLineTrafficLightMatchScore(stopLine, trafficLight);
        if (!linkedBest || match.score < linkedBest.score) {
          linkedBest = { trafficLight, score: match.score };
        }
      }
      if (linkedBest?.trafficLight) {
        return linkedBest.trafficLight;
      }
    }
  }

  let best = null;
  for (const trafficLight of trafficLights) {
    const match = stopLineTrafficLightMatchScore(stopLine, trafficLight);
    if (!best || match.score < best.score) {
      best = { trafficLight, score: match.score };
    }
  }
  return best?.trafficLight || null;
}

function detectRedLightStopLineViolation(prevFrontAxle, currFrontAxle, carHeadingRad) {
  if (!isTrafficLightRed()) {
    return;
  }

  const stopLines = routeCheckpoints("stop_line");
  if (!stopLines.length) {
    return;
  }

  // Use actual front-axle motion direction to decide which signal orientation applies.
  // This avoids false penalties when car visual heading and route draw heading diverge.
  const motionDx = currFrontAxle.x - prevFrontAxle.x;
  const motionDy = currFrontAxle.y - prevFrontAxle.y;
  const motionLenSq = motionDx * motionDx + motionDy * motionDy;
  const movementHeading = motionLenSq > 1e-6 ? Math.atan2(motionDy, motionDx) : carHeadingRad;

  for (const stopLine of stopLines) {
    const segment = stopLineSegment(stopLine);
    const dir = { x: Math.cos(segment.heading), y: Math.sin(segment.heading) };
    const right = { x: Math.sin(segment.heading), y: -Math.cos(segment.heading) };

    const prevDx = prevFrontAxle.x - segment.center.x;
    const prevDy = prevFrontAxle.y - segment.center.y;
    const currDx = currFrontAxle.x - segment.center.x;
    const currDy = currFrontAxle.y - segment.center.y;

    const prevLong = prevDx * dir.x + prevDy * dir.y;
    const prevLat = prevDx * right.x + prevDy * right.y;
    const currLong = currDx * dir.x + currDy * dir.y;
    const currLat = currDx * right.x + currDy * right.y;

    const lineBand = segment.lineWidth * 0.5 + 0.07;
    const laneBand = segment.laneWidth * 0.5 + 0.12;
    const insideNow = Math.abs(currLong) <= lineBand && Math.abs(currLat) <= laneBand;
    // Include geometric location so duplicate ids do not share contact state.
    const key = `${stopLine.id || "sl"}_${segment.center.x.toFixed(2)}_${segment.center.y.toFixed(2)}`;
    const wasInside = state.sim.stopLineContacts[key] === true;
    state.sim.stopLineContacts[key] = insideNow;

    const crossed =
      !wasInside &&
      Math.sign(prevLong) !== 0 &&
      Math.sign(currLong) !== 0 &&
      Math.sign(prevLong) !== Math.sign(currLong) &&
      (Math.abs(prevLat) <= laneBand || Math.abs(currLat) <= laneBand);
    const stepped = insideNow && !wasInside;
    if (!crossed && !stepped) {
      continue;
    }

    const trafficLight = trafficLightForStopLine(stopLine);
    if (!trafficLight) {
      continue;
    }
    const controlledApproachHeading = resolvedControlledApproachHeading(stopLine, trafficLight);
    const headingDelta = normalizeHeadingDeltaRad(movementHeading, controlledApproachHeading);
    if (headingDelta > toRadians(85)) {
      continue;
    }

    const sent = sendSimEvent(
      "red_light_crossed",
      {
        checkpoint: trafficLight.id,
        stopLine: stopLine.id,
        mode: crossed ? "crossed" : "stepped",
      },
      { dedupe: false },
    );
    if (sent) {
      applyPenalty(25, "cruzar la luz roja");
      dom.simState.textContent = `Infraccion: luz roja. Penalidad aplicada (-25). Total: -${Math.round(state.sim.penaltyPoints)}.`;
    }
    break;
  }
}

function rearAxleOffsetMeters() {
  const footprint = state.sim.three.vehicleFootprintLocal;
  if (state.sim.three.vehicleModelRoot && footprint) {
    // For loaded models we align the marker near the rear axle, so only tiny correction remains.
    return 0.02;
  }

  return 0.95;
}

function runRuleDetectors(prevFrontAxle = null, currFrontAxle = null, carHeadingRad = null) {
  if (!state.sim.sessionId || !state.sim.route || !state.sim.car) {
    return;
  }

  const speedZones = routeCheckpoints("speed_zone");
  let activeSpeedZone = null;
  for (const zone of speedZones) {
    if (distanceTo(zone) < 10) {
      activeSpeedZone = zone;
      break;
    }
  }

  if (activeSpeedZone) {
    const limit = Number(activeSpeedZone.meta.limitKmh);
    if (state.sim.car.speedKmh > limit + 5) {
      if (state.sim.speedOverSince == null) {
        state.sim.speedOverSince = Date.now();
      } else if (Date.now() - state.sim.speedOverSince > 2000) {
        sendSimEvent("speed_over_limit", { checkpoint: activeSpeedZone.id, speed: state.sim.car.speedKmh });
      }
    } else {
      state.sim.speedOverSince = null;
    }
  } else {
    state.sim.speedOverSince = null;
  }

  const stopLines = routeCheckpoints("stop_line");
  if (stopLines.length > 0 && prevFrontAxle && currFrontAxle) {
    const heading = Number.isFinite(carHeadingRad) ? carHeadingRad : toRadians(state.sim.car.headingDeg || 0);
    detectRedLightStopLineViolation(prevFrontAxle, currFrontAxle, heading);
  } else {
    // Fallback for legacy routes without explicit stop-line checkpoints.
    const trafficLights = routeCheckpoints("traffic_light");
    if (isTrafficLightRed()) {
      const carHeading = toRadians(state.sim.car.headingDeg || 0);
      for (const trafficLight of trafficLights) {
        const placement = trafficLightPlacement(trafficLight);
        const controlledApproachHeading = placement.signalHeading + Math.PI;
        const headingDelta = normalizeHeadingDeltaRad(carHeading, controlledApproachHeading);
        if (headingDelta > toRadians(85)) {
          continue;
        }
        if (distanceTo(trafficLight) < 4.6 && state.sim.car.speedKmh > 8) {
          sendSimEvent("red_light_crossed", { checkpoint: trafficLight.id });
        }
      }
    }
  }

  const roundabout = routeCheckpoint("roundabout");
  if (roundabout) {
    const inside = distanceTo(roundabout) < 12;
    if (inside) {
      state.sim.insideRoundabout = true;
    } else if (state.sim.insideRoundabout) {
      if (!state.sim.lastSignal) {
        sendSimEvent("missing_turn_signal", { checkpoint: roundabout.id });
      }
      state.sim.insideRoundabout = false;
    }
  }

  const speedSign = Math.sign(state.sim.car.speedKmh);
  if (speedSign !== 0 && state.sim.lastSpeedSign !== 0 && speedSign !== state.sim.lastSpeedSign) {
    state.sim.correctionCount += 1;
  }
  if (speedSign !== 0) {
    state.sim.lastSpeedSign = speedSign;
  }
}

function validateParallelParking() {
  if (!state.sim.route || !state.sim.car) {
    return;
  }

  const checkpoint = routeCheckpoint("parking_parallel");
  if (!checkpoint) {
    return;
  }

  const occupied = findOccupiedParkingSlot(checkpoint);
  const slots = parkingSlotShapes(checkpoint);
  let nearestCenterDist = Number.POSITIVE_INFINITY;
  for (const shape of slots) {
    nearestCenterDist = Math.min(nearestCenterDist, Math.hypot(state.sim.car.x - shape.center.x, state.sim.car.y - shape.center.y));
  }

  if (state.sim.route.routeId === "A") {
    if (!occupied) {
      sendSimEvent("parallel_parking_outside_box", { checkpoint: checkpoint.id, distance: nearestCenterDist });
      dom.simState.textContent = "Parallel parking: not inside a valid slot yet.";
    } else {
      dom.simState.textContent = `Parallel parking OK: slot ${occupied.index + 1}/${occupied.slotCount}.`;
    }
  } else if (state.sim.route.routeId === "B") {
    if (!occupied) {
      sendSimEvent("parallel_parking_outside_box", { checkpoint: checkpoint.id, distance: nearestCenterDist });
      dom.simState.textContent = "Parallel parking: not inside a valid slot yet.";
      return;
    }
    if (state.sim.correctionCount > Number(checkpoint.meta.maxCorrections)) {
      sendSimEvent("parallel_parking_too_many_corrections", {
        checkpoint: checkpoint.id,
        corrections: state.sim.correctionCount,
      });
    } else {
      dom.simState.textContent = `Parallel parking OK: slot ${occupied.index + 1}/${occupied.slotCount}.`;
    }
  }
}

function normalizeHeading(deg) {
  let value = deg % 360;
  if (value < 0) {
    value += 360;
  }
  return value;
}

function validateDiagonalParking() {
  if (!state.sim.route || !state.sim.car) {
    return;
  }

  const checkpoint = routeCheckpoint("parking_diagonal");
  if (!checkpoint) {
    return;
  }

  const occupied = findOccupiedParkingSlot(checkpoint);
  const slotShapes = parkingSlotShapes(checkpoint);
  let nearestDelta = 180;
  for (const shape of slotShapes) {
    const slotHeading = (shape.orientation * 180) / Math.PI;
    nearestDelta = Math.min(nearestDelta, normalizeHeadingDeltaDeg(state.sim.car.headingDeg, slotHeading));
  }

  if (state.sim.route.routeId === "A") {
    if (!occupied) {
      sendSimEvent("diagonal_parking_bad_angle", { checkpoint: checkpoint.id, delta: nearestDelta });
      dom.simState.textContent = "Diagonal parking: adjust position/angle inside a diagonal slot.";
    } else {
      dom.simState.textContent = `Diagonal parking OK: slot ${occupied.index + 1}/${occupied.slotCount}.`;
    }
  } else if (state.sim.route.routeId === "B") {
    const elapsedSec = (Date.now() - state.sim.startedAt) / 1000;
    if (elapsedSec > 45) {
      sendSimEvent("diagonal_parking_time_exceeded", { checkpoint: checkpoint.id, elapsedSec });
    } else if (occupied) {
      dom.simState.textContent = `Diagonal parking OK: slot ${occupied.index + 1}/${occupied.slotCount}.`;
    }
  }
}

function resetCarPosition() {
  if (!state.sim.route?.startPose || !state.sim.car) {
    return;
  }

  state.sim.car.x = state.sim.route.startPose.x;
  state.sim.car.y = state.sim.route.startPose.y;
  state.sim.car.headingDeg = state.sim.route.startPose.headingDeg;
  state.sim.car.speedKmh = 0;
  state.sim.bumpOffset = 0;
  state.sim.bumpVelocity = 0;
  state.sim.bumpSupport = 0;
  state.sim.bumpPitch = 0;
  state.sim.bumpRoll = 0;
  state.sim.lastBumpAtMs = 0;
  state.sim.bumpAxleContacts = {};
  state.sim.bumpAxleHitAtMs = {};
  state.sim.stopLineContacts = {};
  hidePenaltyCard();
}

let lastFrame = performance.now();
function frame(now) {
  const dt = Math.max(0.001, Math.min(0.05, (now - lastFrame) / 1000));
  lastFrame = now;
  maybeSyncCanvas(now);
  state.sim.trafficLightRed = isTrafficLightRed();
  const nowMs = Date.now();
  if (
    state.sim.sessionId &&
    state.sim.lastInputAt &&
    nowMs - state.sim.lastInputAt >= simInputIdleTimeoutMs() &&
    !state.sim.idleAbandoning
  ) {
    state.sim.idleAbandoning = true;
    abandonSimulation(`Session ended after ${simInputIdleTimeoutLabel()} without simulator input.`, {
      inactivityDisconnect: true,
    }).catch((error) => {
      dom.simOutput.textContent = `Idle timeout warning: ${error.message}`;
    });
  }

  if (state.sim.car && state.sim.sessionId) {
    const wheelbaseMeters = 2.35;
    const maxSteerDeg = 38;
    const accelForward = 5.2;
    const accelReverse = 3.0;
    const serviceBrake = 7.6;
    const handBrake = 12.5;
    const rollingResistance = 0.65;
    const aeroDrag = 0.035;
    const maxForwardMs = 58 / 3.6;
    const maxReverseMs = 15 / 3.6;
    const prevCarX = state.sim.car.x;
    const prevCarY = state.sim.car.y;
    const prevHeadingRad = toRadians(state.sim.car.headingDeg || 0);

    const wantsLeft = state.keys.has("a");
    const wantsRight = state.keys.has("d");
    const wantsThrottle = state.keys.has("w");
    const wantsBrake = state.keys.has("s");
    const wantsHandBrake = state.keys.has(" ");

    let speedMs = state.sim.car.speedKmh / 3.6;
    if (wantsThrottle) {
      if (speedMs >= -0.15) {
        speedMs += accelForward * dt;
      } else {
        speedMs += serviceBrake * dt;
      }
    }
    if (wantsBrake) {
      if (speedMs > 0.15) {
        speedMs -= serviceBrake * dt;
      } else {
        speedMs -= accelReverse * dt;
      }
    }
    if (wantsHandBrake) {
      const handBrakeDelta = handBrake * dt;
      if (Math.abs(speedMs) <= handBrakeDelta) {
        speedMs = 0;
      } else {
        speedMs -= Math.sign(speedMs) * handBrakeDelta;
      }
    }
    if (!wantsThrottle && !wantsBrake && !wantsHandBrake) {
      const resistDelta = (rollingResistance + aeroDrag * speedMs * speedMs) * dt;
      if (Math.abs(speedMs) <= resistDelta) {
        speedMs = 0;
      } else {
        speedMs -= Math.sign(speedMs) * resistDelta;
      }
    }

    speedMs = Math.max(-maxReverseMs, Math.min(maxForwardMs, speedMs));
    const speedAbsKmh = Math.abs(speedMs * 3.6);
    const steerInput = wantsLeft ? -1 : wantsRight ? 1 : 0;
    const steerMaxHighSpeedDeg = 11;
    const steerMaxLowSpeedDeg = maxSteerDeg;
    const speedNorm = Math.min(1, speedAbsKmh / 70);
    const steerLimitDeg = steerMaxLowSpeedDeg - (steerMaxLowSpeedDeg - steerMaxHighSpeedDeg) * speedNorm;
    const steerTarget = steerInput * steerLimitDeg;
    const steerRateDegPerSec = steerInput === 0 ? (speedAbsKmh > 10 ? 140 : 90) : speedAbsKmh > 45 ? 75 : 120;
    const steerStep = steerRateDegPerSec * dt;
    const steerError = steerTarget - state.sim.steerVisualAngle;
    if (Math.abs(steerError) <= steerStep) {
      state.sim.steerVisualAngle = steerTarget;
    } else {
      state.sim.steerVisualAngle += Math.sign(steerError) * steerStep;
    }

    const tireSteerRatio = 0.60;
    const tireSteerDeg = state.sim.steerVisualAngle * tireSteerRatio;
    // Visual steering and kinematic heading use opposite sign conventions in current world axes.
    // Negate here so right input turns the car right on both world path and minimap.
    const steerRad = -toRadians(tireSteerDeg);
    const tanSteer = Math.tan(steerRad);
    let heading = toRadians(state.sim.car.headingDeg);
    if (Math.abs(speedMs) > 0.05 && Math.abs(tanSteer) > 0.0004) {
      const lowSpeedYawGain = Math.min(1.35, 1.2 + speedAbsKmh / 50);
      heading += (speedMs / wheelbaseMeters) * tanSteer * dt * lowSpeedYawGain;
    }
    state.sim.car.headingDeg = (heading * 180) / Math.PI;

    state.sim.car.speedKmh = speedMs * 3.6;

    const wheelRadiusMeters = 0.33;
    state.sim.wheelRollRad += (speedMs * dt) / wheelRadiusMeters;

    const worldMetersScale = 0.9;
    const moveWorld = speedMs * dt * worldMetersScale;
    const rearOffset = rearAxleOffsetMeters();
    let rearAxleX = state.sim.car.x - Math.cos(heading) * rearOffset;
    let rearAxleY = state.sim.car.y - Math.sin(heading) * rearOffset;
    rearAxleX += Math.cos(heading) * moveWorld;
    rearAxleY += Math.sin(heading) * moveWorld;
    state.sim.car.x = rearAxleX + Math.cos(heading) * rearOffset;
    state.sim.car.y = rearAxleY + Math.sin(heading) * rearOffset;

    const routeBounds = state.sim.routeBounds ?? computeRouteBounds(state.sim.routeDensePath);
    state.sim.car.x = Math.max(
      routeBounds.minX - ROUTE_BOUNDS_MARGIN_METERS,
      Math.min(routeBounds.maxX + ROUTE_BOUNDS_MARGIN_METERS, state.sim.car.x),
    );
    state.sim.car.y = Math.max(
      routeBounds.minY - ROUTE_BOUNDS_MARGIN_METERS,
      Math.min(routeBounds.maxY + ROUTE_BOUNDS_MARGIN_METERS, state.sim.car.y),
    );
    resolvePeerSolidCollisions(prevCarX, prevCarY);
    state.sim.car.x = Math.max(
      routeBounds.minX - ROUTE_BOUNDS_MARGIN_METERS,
      Math.min(routeBounds.maxX + ROUTE_BOUNDS_MARGIN_METERS, state.sim.car.x),
    );
    state.sim.car.y = Math.max(
      routeBounds.minY - ROUTE_BOUNDS_MARGIN_METERS,
      Math.min(routeBounds.maxY + ROUTE_BOUNDS_MARGIN_METERS, state.sim.car.y),
    );

    const nowMs = Date.now();
    let bumpSupportTarget = 0;
    let bumpPitchTarget = 0;
    let bumpRollTarget = 0;
    const currHeadingRad = toRadians(state.sim.car.headingDeg || 0);
    const currRightVec = {
      x: Math.sin(currHeadingRad),
      y: -Math.cos(currHeadingRad),
    };
    const prevRearAxle = {
      x: prevCarX - Math.cos(prevHeadingRad) * rearOffset,
      y: prevCarY - Math.sin(prevHeadingRad) * rearOffset,
    };
    const prevFrontAxle = {
      x: prevRearAxle.x + Math.cos(prevHeadingRad) * wheelbaseMeters,
      y: prevRearAxle.y + Math.sin(prevHeadingRad) * wheelbaseMeters,
    };
    const currRearAxle = {
      x: state.sim.car.x - Math.cos(currHeadingRad) * rearOffset,
      y: state.sim.car.y - Math.sin(currHeadingRad) * rearOffset,
    };
    const currFrontAxle = {
      x: currRearAxle.x + Math.cos(currHeadingRad) * wheelbaseMeters,
      y: currRearAxle.y + Math.sin(currHeadingRad) * wheelbaseMeters,
    };
    const trackWidthMeters = 1.58;
    const trackHalf = trackWidthMeters * 0.5;
    const currWheels = {
      fl: {
        x: currFrontAxle.x - currRightVec.x * trackHalf,
        y: currFrontAxle.y - currRightVec.y * trackHalf,
      },
      fr: {
        x: currFrontAxle.x + currRightVec.x * trackHalf,
        y: currFrontAxle.y + currRightVec.y * trackHalf,
      },
      rl: {
        x: currRearAxle.x - currRightVec.x * trackHalf,
        y: currRearAxle.y - currRightVec.y * trackHalf,
      },
      rr: {
        x: currRearAxle.x + currRightVec.x * trackHalf,
        y: currRearAxle.y + currRightVec.y * trackHalf,
      },
    };
    const wheelSupport = { fl: 0, fr: 0, rl: 0, rr: 0 };

    const bumps = routeCheckpoints("speed_bump");
    for (const bump of bumps) {
      const segment = speedBumpSegment(bump);
      const dir = { x: Math.cos(segment.heading), y: Math.sin(segment.heading) };
      const right = { x: Math.sin(segment.heading), y: -Math.cos(segment.heading) };
      const triggerLongitudinal = segment.halfLongitudinal + 0.06;
      const triggerLateral = segment.halfLateral + 0.06;
      const bumpKey = bump.id || `bump_${segment.center.x.toFixed(2)}_${segment.center.y.toFixed(2)}`;

      const maybeApplyAxleBump = (axleName, prevPoint, currPoint, axleFactor) => {
        const key = `${bumpKey}:${axleName}`;
        const prevDx = prevPoint.x - segment.center.x;
        const prevDy = prevPoint.y - segment.center.y;
        const currDx = currPoint.x - segment.center.x;
        const currDy = currPoint.y - segment.center.y;
        const prevLong = prevDx * dir.x + prevDy * dir.y;
        const prevLat = prevDx * right.x + prevDy * right.y;
        const currLong = currDx * dir.x + currDy * dir.y;
        const currLat = currDx * right.x + currDy * right.y;

        const insideNow =
          Math.abs(currLong) <= triggerLongitudinal &&
          Math.abs(currLat) <= triggerLateral;

        const longMin = Math.min(prevLong, currLong);
        const longMax = Math.max(prevLong, currLong);
        const minAbsLat = Math.min(Math.abs(prevLat), Math.abs(currLat));
        const sweptAcross =
          minAbsLat <= triggerLateral &&
          longMin <= triggerLongitudinal &&
          longMax >= -triggerLongitudinal;

        const wasInside = state.sim.bumpAxleContacts[key] === true;
        state.sim.bumpAxleContacts[key] = insideNow;

        if (!speedAbsKmh || speedAbsKmh < 3) {
          return;
        }
        if (wasInside || (!insideNow && !sweptAcross)) {
          return;
        }

        const lastHitMs = Number(state.sim.bumpAxleHitAtMs[key] || 0);
        if (nowMs - lastHitMs < 130) {
          return;
        }

        state.sim.bumpAxleHitAtMs[key] = nowMs;
        state.sim.lastBumpAtMs = nowMs;
        const impulseBase = Math.min(2.6, 0.55 + speedAbsKmh * 0.023 + segment.bumpHeight * 2.4);
        state.sim.bumpOffset += Math.min(0.08, segment.bumpHeight * 0.42) * axleFactor;
        state.sim.bumpVelocity += impulseBase * axleFactor;
      };

      // First impact when front axle climbs bump, second when rear axle climbs it.
      maybeApplyAxleBump("front", prevFrontAxle, currFrontAxle, 1.0);
      maybeApplyAxleBump("rear", prevRearAxle, currRearAxle, 0.9);

      const frontDx = currFrontAxle.x - segment.center.x;
      const frontDy = currFrontAxle.y - segment.center.y;
      const rearDx = currRearAxle.x - segment.center.x;
      const rearDy = currRearAxle.y - segment.center.y;
      const frontLong = frontDx * dir.x + frontDy * dir.y;
      const frontLat = frontDx * right.x + frontDy * right.y;
      const rearLong = rearDx * dir.x + rearDy * dir.y;
      const rearLat = rearDx * right.x + rearDy * right.y;
      // Keep a small tolerance so low-speed creeping does not visually "sink" into bump edges.
      const supportLong = segment.halfLongitudinal + 0.22;
      const supportLat = segment.halfLateral + 0.12;
      const frontOnBump =
        Math.abs(frontLong) <= supportLong &&
        Math.abs(frontLat) <= supportLat;
      const rearOnBump =
        Math.abs(rearLong) <= supportLong &&
        Math.abs(rearLat) <= supportLat;
      if (frontOnBump || rearOnBump) {
        // Keep body lifted while an axle is physically over the bump.
        const support =
          frontOnBump && rearOnBump
            ? segment.bumpHeight * 2.2
            : segment.bumpHeight * 1.6;
        bumpSupportTarget = Math.max(bumpSupportTarget, support);
      }

      const bumpWheelSupport = (wheelPoint) => {
        const dx = wheelPoint.x - segment.center.x;
        const dy = wheelPoint.y - segment.center.y;
        const longitudinal = dx * dir.x + dy * dir.y;
        const lateral = dx * right.x + dy * right.y;
        const supportLongWheel = segment.halfLongitudinal + 0.2;
        const supportLatWheel = segment.halfLateral + 0.12;
        if (Math.abs(longitudinal) <= supportLongWheel && Math.abs(lateral) <= supportLatWheel) {
          return segment.bumpHeight * 1.35;
        }
        return 0;
      };

      wheelSupport.fl = Math.max(wheelSupport.fl, bumpWheelSupport(currWheels.fl));
      wheelSupport.fr = Math.max(wheelSupport.fr, bumpWheelSupport(currWheels.fr));
      wheelSupport.rl = Math.max(wheelSupport.rl, bumpWheelSupport(currWheels.rl));
      wheelSupport.rr = Math.max(wheelSupport.rr, bumpWheelSupport(currWheels.rr));
    }

    const frontAvg = (wheelSupport.fl + wheelSupport.fr) * 0.5;
    const rearAvg = (wheelSupport.rl + wheelSupport.rr) * 0.5;
    const leftAvg = (wheelSupport.fl + wheelSupport.rl) * 0.5;
    const rightAvg = (wheelSupport.fr + wheelSupport.rr) * 0.5;
    const avgSupport = (wheelSupport.fl + wheelSupport.fr + wheelSupport.rl + wheelSupport.rr) * 0.25;
    bumpSupportTarget = Math.max(bumpSupportTarget, avgSupport * 1.1);
    bumpPitchTarget = Math.atan2(frontAvg - rearAvg, Math.max(1.0, wheelbaseMeters));
    bumpRollTarget = Math.atan2(rightAvg - leftAvg, Math.max(0.8, trackWidthMeters));
    bumpPitchTarget = Math.max(-0.22, Math.min(0.22, bumpPitchTarget));
    bumpRollTarget = Math.max(-0.22, Math.min(0.22, bumpRollTarget));

    const supportRise = 18;
    const supportFall = 10;
    const supportLambda = bumpSupportTarget > state.sim.bumpSupport ? supportRise : supportFall;
    state.sim.bumpSupport = smoothTowards(state.sim.bumpSupport, bumpSupportTarget, supportLambda, dt);
    const tiltRise = 16;
    const tiltFall = 11;
    const pitchLambda = Math.abs(bumpPitchTarget) > Math.abs(state.sim.bumpPitch) ? tiltRise : tiltFall;
    const rollLambda = Math.abs(bumpRollTarget) > Math.abs(state.sim.bumpRoll) ? tiltRise : tiltFall;
    state.sim.bumpPitch = smoothTowards(state.sim.bumpPitch, bumpPitchTarget, pitchLambda, dt);
    state.sim.bumpRoll = smoothTowards(state.sim.bumpRoll, bumpRollTarget, rollLambda, dt);

    const spring = 22;
    const damper = 8.5;
    state.sim.bumpVelocity += (-spring * state.sim.bumpOffset - damper * state.sim.bumpVelocity) * dt;
    state.sim.bumpOffset += state.sim.bumpVelocity * dt;
    state.sim.bumpOffset = Math.max(-0.16, Math.min(0.58, state.sim.bumpOffset));

    runRuleDetectors(prevFrontAxle, currFrontAxle, currHeadingRad);
  } else {
    state.sim.steerVisualAngle += (0 - state.sim.steerVisualAngle) * Math.min(1, dt * 8);
    state.sim.bumpSupport = smoothTowards(state.sim.bumpSupport, 0, 10, dt);
    state.sim.bumpPitch = smoothTowards(state.sim.bumpPitch, 0, 12, dt);
    state.sim.bumpRoll = smoothTowards(state.sim.bumpRoll, 0, 12, dt);
    const spring = 22;
    const damper = 8.5;
    state.sim.bumpVelocity += (-spring * state.sim.bumpOffset - damper * state.sim.bumpVelocity) * dt;
    state.sim.bumpOffset += state.sim.bumpVelocity * dt;
    state.sim.bumpOffset = Math.max(-0.16, Math.min(0.58, state.sim.bumpOffset));
  }

  if (state.sim.car) {
    let parkingDebugText = "";
    const parallelCheckpoint = routeCheckpoint("parking_parallel");
    const parallelDebug = parkingDetectionDebug(parallelCheckpoint);
    if (parallelDebug && (parallelDebug.occupied || parallelDebug.centerDistM <= 16)) {
      if (parallelDebug.occupied) {
        parkingDebugText =
          ` pk=OK(slot ${parallelDebug.slotIndex + 1}/${parallelDebug.slotCount}` +
          ` in=${parallelDebug.insideCount}/${parallelDebug.requiredInside}` +
          ` clr=${parallelDebug.rearClearM.toFixed(2)}/${parallelDebug.frontClearM.toFixed(2)}m` +
          ` src=${parallelDebug.probeSource})`;
      } else {
        parkingDebugText =
          ` pk=near slot ${parallelDebug.slotIndex + 1}/${parallelDebug.slotCount}` +
          ` d=${parallelDebug.centerDistM.toFixed(1)}m ang=${parallelDebug.headingErrDeg.toFixed(0)}deg` +
          ` c=${parallelDebug.centerInside ? 1 : 0} in=${parallelDebug.insideCount}/${parallelDebug.requiredInside}` +
          ` clr=${parallelDebug.rearClearM.toFixed(2)}/${parallelDebug.frontClearM.toFixed(2)}m` +
          ` ctr=${parallelDebug.centerOffsetLongM.toFixed(2)}/${parallelDebug.centerToleranceM.toFixed(2)} ok=${parallelDebug.centeredLongOk ? 1 : 0}` +
          ` bal=${parallelDebug.clearBalanceM.toFixed(2)}/${parallelDebug.clearBalanceToleranceM.toFixed(2)} ok=${parallelDebug.clearBalanceOk ? 1 : 0}` +
          ` m=${parallelDebug.frontRearMarginM.toFixed(2)} ok=${parallelDebug.frontRearOk ? 1 : 0}` +
          ` src=${parallelDebug.probeSource}`;
      }
    }
    dom.carState.textContent =
      `Car x=${state.sim.car.x.toFixed(1)} y=${state.sim.car.y.toFixed(1)} ` +
      `speed=${state.sim.car.speedKmh.toFixed(1)}km/h signal=${state.sim.lastSignal || "off"} camera=${state.sim.camera}` +
      parkingDebugText;
  } else {
    dom.carState.textContent = "Car: --";
  }

  if (state.multiplayer.connected) {
    broadcastLocalPose(now);
    pruneMultiplayerPeers(now);
  }
  updateMultiplayerPeerRenderStates(dt, now);

  const renderedThree = updateThreeScene(dt);
  if (!renderedThree) {
    drawSimulation();
  }
  maybeUpdateOverlays(now);
  requestAnimationFrame(frame);
}

async function startSimulation() {
  if (!state.token) {
    throw new Error("Login first");
  }

  if (!state.sim.three.ready && !state.sim.three.failed) {
    await initThreeEngine();
  }

  const routeId = dom.routeSelect.value;
  const startPayload = await api("/v1/sim/sessions/start", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ route_id: routeId }),
  });

  const hasMapperOverride = routeId === "A" && state.mapper.routeOverrideA;
  const activeRoute = hasMapperOverride
    ? JSON.parse(JSON.stringify(state.mapper.routeOverrideA))
    : startPayload.route;

  try {
    await ensureMultiplayerRoomForRoute(routeId);
  } catch (error) {
    setMultiplayerStatus(error.message, true);
  }

  state.sim.route = activeRoute;
  state.sim.routePath = buildRoutePath(activeRoute);
  state.sim.routeDensePath = densifyPath(state.sim.routePath, 2.1);
  state.sim.routeBounds = computeRouteBounds(state.sim.routeDensePath);
  const spawnPose = computeSpawnPose(activeRoute) || activeRoute.startPose;

  state.sim.sessionId = startPayload.session_id;
  state.sim.sessionHeartbeatToken = startPayload.heartbeat_token || null;
  state.sim.car = {
    x: spawnPose.x,
    y: spawnPose.y,
    headingDeg: spawnPose.headingDeg,
    speedKmh: 0,
  };

  state.sim.startedAt = Date.now();
  state.sim.lastKeepAliveAt = 0;
  state.sim.lastInputAt = Date.now();
  state.sim.idleAbandoning = false;
  state.sim.inactivityAlertPending = false;
  state.sim.inactivityAlertShown = false;
  state.sim.camera = "first";
  state.sim.trafficLightRed = true;
  state.sim.trafficLightManual = null;
  state.sim.correctionCount = 0;
  state.sim.penaltyPoints = 0;
  state.sim.lastSpeedSign = 0;
  state.sim.triggered = new Set();
  state.sim.speedOverSince = null;
  state.sim.insideRoundabout = false;
  state.sim.lastSignal = null;
  state.sim.steerVisualAngle = 0;
  state.sim.wheelRollRad = 0;
  state.sim.bumpOffset = 0;
  state.sim.bumpVelocity = 0;
  state.sim.bumpSupport = 0;
  state.sim.bumpPitch = 0;
  state.sim.bumpRoll = 0;
  state.sim.lastBumpAtMs = 0;
  state.sim.bumpAxleContacts = {};
  state.sim.bumpAxleHitAtMs = {};
  state.sim.stopLineContacts = {};
  state.sim.three.thirdCameraPos = null;
  state.sim.three.thirdCameraLook = null;
  state.sim.three.externalCameraMode = null;
  state.keys.clear();
  startSimKeepAliveLoop();
  sendSimKeepAlive(Date.now());

  if (state.sim.three.ready) {
    rebuildThreeRouteScene();
  }

  const b = state.sim.routeBounds;
  const routeSummary = b
    ? `Route loaded (${state.sim.routePath.length} points, x:${b.minX.toFixed(0)}-${b.maxX.toFixed(0)}, y:${b.minY.toFixed(0)}-${b.maxY.toFixed(0)}).`
    : `Route loaded (${state.sim.routePath.length} points).`;
  const routeSource = hasMapperOverride ? "Source: mapper override." : "Source: server route.";
  dom.simState.textContent =
    `Session ${state.sim.sessionId} started on route ${routeId}. ${routeSummary} ${routeSource} Camera: first-person. ` +
    `Traffic light: auto cycle (${state.sim.trafficLightCycleSec}s).`;
  const cockpitInfo =
    state.sim.three.cockpitSource === "model"
      ? `Driving... ${cockpitDebugSummary()}`
      : `Driving... Cockpit source: procedural.${state.sim.three.modelError ? ` Reason: ${state.sim.three.modelError}` : ""}`;
  dom.simOutput.textContent = cockpitInfo;
  dom.toggleLightBtn.textContent = "Manual Light Override";
  hidePenaltyCard();
  updateHudOverlay();
  drawMiniMapOverlay();
}

async function finishSimulation() {
  if (!state.sim.sessionId) {
    throw new Error("Start simulation first");
  }

  const durationSec = Math.round((Date.now() - state.sim.startedAt) / 1000);
  const result = await api(`/v1/sim/sessions/${state.sim.sessionId}/finish`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ duration_sec: durationSec }),
  });

  dom.simOutput.textContent = formatJson(result);
  dom.simState.textContent = `Session finished: score=${result.score_pct}, critical_fail=${result.critical_fail}`;
  state.sim.sessionId = null;
  state.sim.sessionHeartbeatToken = null;
  state.sim.lastKeepAliveAt = 0;
  state.sim.lastInputAt = 0;
  state.sim.idleAbandoning = false;
  state.sim.inactivityAlertPending = false;
  state.sim.inactivityAlertShown = false;
  state.sim.trafficLightManual = null;
  state.keys.clear();
  state.sim.stopLineContacts = {};
  stopSimKeepAliveLoop();
  hidePenaltyCard();
  dom.toggleLightBtn.textContent = "Manual Light Override";
  updateHudOverlay();
}

async function loadTheoryLeaderboard() {
  const data = await api("/v1/leaderboard/theory");
  renderTableRows(dom.theoryTableBody, data.leaderboard, ["rank", "username", "score_pct", "duration_sec"]);
}

async function loadSimulationLeaderboard() {
  const data = await api("/v1/leaderboard/simulation");
  renderTableRows(dom.simTableBody, data.leaderboard, ["rank", "username", "route_id", "score_pct", "critical_fail"]);
}

async function loadProfile() {
  if (!state.token) {
    throw new Error("Login first");
  }

  const profile = await api("/v1/profile/me", {
    headers: authHeaders(),
  });

  dom.profileOutput.textContent = formatJson(profile);
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function handleControlKey(key) {
  if (!state.sim.sessionId || !state.sim.car) {
    return;
  }

  if (key === "q") {
    setSignal("left", { toggle: true });
    return;
  }
  if (key === "e") {
    setSignal("right", { toggle: true });
    return;
  }
  if (key === "c") {
    state.sim.camera = nextCameraMode(state.sim.camera);
    dom.simState.textContent = `Camera switched to ${cameraModeLabel(state.sim.camera)} view.`;
    return;
  }
  if (key === "r") {
    resetCarPosition();
    return;
  }
  if (key === "p") {
    validateParallelParking();
    return;
  }
  if (key === "o") {
    validateDiagonalParking();
    return;
  }

  if (CONTINUOUS_KEYS.has(key)) {
    state.keys.add(key);
  }
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (isEditableTarget(event.target)) {
    return;
  }

  if (!CONTROL_KEYS.has(key)) {
    return;
  }

  if (!state.sim.sessionId) {
    return;
  }

  if (event.repeat && !CONTINUOUS_KEYS.has(key)) {
    return;
  }

  event.preventDefault();
  markSimInput(Date.now());
  handleControlKey(key);
});

window.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();

  if (!CONTROL_KEYS.has(key)) {
    return;
  }

  state.keys.delete(key);
});

window.addEventListener("blur", () => {
  state.keys.clear();
  broadcastLocalPose(Date.now(), { force: true });
});

window.addEventListener("resize", syncCanvasSize);

function bindRouteMapperUi() {
  if (dom.mapperMapName && !dom.mapperMapName.value.trim()) {
    dom.mapperMapName.value = defaultMapperMapName();
  }
  state.mapper.libraryRouteFilter = dom.mapperLibraryRouteFilter?.value || "A";
  state.mapper.librarySearch = dom.mapperLibrarySearch?.value || "";

  dom.mapperCheckpointType.addEventListener("change", updateMapperCheckpointUi);
  dom.mapperLaneWidth.addEventListener("input", () => {
    if (state.mapper.scalePointsPx.length === 2) {
      const [a, b] = state.mapper.scalePointsPx;
      const pxDist = Math.hypot(b.x - a.x, b.y - a.y);
      const meters = Math.max(0.1, Number(dom.mapperLaneWidth.value) || 7);
      state.mapper.metersPerPixel = meters / Math.max(1, pxDist);
      setMapperStatus(`scale updated: ${state.mapper.metersPerPixel.toFixed(4)} m/px.`);
      refreshMapperJsonPreview();
      drawMapperCanvas();
    }
  });

  dom.mapperImageFile.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (state.mapper.imageUrl) {
      URL.revokeObjectURL(state.mapper.imageUrl);
    }
    state.mapper.imageUrl = URL.createObjectURL(file);

    const img = new Image();
    img.onload = () => {
      state.mapper.image = img;
      state.mapper.imageFit = null;
      clearMapperSelection();
      state.mapper.dragging = null;
      setMapperStatus("image loaded. Click 'Set Scale' first.");
      refreshMapperJsonPreview();
      drawMapperCanvas();
    };
    img.onerror = () => {
      setMapperStatus("failed to read image.");
    };
    img.src = state.mapper.imageUrl;
  });

  dom.mapperScaleMode.addEventListener("click", () => {
    if (!state.mapper.image && !state.mapper.pathPointsPx.length && !state.mapper.checkpointsPx.length) {
      alert("Upload the map image or open a saved map first.");
      return;
    }
    state.mapper.mode = "scale";
    state.mapper.lane3DraftStartIndex = -1;
    clearMapperSelection();
    state.mapper.dragging = null;
    state.mapper.scalePointsPx = [];
    setMapperStatus("scale mode active. Click two points with known distance.");
    drawMapperCanvas();
  });

  dom.mapperPathMode.addEventListener("click", () => {
    if (!state.mapper.image && !state.mapper.pathPointsPx.length) {
      alert("Upload the map image or open a saved map first.");
      return;
    }
    if (!state.mapper.metersPerPixel) {
      alert("Set scale first.");
      return;
    }
    state.mapper.mode = "path";
    state.mapper.lane3DraftStartIndex = -1;
    clearMapperSelection();
    state.mapper.dragging = null;
    setMapperStatus("path mode active. Click route centerline points in order (auto-snap to existing nodes).");
    drawMapperCanvas();
  });

  dom.mapperEditMode.addEventListener("click", () => {
    if (!state.mapper.image) {
      alert("Upload the map image first.");
      return;
    }
    state.mapper.mode = "idle";
    state.mapper.lane3DraftStartIndex = -1;
    state.mapper.pendingCheckpointType = null;
    state.mapper.pathNextMove = false;
    state.mapper.dragging = null;
    setMapperStatus("select/move mode active. Drag points or checkpoints.");
    drawMapperCanvas();
  });

  dom.mapperNewSegment.addEventListener("click", () => {
    if (!state.mapper.image && !state.mapper.pathPointsPx.length) {
      alert("Upload the map image or open a saved map first.");
      return;
    }
    if (!state.mapper.pathPointsPx.length) {
      alert("Add at least one path point first.");
      return;
    }
    state.mapper.mode = "path";
    state.mapper.lane3DraftStartIndex = -1;
    clearMapperSelection();
    state.mapper.dragging = null;
    state.mapper.pathNextMove = true;
    setMapperStatus("new segment armed. Next path click will start a branch without connecting line.");
    drawMapperCanvas();
  });

  dom.mapperInsertNode.addEventListener("click", () => {
    if (!state.mapper.image && !state.mapper.pathPointsPx.length) {
      alert("Upload the map image or open a saved map first.");
      return;
    }
    if (state.mapper.pathPointsPx.length < 2) {
      alert("Add at least two path points first.");
      return;
    }
    state.mapper.mode = "insert_path";
    state.mapper.lane3DraftStartIndex = -1;
    clearMapperSelection();
    state.mapper.dragging = null;
    state.mapper.pathNextMove = false;
    state.mapper.pendingCheckpointType = null;
    setMapperStatus("insert node mode active. Click a segment between two nodes.");
    drawMapperCanvas();
  });

  dom.mapperLane3Segment.addEventListener("click", () => {
    if (!state.mapper.image && !state.mapper.pathPointsPx.length) {
      alert("Upload the map image or open a saved map first.");
      return;
    }
    if (state.mapper.pathPointsPx.length < 2) {
      alert("Add at least two path nodes first.");
      return;
    }
    state.mapper.mode = "lane3_pick_start";
    state.mapper.lane3DraftStartIndex = -1;
    state.mapper.pendingCheckpointType = null;
    clearMapperSelection();
    state.mapper.dragging = null;
    setMapperStatus("3L segment mode: click START node, then END node on the same continuous path.");
    drawMapperCanvas();
  });

  dom.mapperPlaceCheckpoint.addEventListener("click", () => {
    if (!state.mapper.image && !state.mapper.pathPointsPx.length) {
      alert("Upload the map image or open a saved map first.");
      return;
    }
    state.mapper.pendingCheckpointType = dom.mapperCheckpointType.value;
    state.mapper.mode = "checkpoint";
    state.mapper.lane3DraftStartIndex = -1;
    clearMapperSelection();
    state.mapper.dragging = null;
    setMapperStatus(`${state.mapper.pendingCheckpointType} mode. Click checkpoint location.`);
    drawMapperCanvas();
  });

  dom.mapperDeleteSelected.addEventListener("click", () => {
    const selected = mapperSelectedRef();
    if (!selected) {
      setMapperStatus("No selected point/checkpoint to delete.");
      return;
    }
    if (selected.kind === "checkpoint") {
      if (selected.index >= 0 && selected.index < state.mapper.checkpointsPx.length) {
        state.mapper.checkpointsPx.splice(selected.index, 1);
        setMapperStatus("Selected checkpoint deleted.");
      }
    } else if (selected.kind === "path") {
      const result = deleteMapperPathPoint(selected.index);
      if (result.ok) {
        if (result.removedLaneProfiles > 0) {
          setMapperStatus(
            `Selected path point deleted. ${result.removedLaneProfiles} tramo(s) 3L invalidado(s) por editar nodo boundary.`,
          );
        } else {
          setMapperStatus("Selected path point deleted.");
        }
      }
    }
    clearMapperSelection();
    state.mapper.dragging = null;
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    refreshMapperJsonPreview();
    drawMapperCanvas();
  });

  dom.mapperUndo.addEventListener("click", () => {
    if (state.mapper.mode === "path" && state.mapper.pathPointsPx.length > 0) {
      const removedPathIndex = state.mapper.pathPointsPx.length - 1;
      state.mapper.pathPointsPx.pop();
      if (!state.mapper.pathPointsPx.length) {
        state.mapper.pathNextMove = false;
      }
      const removedLaneProfiles = mapperReindexLaneProfilesAfterDelete(removedPathIndex);
      if (removedLaneProfiles > 0) {
        setMapperStatus(`removed last path point. ${removedLaneProfiles} tramo(s) 3L invalidado(s).`);
      } else {
        setMapperStatus("removed last path point.");
      }
    } else if (state.mapper.checkpointsPx.length > 0) {
      state.mapper.checkpointsPx.pop();
      setMapperStatus("removed last checkpoint.");
    } else if (state.mapper.scalePointsPx.length > 0) {
      state.mapper.scalePointsPx.pop();
      state.mapper.metersPerPixel = 0;
      setMapperStatus("removed scale point.");
    }
    clearMapperSelection();
    state.mapper.lane3DraftStartIndex = -1;
    state.mapper.dragging = null;
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    refreshMapperJsonPreview();
    drawMapperCanvas();
  });

  dom.mapperClear.addEventListener("click", () => {
    state.mapper.mode = "idle";
    state.mapper.lane3DraftStartIndex = -1;
    state.mapper.scalePointsPx = [];
    state.mapper.metersPerPixel = 0;
    state.mapper.pathPointsPx = [];
    state.mapper.pathNextMove = false;
    state.mapper.checkpointsPx = [];
    state.mapper.pendingCheckpointType = null;
    clearMapperSelection();
    state.mapper.dragging = null;
    state.mapper.routeOverrideA = null;
    persistMapperRouteOverride();
    dom.mapperJson.textContent = "";
    setMapperStatus("cleared.");
    drawMapperCanvas();
  });

  dom.mapperApplyRoute.addEventListener("click", () => {
    try {
      const route = mapperBuildRouteAFromCanvas();
      state.mapper.routeOverrideA = route;
      persistMapperRouteOverride();
      dom.mapperJson.textContent = formatJson(route);
      setMapperStatus(
        `Route A override ready (${route.path.length} points, ${route.checkpoints.length} checkpoints). Start session to use it.`,
      );
    } catch (error) {
      alert(error.message);
    }
  });

  dom.mapperSaveRoute.addEventListener("click", async () => {
    if (!state.token) {
      alert("Login first.");
      return;
    }
    if (!state.user?.is_creator) {
      alert("Only the creator account can save maps.");
      return;
    }

    let route;
    try {
      route = resolveMapperRouteForSave();
    } catch (error) {
      alert(error.message);
      return;
    }

    const requestedName = (dom.mapperMapName?.value || "").trim() || defaultMapperMapName();
    try {
      const result = await api("/v1/maps/save", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          route_id: "A",
          name: requestedName,
          route,
        }),
      });
      if (dom.mapperMapName) {
        dom.mapperMapName.value = result.map?.name || requestedName;
      }
      state.mapper.selectedMapId = result.map?.map_id || "";
      dom.mapperJson.textContent = formatJson(result.route);
      setMapperStatus(`Route A saved (map ${result.map.map_id}, v${result.map.version}).`);
      await loadMapperMapLibrary({ preserveSelection: true });
    } catch (error) {
      alert(error.message);
    }
  });

  dom.mapperPublishRoute.addEventListener("click", async () => {
    if (!state.token) {
      alert("Login first.");
      return;
    }
    if (!state.user?.is_creator) {
      alert("Only the creator account can publish global maps.");
      return;
    }

    let route;
    try {
      route = resolveMapperRouteForSave();
    } catch (error) {
      alert(error.message);
      return;
    }

    const requestedName = (dom.mapperMapName?.value || "").trim() || defaultMapperMapName();
    try {
      const result = await api("/v1/maps/publish", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          route_id: "A",
          name: requestedName,
          route,
        }),
      });
      if (dom.mapperMapName) {
        dom.mapperMapName.value = result.map?.name || requestedName;
      }
      state.mapper.selectedMapId = result.map?.map_id || "";
      setMapperStatus(
        `Route A published globally (map ${result.map.map_id}, v${result.map.version}). All players now receive it.`,
      );
      dom.mapperJson.textContent = formatJson(result.route);
      await loadMapperMapLibrary({ preserveSelection: true });
    } catch (error) {
      alert(error.message);
    }
  });

  dom.mapperLibraryRouteFilter.addEventListener("change", () => {
    state.mapper.libraryRouteFilter = dom.mapperLibraryRouteFilter.value || "A";
    loadMapperMapLibrary({ preserveSelection: false }).catch((error) => {
      updateMapperLibraryStatus(`Saved maps: failed (${error.message}).`);
    });
  });

  dom.mapperLibrarySearch.addEventListener("input", () => {
    state.mapper.librarySearch = dom.mapperLibrarySearch.value || "";
  });

  dom.mapperLibrarySearch.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    state.mapper.librarySearch = dom.mapperLibrarySearch.value || "";
    loadMapperMapLibrary({ preserveSelection: false }).catch((error) => {
      updateMapperLibraryStatus(`Saved maps: failed (${error.message}).`);
    });
  });

  dom.mapperLibraryRefresh.addEventListener("click", () => {
    state.mapper.librarySearch = dom.mapperLibrarySearch.value || "";
    loadMapperMapLibrary({ preserveSelection: false }).catch((error) => {
      updateMapperLibraryStatus(`Saved maps: failed (${error.message}).`);
    });
  });

  dom.mapperSavedMaps.addEventListener("change", () => {
    state.mapper.selectedMapId = dom.mapperSavedMaps.value || "";
    updateMapperMapActions();
  });

  dom.mapperOpenMap.addEventListener("click", async () => {
    if (!state.token) {
      alert("Login first.");
      return;
    }
    if (!state.user?.is_creator) {
      alert("Only the creator account can edit saved maps.");
      return;
    }
    const selected = selectedMapperMapRecord();
    if (!selected) {
      alert("Select a saved map first.");
      return;
    }
    if (String(selected.route_id || "").toUpperCase() !== "A") {
      alert("Route A mapper currently edits Route A maps only.");
      return;
    }
    try {
      const result = await api(`/v1/maps/${encodeURIComponent(selected.map_id)}`, {
        headers: authHeaders(),
      });
      loadRouteIntoMapperEditor(result.route, { mapName: result.map?.name || selected.name });
      setMapperStatus(
        `Loaded map ${result.map?.map_id || selected.map_id} for editing (${result.route.path.length} points, ${result.route.checkpoints.length} checkpoints).`,
      );
    } catch (error) {
      alert(error.message);
    }
  });

  dom.mapperActivateMap.addEventListener("click", async () => {
    if (!state.token) {
      alert("Login first.");
      return;
    }
    if (!state.user?.is_creator) {
      alert("Only the creator account can activate maps globally.");
      return;
    }
    const selected = selectedMapperMapRecord();
    if (!selected) {
      alert("Select a saved map first.");
      return;
    }

    try {
      const result = await api("/v1/maps/activate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          map_id: selected.map_id,
          route_id: selected.route_id,
        }),
      });
      state.mapper.selectedMapId = result.map?.map_id || selected.map_id;
      setMapperStatus(
        `Global route ${result.map.route_id} now uses map ${result.map.map_id} (${result.map.name}, v${result.map.version}).`,
      );
      await loadMapperMapLibrary({ preserveSelection: true });
    } catch (error) {
      alert(error.message);
    }
  });

  dom.mapperDownloadJson.addEventListener("click", () => {
    let route = state.mapper.routeOverrideA;
    if (!route) {
      try {
        route = mapperBuildRouteAFromCanvas();
      } catch (error) {
        alert(error.message);
        return;
      }
    }

    const blob = new Blob([formatJson(route)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `route_A_${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMapperStatus("route JSON downloaded.");
  });

  dom.mapperImportJson.addEventListener("click", () => {
    dom.mapperImportJsonFile.value = "";
    dom.mapperImportJsonFile.click();
  });

  dom.mapperImportJsonFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const route = sanitizeMapperRoute(parsed);
      loadRouteIntoMapperEditor(route);
      setMapperStatus(`imported Route A JSON (${route.path.length} points). You can edit and apply/save it.`);
    } catch (error) {
      alert(`Invalid JSON: ${error.message}`);
    }
  });

  dom.mapperCanvas.addEventListener("pointerdown", handleMapperCanvasPointerDown);
  dom.mapperCanvas.addEventListener("pointermove", handleMapperCanvasPointerMove);
  dom.mapperCanvas.addEventListener("pointerup", handleMapperCanvasPointerUp);
  dom.mapperCanvas.addEventListener("pointerleave", handleMapperCanvasPointerUp);
  dom.mapperCanvas.addEventListener("click", handleMapperCanvasClick);
  loadPersistedMapperRouteOverride();
  renderMapperMapLibrary();
  updateMapperMapActions();
  updateMapperLibraryStatus("Saved maps: creator login required.");
  updateMapperCheckpointUi();
  drawMapperCanvas();
}

function bindUi() {
  document.querySelector("#register-btn").addEventListener("click", () => {
    register().catch((error) => {
      showAuthFeedback(error.message, "error");
      alert(error.message);
    });
  });
  document.querySelector("#login-btn").addEventListener("click", () => {
    login().catch((error) => {
      showAuthFeedback(error.message, "error");
      alert(error.message);
    });
  });
  document.querySelector("#logout-btn").addEventListener("click", clearAuth);

  document.querySelector("#start-exam").addEventListener("click", () => createExam().catch((error) => alert(error.message)));
  document
    .querySelector("#submit-random-exam")
    .addEventListener("click", () => submitExam(false).catch((error) => alert(error.message)));
  document
    .querySelector("#submit-perfect-exam")
    .addEventListener("click", () => submitExam(true).catch((error) => alert(error.message)));

  document.querySelector("#start-sim").addEventListener("click", () => startSimulation().catch((error) => alert(error.message)));
  document
    .querySelector("#finish-sim")
    .addEventListener("click", () => finishSimulation().catch((error) => alert(error.message)));
  dom.resetPenaltyBtn.addEventListener("click", () => {
    resetPenaltyPoints();
    dom.simState.textContent = "Penalidad acumulada reiniciada.";
  });
  dom.toggleLightBtn.addEventListener("click", () => {
    if (!state.sim.sessionId) {
      alert("Start a simulation session first.");
      return;
    }

    if (state.sim.trafficLightManual === null) {
      state.sim.trafficLightManual = !isTrafficLightRed();
      dom.toggleLightBtn.textContent = "Return Auto Light";
      dom.simState.textContent = `Traffic light manual override: ${state.sim.trafficLightManual ? "RED" : "GREEN"}.`;
    } else {
      state.sim.trafficLightManual = null;
      dom.toggleLightBtn.textContent = "Manual Light Override";
      dom.simState.textContent = `Traffic light back to auto cycle (${state.sim.trafficLightCycleSec}s).`;
    }
  });
  document.querySelector("#yield-fail").addEventListener("click", () => {
    sendSimEvent("roundabout_no_yield_left", { source: "manual" });
  });

  if (dom.multiplayerRoom) {
    dom.multiplayerRoom.addEventListener("input", () => {
      dom.multiplayerRoom.dataset.manual = "1";
    });
  }
  if (dom.routeSelect) {
    dom.routeSelect.addEventListener("change", () => {
      if (!dom.multiplayerRoom) {
        return;
      }
      const isManual = dom.multiplayerRoom.dataset.manual === "1";
      if (!isManual || !dom.multiplayerRoom.value.trim()) {
        dom.multiplayerRoom.value = defaultMultiplayerRoomId(dom.routeSelect.value);
      }
    });
  }
  if (dom.multiplayerJoinBtn) {
    dom.multiplayerJoinBtn.addEventListener("click", () => {
      const roomId = dom.multiplayerRoom?.value || "";
      joinMultiplayerRoom(roomId).catch((error) => {
        setMultiplayerStatus(error.message, true);
        alert(error.message);
      });
    });
  }
  if (dom.multiplayerLeaveBtn) {
    dom.multiplayerLeaveBtn.addEventListener("click", () => {
      leaveMultiplayerRoom().catch((error) => {
        setMultiplayerStatus(error.message, true);
      });
    });
  }
  document.addEventListener("visibilitychange", () => {
    broadcastLocalPose(Date.now(), { force: true });
    if (!document.hidden) {
      flushPendingInactivityDisconnectAlert();
    }
  });

  document
    .querySelector("#load-theory")
    .addEventListener("click", () => loadTheoryLeaderboard().catch((error) => alert(error.message)));
  document
    .querySelector("#load-sim")
    .addEventListener("click", () => loadSimulationLeaderboard().catch((error) => alert(error.message)));
  document
    .querySelector("#load-profile")
    .addEventListener("click", () => loadProfile().catch((error) => alert(error.message)));

  bindRouteMapperUi();
}

updateAuthState();
bindUi();
syncCanvasSize();
initThreeEngine();
loadRealtimeConfig().then(() => updateAuthState());
requestAnimationFrame(frame);
