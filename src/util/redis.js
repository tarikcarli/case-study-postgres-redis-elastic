const { createClient } = require("redis");
const { errLog } = require("./debug");

/** @type {import("redis").RedisClientType} */
let client;

// (async () => {
//   await connectRedis();
//   let res;
//   res = await addRedis("tarik", "carli");
//   console.log(res);
//   res = await getRedis("tarik");
//   console.log(res);
//   res = await deleteRedis("tarik");
//   console.log(res, typeof res);
// })();

/** @type {() => Promise<void>} */
async function connectRedis(tryCount = 1) {
  try {
    client = createClient();
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

/** @type {(keyPattern:string) => Promise<string[]>} */
async function getKeyRedis(keyPattern) {
  const res = await client.keys(keyPattern);
  return res;
}
module.exports = {
  connectRedis,
  disconnectRedis,
  addRedis,
  getRedis,
  deleteRedis,
  getKeyRedis,
};
