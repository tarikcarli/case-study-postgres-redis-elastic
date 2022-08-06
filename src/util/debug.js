const debug = require("debug");

const log = debug("cs");
const debugLog = log.extend("debug");
const infoLog = log.extend("info");
const warnLog = log.extend("warn");
const errLog = log.extend("error");
const pgLog = log.extend("pg");
const httpLog = log.extend("http");

module.exports = {
  log,
  infoLog,
  warnLog,
  errLog,
  debugLog,
  pgLog,
  httpLog,
};
