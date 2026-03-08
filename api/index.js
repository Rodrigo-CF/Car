import { createAppServer } from "../src/server.js";

let cachedServer = null;

function getServer() {
  if (!cachedServer) {
    const { server } = createAppServer();
    cachedServer = server;
  }
  return cachedServer;
}

export default function handler(req, res) {
  const server = getServer();
  server.emit("request", req, res);
}
