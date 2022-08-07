#!/usr/bin/env node
const http = require("http");
const events = require("events");
const { app } = require("./app");
const { errLog, infoLog } = require("./util/debug");
events.setMaxListeners(1000);
const server = http.createServer(app);

const port = parseInt(process.env.APP_PORT || "4000");

server.listen(port, () => {
  infoLog(`Listening on port: ${port}`);
});

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case "EACCES":
      errLog(`${bind} requires elevated privileges`);
      process.exit(1);
    // eslint-disable-next-line no-fallthrough
    case "EADDRINUSE":
      errLog(`${bind} is already in use`);
      process.exit(1);
    // eslint-disable-next-line no-fallthrough
    default:
      throw error;
  }
}

server.on("error", onError);
