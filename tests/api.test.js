import test from "node:test";
import assert from "node:assert/strict";

import { createStore } from "../src/lib/store.js";
import { registerUser } from "../src/lib/auth.js";
import { createExamAttempt, submitExamAttempt } from "../src/lib/exam.js";
import { startSimSession, appendSimEvents, finishSimSession, cleanupSimActiveSessions } from "../src/lib/sim.js";
import { publishRouteMap, saveRouteMap, activateRouteMap, listRouteMaps } from "../src/lib/maps.js";
import { saveAssistedRouteMap, getAssistedRouteMap } from "../src/lib/assisted.js";
import {
  buildTheoryLeaderboard,
  buildSimulationLeaderboard,
  buildUserProfile,
} from "../src/lib/leaderboard.js";

function createAuthedUser(store, username, email) {
  const registered = registerUser(store, {
    username,
    email,
    password: "secret123",
  });

  assert.equal(registered.status, 201);
  return store.users.find((user) => user.user_id === registered.data.user.user_id);
}

function submitTheory(store, user, mode = "perfect", durationSec = 600) {
  const draft = createExamAttempt(store, user);
  const answers = {};

  for (const question of draft.questions) {
    answers[question.id] = mode === "perfect" ? question.debugCorrectOption : "A";
  }

  const submitted = submitExamAttempt(store, user, draft.attempt_id, {
    answers,
    duration_sec: durationSec,
  });

  assert.equal(submitted.status, 200);
  return submitted.data;
}

function finishSimulationSession(store, user, routeId, triggerKeys, durationSec = 120) {
  const started = startSimSession(store, user, { route_id: routeId });
  assert.equal(started.status, 201);

  const sessionId = started.data.session_id;
  if (triggerKeys.length > 0) {
    const append = appendSimEvents(store, user, sessionId, {
      events: triggerKeys.map((triggerKey, idx) => ({
        triggerKey,
        atMs: (idx + 1) * 1000,
        meta: {},
      })),
    });

    assert.equal(append.status, 202);
  }

  const finished = finishSimSession(store, user, sessionId, {
    duration_sec: durationSec,
  });

  assert.equal(finished.status, 200);
  return finished.data;
}

test("leaderboard payloads expose no combined score fields", () => {
  const store = createStore();
  const user = createAuthedUser(store, "alice", "alice@test.com");

  submitTheory(store, user, "perfect", 600);
  finishSimulationSession(store, user, "A", ["speed_over_limit"], 100);

  const theory = buildTheoryLeaderboard(store);
  const simulation = buildSimulationLeaderboard(store);

  assert.ok(!Object.hasOwn(theory[0], "combined"));
  assert.ok(!Object.hasOwn(theory[0], "combinedScore"));
  assert.ok(!Object.hasOwn(simulation[0], "combined"));
  assert.ok(!Object.hasOwn(simulation[0], "combinedScore"));
});

test("theory leaderboard updates only after exam submission", () => {
  const store = createStore();
  const user = createAuthedUser(store, "bob", "bob@test.com");

  createExamAttempt(store, user);
  const beforeSubmit = buildTheoryLeaderboard(store);
  assert.equal(beforeSubmit.length, 0);

  submitTheory(store, user, "perfect", 700);
  const afterSubmit = buildTheoryLeaderboard(store);
  assert.equal(afterSubmit.length, 1);
  assert.equal(afterSubmit[0].username, "bob");
});

test("simulation leaderboard updates only after sim session finish", () => {
  const store = createStore();
  const user = createAuthedUser(store, "carla", "carla@test.com");

  const started = startSimSession(store, user, { route_id: "A" });
  assert.equal(started.status, 201);

  appendSimEvents(store, user, started.data.session_id, {
    events: [{ triggerKey: "speed_over_limit", atMs: 2000, meta: {} }],
  });

  const beforeFinish = buildSimulationLeaderboard(store);
  assert.equal(beforeFinish.length, 0);

  finishSimSession(store, user, started.data.session_id, { duration_sec: 100 });
  const afterFinish = buildSimulationLeaderboard(store);
  assert.equal(afterFinish.length, 1);
  assert.equal(afterFinish[0].username, "carla");
});

test("ordering logic is independent for theory and simulation", () => {
  const store = createStore();
  const u1 = createAuthedUser(store, "u1", "u1@test.com");
  const u2 = createAuthedUser(store, "u2", "u2@test.com");

  submitTheory(store, u1, "perfect", 700);
  submitTheory(store, u2, "perfect", 500);

  const theory = buildTheoryLeaderboard(store);
  assert.equal(theory[0].username, "u2");
  assert.equal(theory[1].username, "u1");

  finishSimulationSession(store, u1, "A", [], 90);
  finishSimulationSession(store, u2, "A", ["red_light_crossed"], 80);

  const simulation = buildSimulationLeaderboard(store);
  assert.equal(simulation[0].username, "u1");
  assert.equal(simulation[0].critical_fail, false);
  assert.equal(simulation[1].username, "u2");
  assert.equal(simulation[1].critical_fail, true);
});

test("user can rank high in one board and low in the other", () => {
  const store = createStore();
  const theoryTop = createAuthedUser(store, "theory_top", "theory_top@test.com");
  const simTop = createAuthedUser(store, "sim_top", "sim_top@test.com");

  submitTheory(store, theoryTop, "perfect", 500);
  submitTheory(store, simTop, "weak", 500);

  finishSimulationSession(store, theoryTop, "A", ["red_light_crossed"], 100);
  finishSimulationSession(store, simTop, "A", [], 100);

  const theory = buildTheoryLeaderboard(store);
  const simulation = buildSimulationLeaderboard(store);

  assert.equal(theory[0].username, "theory_top");
  assert.equal(simulation[0].username, "sim_top");
});

test("profile exposes separate best scores and histories", () => {
  const store = createStore();
  const user = createAuthedUser(store, "profile_user", "profile@test.com");

  submitTheory(store, user, "perfect", 500);
  finishSimulationSession(store, user, "A", ["speed_over_limit"], 120);

  const profile = buildUserProfile(store, user.user_id);

  assert.ok(typeof profile.bestTheoryScore === "number");
  assert.ok(typeof profile.bestSimulationScore === "number");
  assert.ok(Array.isArray(profile.theoryHistory));
  assert.ok(Array.isArray(profile.simulationHistory));
  assert.ok(!Object.hasOwn(profile, "combinedScore"));
});

test("first registered user becomes creator, and publishing is creator-only", () => {
  const store = createStore();
  const creator = createAuthedUser(store, "creator", "creator@test.com");
  const player = createAuthedUser(store, "player", "player@test.com");

  assert.equal(creator.is_creator, true);
  assert.equal(player.is_creator, false);

  const denied = publishRouteMap(store, player, {
    route_id: "A",
    name: "A custom",
    route: store.routes.A,
  });
  assert.equal(denied.status, 403);
});

test("published route is the global route used by new simulation sessions", () => {
  const store = createStore();
  const creator = createAuthedUser(store, "creator2", "creator2@test.com");
  const player = createAuthedUser(store, "player2", "player2@test.com");

  const customRouteA = JSON.parse(JSON.stringify(store.routes.A));
  customRouteA.startPose = { x: 321, y: -77, headingDeg: 123 };
  customRouteA.path = [
    { x: 321, y: -77 },
    { x: 336, y: -77 },
    { x: 350, y: -70 },
  ];
  customRouteA.checkpoints = [
    {
      id: "A_TL_CUSTOM",
      type: "traffic_light",
      x: 336,
      y: -77,
      meta: { mustStopOnRed: true, facing: "with_path" },
    },
    {
      id: "A_SL_CUSTOM",
      type: "stop_line",
      x: 333,
      y: -77,
      meta: { lane: 1, laneCount: 2, lineWidthM: 0.26, trafficLightId: "A_TL_CUSTOM" },
    },
  ];

  const published = publishRouteMap(store, creator, {
    route_id: "A",
    name: "Global Route A",
    route: customRouteA,
  });

  assert.equal(published.status, 201);

  const started = startSimSession(store, player, { route_id: "A" });
  assert.equal(started.status, 201);
  assert.equal(started.data.route.startPose.x, 321);
  assert.equal(started.data.route.startPose.headingDeg, 123);
  assert.equal(started.data.route.path.length, 3);
  assert.equal(started.data.route.checkpoints[0].id, "A_TL_CUSTOM");
});

test("saved maps can be listed and activated globally without republishing", () => {
  const store = createStore();
  const creator = createAuthedUser(store, "creator3", "creator3@test.com");
  const player = createAuthedUser(store, "player3", "player3@test.com");

  const customRouteA = JSON.parse(JSON.stringify(store.routes.A));
  customRouteA.startPose = { x: 777, y: -40, headingDeg: 95 };
  customRouteA.path = [
    { x: 777, y: -40 },
    { x: 790, y: -40 },
    { x: 806, y: -33 },
  ];
  customRouteA.checkpoints = [
    {
      id: "A_TL_DRAFT",
      type: "traffic_light",
      x: 790,
      y: -40,
      meta: { mustStopOnRed: true, facing: "with_path" },
    },
    {
      id: "A_SL_DRAFT",
      type: "stop_line",
      x: 786,
      y: -40,
      meta: { lane: 1, laneCount: 2, lineWidthM: 0.26, trafficLightId: "A_TL_DRAFT" },
    },
  ];

  const saved = saveRouteMap(store, creator, {
    route_id: "A",
    name: "Route A Draft",
    route: customRouteA,
  });
  assert.equal(saved.status, 201);

  const listedBeforeActivation = listRouteMaps(store, creator, { route_id: "A", q: "Draft" });
  assert.equal(listedBeforeActivation.status, 200);
  assert.ok(listedBeforeActivation.data.maps.length >= 1);
  const savedRow = listedBeforeActivation.data.maps.find((row) => row.map_id === saved.data.map.map_id);
  assert.ok(savedRow);
  assert.equal(savedRow.is_active, false);

  const activated = activateRouteMap(store, creator, {
    route_id: "A",
    map_id: saved.data.map.map_id,
  });
  assert.equal(activated.status, 200);
  assert.equal(activated.data.activated, true);

  const listedAfterActivation = listRouteMaps(store, creator, { route_id: "A", q: "Draft" });
  const activeRow = listedAfterActivation.data.maps.find((row) => row.map_id === saved.data.map.map_id);
  assert.ok(activeRow);
  assert.equal(activeRow.is_active, true);

  const started = startSimSession(store, player, { route_id: "A" });
  assert.equal(started.status, 201);
  assert.equal(started.data.route.startPose.x, 777);
  assert.equal(started.data.route.checkpoints[0].id, "A_TL_DRAFT");
});

test("sim active sessions keep at most one active session per user", () => {
  const store = createStore();
  const user = createAuthedUser(store, "active_one", "active_one@test.com");

  const first = startSimSession(store, user, { route_id: "A" });
  const second = startSimSession(store, user, { route_id: "A" });

  assert.equal(first.status, 201);
  assert.equal(second.status, 201);
  assert.equal(store.simActiveSessions.size, 1);
  assert.ok(!store.simActiveSessions.has(first.data.session_id));
  assert.ok(store.simActiveSessions.has(second.data.session_id));
});

test("stale sim active sessions are cleanup-able", () => {
  const store = createStore();
  const user = createAuthedUser(store, "active_cleanup", "active_cleanup@test.com");
  const started = startSimSession(store, user, { route_id: "A" });
  assert.equal(started.status, 201);

  const session = store.simActiveSessions.get(started.data.session_id);
  assert.ok(session);
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  session.last_seen_at = tenMinutesAgo;
  session.started_at = tenMinutesAgo;

  const cleanup = cleanupSimActiveSessions(store, 300);
  assert.equal(cleanup.status, 200);
  assert.equal(cleanup.data.removed, 1);
  assert.equal(store.simActiveSessions.size, 0);
});

test("assisted route maps can be saved and loaded per user + route", () => {
  const store = createStore();
  const userA = createAuthedUser(store, "assist_a", "assist_a@test.com");
  const userB = createAuthedUser(store, "assist_b", "assist_b@test.com");

  const payload = {
    assisted_route: {
      version: 1,
      route_id: "A",
      total_arc_m: 42.5,
      path: [
        { x: 1, y: 1, move: true },
        { x: 4, y: 1, move: false },
        { x: 7, y: 2, move: false },
      ],
      arrows: [
        { x: 4, y: 1, arc_m: 3, heading_deg: 0, pass_index: 1, lane_key: "0:1", overlap_key: "0:1|5:1", lateral_offset_m: 0 },
        { x: 7, y: 2, arc_m: 6.3, heading_deg: 15, pass_index: 2, lane_key: "1:1", overlap_key: "1:1|10:3", lateral_offset_m: 0.34 },
      ],
    },
  };

  const savedA = saveAssistedRouteMap(store, userA, "A", payload);
  assert.equal(savedA.status, 201);
  assert.equal(savedA.data.assisted_route.route_id, "A");
  assert.equal(savedA.data.assisted_route.arrows.length, 2);

  const loadedA = getAssistedRouteMap(store, userA, "A");
  assert.equal(loadedA.status, 200);
  assert.equal(loadedA.data.assisted_route.total_arc_m, 42.5);

  const notFoundOtherUser = getAssistedRouteMap(store, userB, "A");
  assert.equal(notFoundOtherUser.status, 404);

  const updated = saveAssistedRouteMap(store, userA, "A", {
    assisted_route: {
      ...payload.assisted_route,
      total_arc_m: 55.2,
    },
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.assisted_route.total_arc_m, 55.2);
});
