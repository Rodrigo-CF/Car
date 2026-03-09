import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createStore } from "./lib/store.js";
import { sendJson, sendText, readJsonBody, getPathParts } from "./lib/http.js";
import { registerUser, loginUser, authenticate } from "./lib/auth.js";
import { createExamAttempt, submitExamAttempt, updateExamConfig } from "./lib/exam.js";
import { startSimSession, appendSimEvents, finishSimSession, cleanupSimActiveSessions } from "./lib/sim.js";
import { publishRouteMap, getActiveRoutePayload, getAllActiveRoutesPayload } from "./lib/maps.js";
import { createSupabaseService } from "./lib/supabase-service.js";
import {
  buildTheoryLeaderboard,
  buildSimulationLeaderboard,
  buildUserProfile,
} from "./lib/leaderboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "../public");

function wantsJson(req) {
  const accept = req.headers.accept || "";
  return accept.includes("application/json");
}

async function serveStatic(req, res, pathname) {
  const target = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${target}`);
  const publicPrefix = `${PUBLIC_DIR}${path.sep}`;

  if (filePath !== PUBLIC_DIR && !filePath.startsWith(publicPrefix)) {
    sendText(res, 403, "Forbidden");
    return true;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType =
      ext === ".html"
        ? "text/html; charset=utf-8"
        : ext === ".js"
          ? "application/javascript; charset=utf-8"
          : ext === ".css"
            ? "text/css; charset=utf-8"
            : "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
    return true;
  } catch {
    return false;
  }
}

export function createAppServer(store = createStore()) {
  const supabaseService = createSupabaseService(store);

  const server = http.createServer(async (req, res) => {
    try {
      const reqUrl = new URL(req.url, "http://localhost");
      const parts = getPathParts(reqUrl);

      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
        });
        res.end();
        return;
      }

      res.setHeader("Access-Control-Allow-Origin", "*");

      if (req.method === "GET" && reqUrl.pathname === "/health") {
        sendJson(res, 200, { ok: true });
        return;
      }

      if (parts[0] !== "v1") {
        const served = await serveStatic(req, res, reqUrl.pathname);
        if (!served) {
          sendText(res, 404, "Not found");
        }
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/auth/register") {
        const payload = await readJsonBody(req);
        const result = supabaseService ? await supabaseService.registerUser(payload) : registerUser(store, payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/auth/login") {
        const payload = await readJsonBody(req);
        const result = supabaseService ? await supabaseService.loginUser(payload) : loginUser(store, payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "GET" && reqUrl.pathname === "/v1/config/exam-rules") {
        sendJson(res, 200, store.examConfig);
        return;
      }

      if (req.method === "GET" && reqUrl.pathname === "/v1/config/realtime") {
        const url = process.env.SUPABASE_URL || "";
        const anonKey = process.env.SUPABASE_ANON_KEY || "";
        sendJson(res, 200, {
          enabled: Boolean(url && anonKey),
          url,
          anon_key: anonKey,
        });
        return;
      }

      if (req.method === "PUT" && reqUrl.pathname === "/v1/admin/config/exam-rules") {
        const payload = await readJsonBody(req);
        const result = updateExamConfig(store, payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "GET" && parts[1] === "sim" && parts[2] === "routes" && parts[3]) {
        const routePayload = supabaseService
          ? await supabaseService.getActiveRoutePayload(parts[3])
          : getActiveRoutePayload(store, parts[3]);
        if (!routePayload?.route) {
          sendJson(res, 404, { error: "route not found" });
          return;
        }
        sendJson(res, 200, routePayload.route);
        return;
      }

      if (req.method === "GET" && reqUrl.pathname === "/v1/maps/active") {
        const payload = supabaseService
          ? await supabaseService.getAllActiveRoutesPayload()
          : getAllActiveRoutesPayload(store);
        sendJson(res, 200, payload);
        return;
      }

      if (req.method === "GET" && parts[1] === "maps" && parts[2] === "active" && parts[3]) {
        const payload = supabaseService
          ? await supabaseService.getActiveRoutePayload(parts[3])
          : getActiveRoutePayload(store, parts[3]);
        if (!payload) {
          sendJson(res, 404, { error: "route not found" });
          return;
        }
        sendJson(res, 200, payload);
        return;
      }

      if (req.method === "GET" && reqUrl.pathname === "/v1/leaderboard/theory") {
        const limit = Number(reqUrl.searchParams.get("limit")) || 50;
        const leaderboard = supabaseService
          ? await supabaseService.buildTheoryLeaderboard(limit)
          : buildTheoryLeaderboard(store, limit);
        sendJson(res, 200, {
          leaderboard,
        });
        return;
      }

      if (req.method === "GET" && reqUrl.pathname === "/v1/leaderboard/simulation") {
        const limit = Number(reqUrl.searchParams.get("limit")) || 50;
        const leaderboard = supabaseService
          ? await supabaseService.buildSimulationLeaderboard(limit)
          : buildSimulationLeaderboard(store, limit);
        sendJson(res, 200, {
          leaderboard,
        });
        return;
      }

      const user = supabaseService ? await supabaseService.authenticate(req) : authenticate(store, req);
      if (!user) {
        sendJson(res, 401, { error: "unauthorized" });
        return;
      }

      if (req.method === "GET" && reqUrl.pathname === "/v1/profile/me") {
        const profile = supabaseService
          ? await supabaseService.buildUserProfile(user.user_id)
          : buildUserProfile(store, user.user_id);
        sendJson(res, 200, {
          user_id: user.user_id,
          username: user.username,
          is_creator: Boolean(user.is_creator),
          ...profile,
        });
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/admin/cleanup/sim-active") {
        if (!user.is_creator) {
          sendJson(res, 403, { error: "creator permissions required" });
          return;
        }
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.cleanupStaleActiveSessions(payload?.ttl_sec)
          : cleanupSimActiveSessions(store, payload?.ttl_sec);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/maps/publish") {
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.publishRouteMap(user, payload)
          : publishRouteMap(store, user, payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/exams/attempts") {
        const data = supabaseService ? await supabaseService.createExamAttempt(user) : createExamAttempt(store, user);
        sendJson(res, 201, data);
        return;
      }

      if (
        req.method === "POST" &&
        parts[1] === "exams" &&
        parts[2] === "attempts" &&
        parts[3] &&
        parts[4] === "submit"
      ) {
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.submitExamAttempt(user, parts[3], payload)
          : submitExamAttempt(store, user, parts[3], payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/sim/sessions/start") {
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.startSimSession(user, payload)
          : startSimSession(store, user, payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (
        req.method === "POST" &&
        parts[1] === "sim" &&
        parts[2] === "sessions" &&
        parts[3] &&
        parts[4] === "events"
      ) {
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.appendSimEvents(user, parts[3], payload)
          : appendSimEvents(store, user, parts[3], payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (
        req.method === "POST" &&
        parts[1] === "sim" &&
        parts[2] === "sessions" &&
        parts[3] &&
        parts[4] === "finish"
      ) {
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.finishSimSession(user, parts[3], payload)
          : finishSimSession(store, user, parts[3], payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (wantsJson(req)) {
        sendJson(res, 404, { error: "not found" });
        return;
      }

      sendText(res, 404, "Not found");
    } catch (error) {
      if (error instanceof Error && error.message === "INVALID_JSON") {
        sendJson(res, 400, { error: "invalid json" });
        return;
      }

      sendJson(res, 500, { error: "internal server error" });
    }
  });

  return { server, store, backendMode: supabaseService ? "supabase" : "memory" };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isMain) {
  const port = Number(process.env.PORT || 3000);
  const { server, backendMode } = createAppServer();
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at http://localhost:${port} (${backendMode} backend)`);
  });
}
