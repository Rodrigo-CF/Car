import crypto from "node:crypto";

import { buildQuestionBank } from "../data/mock-questions.js";
import { ROUTES } from "../data/mock-routes.js";
import { RULES } from "../data/mock-rules.js";

export function createStore() {
  return {
    creatorUserId: null,
    users: [],
    authTokens: new Map(),
    questionBank: buildQuestionBank(200),
    examDrafts: new Map(),
    examAttempts: [],
    simActiveSessions: new Map(),
    simSessions: [],
    routes: ROUTES,
    maps: [],
    assistedRouteMaps: new Map(),
    activeRouteMaps: {
      A: null,
      B: null,
    },
    rules: RULES,
    examConfig: {
      questionCount: 70,
      timeLimitSec: 3600,
      passThresholdPct: 80,
    },
  };
}

export function generateId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function makeToken() {
  return crypto.randomBytes(24).toString("hex");
}
