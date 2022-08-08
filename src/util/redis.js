const { createClient } = require("redis");
const { REDIS_HOST, REDIS_PORT } = require("./config");
const { errLog } = require("./debug");

/** @type {import("redis").RedisClientType} */
let client;
/** @type {() => Promise<void>} */
async function connectRedis(tryCount = 1) {
  try {
    client = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}/`, disableOfflineQueue: true });
    client.on("error", (err) => {
      errLog(`redis error listeners err: ${err.message}`);
    });
    await client.connect();
  } catch (err) {
    errLog(`connectRedisErr: ${err.message} ${tryCount}`);
    setTimeout(() => connectRedis(++tryCount), 3000);
  }
}

/** @type {() => Promise<void>} */
async function disconnectRedis() {
  try {
    await client.quit();
  } catch (err) {
    errLog(`redis can not quit err: ${err.message}`);
  }
}

/** @type {(key:string,value:string) => Promise<void>} */
async function addRedis(key, value) {
  try {
    await client.set(key, value);
  } catch (err) {
    errLog(`redis not working addRedis err: ${err.message}`);
  }
}
/** @type {(key:string) => Promise<string | null>} */
async function getRedis(key) {
  try {
    const res = await client.get(key);
    return res;
  } catch (err) {
    errLog(`redis not working getRedis err: ${err.message}`);
  }
  return null;
}
/** @type {(key:string) => Promise<void>} */
async function deleteRedis(key) {
  try {
    await client.del(key);
  } catch (err) {
    errLog(`redis not working deleteRedis err: ${err.message}`);
  }
}

/** @type {(keyPattern:string) => Promise<void>} */
async function deleteRedisByPattern(keyPattern) {
  try {
    await client.eval(`for _,k in ipairs(redis.call('keys','${keyPattern}')) do redis.call('del',k) end`);
  } catch (err) {
    errLog(`redis not working deleteRedisByPattern err: ${err.message}`);
  }
}

module.exports = {
  connectRedis,
  disconnectRedis,
  addRedis,
  getRedis,
  deleteRedis,
  deleteRedisByPattern,
};
