import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createStore } from "./lib/store.js";
import { sendJson, sendText, readJsonBody, getPathParts } from "./lib/http.js";
import { registerUser, loginUser, authenticate } from "./lib/auth.js";
import { createExamAttempt, submitExamAttempt, updateExamConfig } from "./lib/exam.js";
import { startSimSession, appendSimEvents, finishSimSession, abandonSimSession, cleanupSimActiveSessions } from "./lib/sim.js";
import {
  publishRouteMap,
  saveRouteMap,
  activateRouteMap,
  listRouteMaps,
  getRouteMap,
  getActiveRoutePayload,
  getAllActiveRoutesPayload,
} from "./lib/maps.js";
import { getAssistedRouteMap, saveAssistedRouteMap, listAssistedRouteMaps } from "./lib/assisted.js";
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

function murfAudioUrlFromPayload(payload) {
  const candidates = [
    payload?.audio_file,
    payload?.audioFile,
    payload?.audio_url,
    payload?.audioUrl,
    payload?.data?.audio_file,
    payload?.data?.audioFile,
    payload?.data?.audio_url,
    payload?.result?.audio_file,
    payload?.result?.audioFile,
    payload?.result?.audio_url,
    payload?.results?.[0]?.audio_file,
    payload?.results?.[0]?.audioFile,
    payload?.outputs?.[0]?.audio_file,
    payload?.outputs?.[0]?.audio_url,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

async function murfGenerateOnce(endpoint, apiKey, body) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
  const raw = await response.text();
  let payload = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = {};
  }
  return { response, payload, raw };
}

async function generateMurfVeedorSpeech(text) {
  const apiKey = String(process.env.MURF_API_KEY || "").trim();
  if (!apiKey) {
    const err = new Error("Murf TTS is not configured.");
    err.details = { status: 0, providerResponse: "MURF_API_KEY missing" };
    throw err;
  }
  const endpoint = String(process.env.MURF_TTS_URL || "https://api.murf.ai/v1/speech/generate").trim();
  const voiceId = String(process.env.MURF_VOICE_ID || "Freddie").trim() || "Freddie";
  const style = String(process.env.MURF_STYLE || "Narration").trim() || "Narration";
  const model = String(process.env.MURF_MODEL || "Gen2").trim() || "Gen2";
  const multiNativeLocale = String(process.env.MURF_MULTI_NATIVE_LOCALE || "es-MX").trim() || "es-MX";
  const locale = String(process.env.MURF_LOCALE || multiNativeLocale).trim() || "es-MX";

  const bodyPrimary = {
    text,
    voiceId,
    style,
    modelVersion: model,
    locale,
    multiNativeLocale,
  };
  const bodyFallback = {
    text,
    voiceId,
    style,
    modelVersion: model,
  };
  const attempts = [bodyPrimary, bodyFallback];
  let lastDetails = {
    status: 0,
    providerResponse: "No response from Murf.",
    attemptKeys: [],
  };
  for (const body of attempts) {
    const { response, payload, raw } = await murfGenerateOnce(endpoint, apiKey, body);
    if (response.ok) {
      const audioUrl = murfAudioUrlFromPayload(payload);
      if (audioUrl) {
        return audioUrl;
      }
      lastDetails = {
        status: response.status,
        providerResponse: `Murf response missing audio URL. Raw: ${(raw || "").slice(0, 260)}`,
        attemptKeys: Object.keys(body),
      };
      continue;
    }
    lastDetails = {
      status: response.status,
      providerResponse:
        payload?.error?.message ||
        payload?.error ||
        payload?.message ||
        (raw ? raw.slice(0, 260) : `HTTP ${response.status}`),
      attemptKeys: Object.keys(body),
    };
  }
  const err = new Error(`Murf TTS request failed: ${lastDetails.providerResponse}`);
  err.details = lastDetails;
  throw err;
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
        const rawKeepAliveSec = Number(process.env.SIM_KEEPALIVE_INTERVAL_SEC || 30);
        const simKeepAliveIntervalSec =
          Number.isFinite(rawKeepAliveSec) && rawKeepAliveSec > 0 ? Math.max(5, rawKeepAliveSec) : 30;
        const rawIdleTimeoutSec = Number(process.env.SIM_INPUT_IDLE_TIMEOUT_SEC || 900);
        const simInputIdleTimeoutSec =
          Number.isFinite(rawIdleTimeoutSec) && rawIdleTimeoutSec > 0 ? Math.max(60, rawIdleTimeoutSec) : 900;
        const rawPeerTtlSec = Number(process.env.MULTIPLAYER_PEER_TTL_SEC || simInputIdleTimeoutSec);
        const multiplayerPeerTtlSec =
          Number.isFinite(rawPeerTtlSec) && rawPeerTtlSec > 0 ? Math.max(5, rawPeerTtlSec) : simInputIdleTimeoutSec;
        const rawCollisionStaleSec = Number(process.env.MULTIPLAYER_COLLISION_STALE_SEC || 10);
        const multiplayerCollisionStaleSec =
          Number.isFinite(rawCollisionStaleSec) && rawCollisionStaleSec > 0
            ? Math.max(1, Math.min(multiplayerPeerTtlSec, rawCollisionStaleSec))
            : Math.min(multiplayerPeerTtlSec, 10);
        const rawHiddenAfkSec = Number(process.env.MULTIPLAYER_TAB_HIDDEN_AFK_SEC || 10);
        const multiplayerTabHiddenAfkSec =
          Number.isFinite(rawHiddenAfkSec) && rawHiddenAfkSec > 0
            ? Math.max(1, Math.min(multiplayerPeerTtlSec, rawHiddenAfkSec))
            : Math.min(multiplayerPeerTtlSec, 10);
        const rawInputIdleAfkSec = Number(process.env.MULTIPLAYER_INPUT_IDLE_AFK_SEC || 180);
        const multiplayerInputIdleAfkSec =
          Number.isFinite(rawInputIdleAfkSec) && rawInputIdleAfkSec > 0
            ? Math.max(10, Math.min(simInputIdleTimeoutSec, rawInputIdleAfkSec))
            : Math.min(simInputIdleTimeoutSec, 180);
        sendJson(res, 200, {
          enabled: Boolean(url && anonKey),
          url,
          anon_key: anonKey,
          sim_keepalive_interval_sec: simKeepAliveIntervalSec,
          sim_input_idle_timeout_sec: simInputIdleTimeoutSec,
          multiplayer_peer_ttl_sec: multiplayerPeerTtlSec,
          multiplayer_collision_stale_sec: multiplayerCollisionStaleSec,
          multiplayer_tab_hidden_afk_sec: multiplayerTabHiddenAfkSec,
          multiplayer_input_idle_afk_sec: multiplayerInputIdleAfkSec,
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

      if (req.method === "POST" && reqUrl.pathname === "/v1/speech/veedor") {
        const payload = await readJsonBody(req);
        const text = String(payload?.text || "").trim();
        if (!text) {
          sendJson(res, 400, { error: "text is required" });
          return;
        }
        if (!process.env.MURF_API_KEY) {
          sendJson(res, 503, { error: "murf tts not configured" });
          return;
        }
        try {
          const audioUrl = await generateMurfVeedorSpeech(text.slice(0, 260));
          sendJson(res, 200, { audio_url: audioUrl });
          return;
        } catch (error) {
          const message = error instanceof Error ? error.message : "murf tts failed";
          const details = error?.details || {};
          sendJson(res, 502, {
            error: message,
            provider_status: Number(details.status) || 0,
            provider_response: String(details.providerResponse || "").slice(0, 320),
            attempt_keys: Array.isArray(details.attemptKeys) ? details.attemptKeys : [],
          });
          return;
        }
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

      if (
        req.method === "GET" &&
        parts[1] === "assist" &&
        parts[2] === "routes" &&
        !parts[3]
      ) {
        const query = Object.fromEntries(reqUrl.searchParams.entries());
        const result = supabaseService
          ? await supabaseService.listAssistedRouteMaps(user, query)
          : listAssistedRouteMaps(store, user, query);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (
        req.method === "GET" &&
        parts[1] === "assist" &&
        parts[2] === "routes" &&
        parts[3]
      ) {
        const routeId = decodeURIComponent(parts[3]);
        const result = supabaseService
          ? await supabaseService.getAssistedRouteMap(user, routeId)
          : getAssistedRouteMap(store, user, routeId);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (
        req.method === "PUT" &&
        parts[1] === "assist" &&
        parts[2] === "routes" &&
        parts[3]
      ) {
        const routeId = decodeURIComponent(parts[3]);
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.saveAssistedRouteMap(user, routeId, payload)
          : saveAssistedRouteMap(store, user, routeId, payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "GET" && reqUrl.pathname === "/v1/maps") {
        const query = Object.fromEntries(reqUrl.searchParams.entries());
        const result = supabaseService
          ? await supabaseService.listRouteMaps(user, query)
          : listRouteMaps(store, user, query);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "GET" && parts[1] === "maps" && parts[2]) {
        const mapId = decodeURIComponent(parts[2]);
        const result = supabaseService
          ? await supabaseService.getRouteMap(user, mapId)
          : getRouteMap(store, user, mapId);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/maps/save") {
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.saveRouteMap(user, payload)
          : saveRouteMap(store, user, payload);
        if (result.error) {
          sendJson(res, result.status, { error: result.error });
          return;
        }
        sendJson(res, result.status, result.data);
        return;
      }

      if (req.method === "POST" && reqUrl.pathname === "/v1/maps/activate") {
        const payload = await readJsonBody(req);
        const result = supabaseService
          ? await supabaseService.activateRouteMap(user, payload)
          : activateRouteMap(store, user, payload);
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

      if (
        req.method === "POST" &&
        parts[1] === "sim" &&
        parts[2] === "sessions" &&
        parts[3] &&
        parts[4] === "abandon"
      ) {
        const result = supabaseService
          ? await supabaseService.abandonSimSession(user, parts[3])
          : abandonSimSession(store, user, parts[3]);
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
