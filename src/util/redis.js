const { createClient } = require("redis");
const { REDIS_HOST, REDIS_PORT } = require("./config");
const { errLog } = require("./debug");

/** @type {import("redis").RedisClientType} */
let client;

/** @type {() => Promise<void>} */
async function connectRedis(tryCount = 1) {
  try {
    client = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}/` });
    await client.connect();
    client.on("error", (err) => console.log("Redis Client Error", err));
  } catch (err) {
    errLog(`connectRedisErr: ${err.message} ${tryCount}`);
    if (tryCount === 10) {
      process.exit(1);
    } else {
      setTimeout(() => connectRedis(++tryCount), 3000);
    }
  }
}

/** @type {() => Promise<void>} */
async function disconnectRedis() {
  await client.disconnect();
}

/** @type {(key:string,value:string) => Promise<string>} */
async function addRedis(key, value) {
  const res = await client.set(key, value);
  if (res !== "OK") {
    throw new Error(`addRedis unsuccessful response: ${res}`);
  }
  return res;
}
/** @type {(key:string) => Promise<string | null>} */
async function getRedis(key) {
  const res = await client.get(key);
  return res;
}
/** @type {(key:string) => Promise<number>} */
async function deleteRedis(key) {
  const res = await client.del(key);
  if (!(res === 1 || res === 0)) {
    throw new Error(`addRedis unsuccessful response: ${res}`);
  }
  return res;
}

/** @type {(keyPattern:string) => Promise<void>} */
async function deleteRedisByPattern(keyPattern) {
  await client.eval(`for _,k in ipairs(redis.call('keys','${keyPattern}')) do redis.call('del',k) end`);
}
module.exports = {
  connectRedis,
  disconnectRedis,
  addRedis,
  getRedis,
  deleteRedis,
  deleteRedisByPattern,
};
