const express = require("express");
const { connectDatabase } = require("./adapter/database");
const { connectCache } = require("./adapter/cache_database");
const { connectSearchDatabase } = require("./adapter/search_database");
require("express-async-errors");
const { sendResponse } = require("./util/sendResponse");
const { interval } = require("./interval/interval");
const { faker } = require("./faker");
const { LOAD_FAKE_DATA } = require("./util/config");
const app = express();

connectDatabase();
connectCache();
connectSearchDatabase();
interval();

LOAD_FAKE_DATA === "true" && setTimeout(faker, 10000);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));

app.use("/api", require("./router/router").router);

app.use((err, req, res, next) => {
  sendResponse({ err, req, res, responseStatus: err.status });
});
module.exports = {
  app,
};
