import test from "node:test";
import assert from "node:assert/strict";

import { createStore } from "../src/lib/store.js";
import { registerUser } from "../src/lib/auth.js";
import { createExamAttempt, submitExamAttempt } from "../src/lib/exam.js";
import { startSimSession, appendSimEvents, finishSimSession } from "../src/lib/sim.js";
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
