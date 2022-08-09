const { createClient } = require("redis");
const { CACHE_HOST, CACHE_PORT } = require("../util/config");
const { errLog } = require("../util/debug");

/** @type {import("redis").RedisClientType} */
let client;
/** @type {() => Promise<void>} */
async function connectCache(tryCount = 1) {
  try {
    client = createClient({ url: `redis://${CACHE_HOST}:${CACHE_PORT}/`, disableOfflineQueue: true });
    client.on("error", (err) => {
      errLog(`cache error listeners err: ${err.message}`);
    });
    await client.connect();
  } catch (err) {
    errLog(`connectCache err: ${err.message} ${tryCount}`);
    setTimeout(() => connectCache(++tryCount), 3000);
  }
}

/** @type {() => Promise<void>} */
async function disconnectCache() {
  try {
    await client.quit();
  } catch (err) {
    errLog(`disconnectCache err: ${err.message}`);
  }
}

/** @type {(key:string,value:string) => Promise<void>} */
async function addItemToCache(key, value) {
  try {
    await client.set(key, value);
  } catch (err) {
    errLog(`addItemToCache err: ${err.message}`);
  }
}
/** @type {(key:string) => Promise<string | null>} */
async function getItemFromCache(key) {
  try {
    const res = await client.get(key);
    return res;
  } catch (err) {
    errLog(`getItemFromCache err: ${err.message}`);
  }
  return null;
}
/** @type {(key:string) => Promise<void>} */
async function deleteItemFromCache(key) {
  try {
    await client.del(key);
  } catch (err) {
    errLog(`deleteItemFromCache err: ${err.message}`);
  }
}

/** @type {(keyPattern:string) => Promise<void>} */
async function deleteItemByPatternFromCache(keyPattern) {
  try {
    await client.eval(`for _,k in ipairs(redis.call('keys','${keyPattern}')) do redis.call('del',k) end`);
  } catch (err) {
    errLog(`deleteItemByPatternFromCache err: ${err.message}`);
  }
}

module.exports = {
  connectCache,
  disconnectCache,
  addItemToCache,
  getItemFromCache,
  deleteItemFromCache,
  deleteItemByPatternFromCache,
};
