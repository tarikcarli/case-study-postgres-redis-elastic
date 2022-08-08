const { getRedis, addRedis, deleteRedisByPattern } = require("../util/redis");
const { searchElastic } = require("../util/elastic");
const { pQuery } = require("../util/postgres");
const { sendResponse } = require("../util/sendResponse");
const { errLog } = require("../util/debug");

/** @type {import("express").Handler} */
async function listCategory(req, res) {
  const { limit = 10, offset = 0 } = req.query;
  let list;
  let count;
  const redisResult = await getRedis(`category:${limit}:${offset}`);
  if (redisResult == null) {
    await Promise.all([
      (async () => {
        const { rows } = await pQuery({
          sql: "SELECT * FROM category WHERE deletion_time IS NULL ORDER BY idx LIMIT $1 OFFSET $2;",
          parameters: [limit, offset],
        });
        list = rows;
      })(),
      (async () => {
        const {
          rows: [{ pcount }],
        } = await pQuery({ sql: "SELECT count(*) pcount FROM category WHERE deletion_time IS NULL;" });
        count = pcount;
      })(),
    ]);
    addRedis(`category:${limit}:${offset}`, JSON.stringify({ count, list }));
  }
  sendResponse({ req, res, responseData: redisResult == null ? { count, list } : redisResult });
}

/** @type {import("express").Handler} */
async function addCategory(req, res) {
  const { name } = req.body;
  await pQuery({ sql: "INSERT INTO category(name) VALUES ($1);", parameters: [name] });
  await deleteRedisByPattern("category:*");
  sendResponse({ req, res });
}

/** @type {import("express").Handler} */
async function updateCategory(req, res) {
  const { idx, name } = req.body;
  await pQuery({ sql: "UPDATE category SET name = $1 WHERE idx = $2", parameters: [name, idx] });
  await pQuery({ sql: "INSERT INTO category_updated_idx(category_idx) VALUES($1);", parameters: [idx] });
  await deleteRedisByPattern("category:*");
  sendResponse({ req, res });
}

/** @type {import("express").Handler} */
async function deleteCategory(req, res) {
  const { idx } = req.query;
  await pQuery({ sql: "UPDATE category SET deletion_time=now() WHERE idx=$1;", parameters: [idx] });
  await deleteRedisByPattern("category:*");
  sendResponse({ req, res });
}

/** @type {import("express").Handler} */
async function searchCategory(req, res) {
  const { name, limit = 10, offset = 0 } = req.query;
  let count;
  let list;
  if (typeof name !== "string") throw new Error(`unsupported type name: ${typeof name}`);
  try {
    const { count: ecount, list: elasticIdxes } = await searchElastic("category", name, limit, offset);
    const { rows } = await pQuery({ sql: "SELECT * FROM category where elastic_idx = ANY($1)", parameters: [elasticIdxes] });
    count = ecount;
    list = rows;
  } catch (err) {
    errLog(`elastic not working err: ${err}`);
    await Promise.all([
      (async () => {
        const { rows } = await pQuery({
          sql: `
SELECT * FROM category WHERE name % $1::text AND deletion_time IS NULL
ORDER BY SIMILARITY(name,$1::text) DESC LIMIT $2 OFFSET $3;`,
          parameters: [name, limit, offset],
        });
        list = rows;
      })(),
      (async () => {
        const {
          rows: [{ qcount }],
        } = await pQuery({
          sql: `
SELECT count(*) qcount FROM category WHERE name % $1::text AND deletion_time IS NULL`,
          parameters: [name],
        });
        count = qcount;
      })(),
    ]);
  }
  sendResponse({ req, res, responseData: { count, list } });
}

module.exports = {
  listCategory,
  addCategory,
  updateCategory,
  deleteCategory,
  searchCategory,
};
