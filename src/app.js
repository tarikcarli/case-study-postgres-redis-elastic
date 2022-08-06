const express = require("express");
const { connectPostgres } = require("./util/postgres");
const { connectRedis } = require("./util/redis");
const { connectElastic } = require("./util/elastic");
require("express-async-errors");
const { sendResponse } = require("./util/sendResponse");
const { interval } = require("./interval/interval");
const app = express();

connectPostgres();
connectRedis();
connectElastic();
// interval();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));

app.use("/api", require("./router/router").router);

app.use((err, req, res, next) => {
  sendResponse({ err, req, res, responseStatus: err.status });
});
module.exports = {
  app,
};
