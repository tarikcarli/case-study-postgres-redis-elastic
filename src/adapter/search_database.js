const { Client } = require("@elastic/elasticsearch");
const { SEARCH_DATABASE_HOST, SEARCH_DATABASE_PORT } = require("../util/config");
const { errLog } = require("../util/debug");

/** @type {import("@elastic/elasticsearch").Client} */
let elastic;
let elasticIntervalId;
async function connectSearchDatabase(tryCount = 1) {
  try {
    elastic = new Client({
      nodes: [`http://${SEARCH_DATABASE_HOST}:${SEARCH_DATABASE_PORT}`],
    });
    clearInterval(elasticIntervalId);
    await elastic.ping();
    elasticIntervalId = setInterval(async () => {
      try {
        await elastic.ping();
      } catch (err) {
        errLog(`cannot ping search database err: ${err.message}`);
        connectSearchDatabase();
      }
    }, 3000);
  } catch (err) {
    errLog(`connectSearchDatabase err: ${err.message} ${tryCount}`);
    setTimeout(() => connectSearchDatabase(++tryCount), 3000);
  }
}

async function disconnectSearchDatabase() {
  try {
    await elastic.close();
  } catch (err) {
    errLog(`disconnectSearchDatabase err: ${err.message}`);
  }
}
/** @type {(index:string,document:object) => Promise<string>} */
async function addItemToSearchDatabase(index, document) {
  const { _id, result } = await elastic.index({ index, document });
  if (result !== "created") {
    throw new Error(`addItemToSearchDatabase unsuccessful result:${result}`);
  }
  return _id;
}
/** @type {(index:string, id:string,doc:object) => Promise<string>} */
async function updateItemToSearchDatabase(index, id, doc) {
  const { _id, result } = await elastic.update({ index, id, doc });
  if (result !== "updated") {
    throw new Error(`updateItemToSearchDatabase unsuccessful result:${result}`);
  }
  return _id;
}

/** @type {(index:string, id:string) => Promise<string>} */
async function deleteItemFromSearchDatabase(index, id) {
  const { _id, result } = await elastic.delete({ index, id });
  if (result !== "deleted") {
    throw new Error(`deleteItemFromSearchDatabase unsuccessful result:${result}`);
  }
  return _id;
}

/** @type {(index:string, name:string, limit: number, offset: number) => Promise<{count:number,list:string[]}>} */
async function searchItemFromSearchDatabase(index, name, limit = 10, offset = 0) {
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

module.exports = {
  connectSearchDatabase,
  disconnectSearchDatabase,
  addItemToSearchDatabase,
  updateItemToSearchDatabase,
  deleteItemFromSearchDatabase,
  searchItemFromSearchDatabase,
};
