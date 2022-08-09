const { getItemFromCache, addItemToCache, deleteItemByPatternFromCache } = require("../adapter/cache_database");
const { searchItemFromSearchDatabase } = require("../adapter/search_database");
const { queryDatabase } = require("../adapter/database");
const { errLog } = require("../util/debug");
const { sendResponse } = require("../util/sendResponse");

/** @type {import("express").Handler} */
async function listProduct(req, res) {
  const { limit = 10, offset = 0 } = req.query;
  let list;
  let count;
  const redisResult = await getItemFromCache(`product:${limit}:${offset}`);
  if (redisResult == null) {
    await Promise.all([
      (async () => {
        const { rows } = await queryDatabase({
          sql: "SELECT * FROM product WHERE deletion_time IS NULL ORDER BY idx LIMIT $1 OFFSET $2;",
          parameters: [limit, offset],
        });
        list = rows;
      })(),
      (async () => {
        const {
          rows: [{ pcount }],
        } = await queryDatabase({ sql: "SELECT count(*) pcount FROM product WHERE deletion_time IS NULL;" });
        count = pcount;
      })(),
    ]);
    addItemToCache(`product:${limit}:${offset}`, JSON.stringify({ count, list }));
  }
  sendResponse({ req, res, responseData: redisResult == null ? { count, list } : redisResult });
}

/** @type {import("express").Handler} */
async function addProduct(req, res) {
  const { categoryIdx, name } = req.body;
  await queryDatabase({ sql: "INSERT INTO product(category_idx,name) VALUES ($1,$2);", parameters: [categoryIdx, name] });
  await deleteItemByPatternFromCache("product:*");
  sendResponse({ req, res });
}

/** @type {import("express").Handler} */
async function updateProduct(req, res) {
  const { idx, name, categoryIdx } = req.body;
  await queryDatabase({ sql: "UPDATE product SET category_idx=$1, name = $2 WHERE idx = $3", parameters: [categoryIdx, name, idx] });
  await queryDatabase({ sql: "INSERT INTO product_updated_idx(product_idx) VALUES($1);", parameters: [idx] });
  await deleteItemByPatternFromCache("product:*");
  sendResponse({ req, res });
}

/** @type {import("express").Handler} */
async function deleteProduct(req, res) {
  const { idx } = req.query;
  await queryDatabase({ sql: "UPDATE product SET deletion_time=now() WHERE idx=$1;", parameters: [idx] });
  await deleteItemByPatternFromCache("product:*");
  sendResponse({ req, res });
}

/** @type {import("express").Handler} */
async function searchProduct(req, res) {
  const { name, limit = 10, offset = 0 } = req.query;
  let count;
  let list;
  if (typeof name !== "string") throw new Error(`unsupported type name: ${typeof name}`);
  try {
    // @ts-ignore
    const { count: ecount, list: elasticIdxes } = await searchItemFromSearchDatabase("product", name, limit, offset);
    const { rows } = await queryDatabase({ sql: "SELECT * FROM product where elastic_idx = ANY($1)", parameters: [elasticIdxes] });
    count = ecount;
    list = rows;
  } catch (err) {
    errLog(`elastic not working err: ${err}`);
    await Promise.all([
      (async () => {
        const { rows } = await queryDatabase({
          sql: `
SELECT * FROM product WHERE name % $1::text AND deletion_time IS NULL
ORDER BY SIMILARITY(name,$1::text) DESC LIMIT $2 OFFSET $3;`,
          parameters: [name, limit, offset],
        });
        list = rows;
      })(),
      (async () => {
        const {
          rows: [{ qcount }],
        } = await queryDatabase({
          sql: `
SELECT count(*) qcount FROM product WHERE name % $1::text AND deletion_time IS NULL`,
          parameters: [name],
        });
        count = qcount;
      })(),
    ]);
  }
  sendResponse({ req, res, responseData: { count, list } });
}

module.exports = {
  listProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProduct,
};
