const { Client } = require("@elastic/elasticsearch");
const { ELASTIC_HOST, ELASTIC_PORT } = require("./config");
const { errLog } = require("./debug");

/** @type {import("@elastic/elasticsearch").Client} */
let elastic;

async function connectElastic(tryCount = 1) {
  try {
    elastic = new Client({
      nodes: [`http://${ELASTIC_HOST}:${ELASTIC_PORT}`],
    });
    await elastic.ping();
  } catch (err) {
    errLog(`connectElasticErr: ${err.message} ${tryCount}`);
    if (tryCount === 10) {
      process.exit(1);
    } else {
      setTimeout(() => connectElastic(++tryCount), 3000);
    }
  }
}

async function disconnectElastic() {
  await elastic.close();
}
/** @type {(index:string,document:object) => Promise<string>} */
async function addElastic(index, document) {
  const { _id, result } = await elastic.index({ index, document });
  if (result !== "created") {
    throw new Error(`unsuccessful result:${result}`);
  }
  return _id;
}
/** @type {(index:string, id:string,doc:object) => Promise<string>} */
async function updateElastic(index, id, doc) {
  const { _id, result } = await elastic.update({ index, id, doc });
  if (result !== "updated") {
    throw new Error(`unsuccessful result:${result}`);
  }
  return _id;
}

/** @type {(index:string, id:string) => Promise<string>} */
async function deleteElastic(index, id) {
  const { _id, result } = await elastic.delete({ index, id });
  if (result !== "deleted") {
    throw new Error(`unsuccessful result:${result}`);
  }
  return _id;
}

/** @type {(index:string, name:string) => Promise<{count:number,list:string[]}>} */
async function searchElastic(index, name, limit = 10, offset = 0) {
  let count;
  let list;
  await Promise.all([
    (async () => {
      const res = await elastic.count({
        index,
        query: { fuzzy: { name } },
      });
      count = res.count;
    })(),
    (async () => {
      const res = await elastic.search({
        index,
        from: offset,
        size: limit,
        query: { fuzzy: { name } },
      });
      list = res.hits.hits.map((e) => e._id);
    })(),
  ]);

  // @ts-ignore
  return { count, list };
}

module.exports = { connectElastic, disconnectElastic, addElastic, updateElastic, deleteElastic, searchElastic };
