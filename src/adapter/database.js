const { Pool } = require("pg");
const format = require("pg-format");
const { DB_HOST, DB_PORT, DB_PASSWORD, DB_USERNAME, DB_DATABASE } = require("../util/config");
const { pgLog, errLog } = require("../util/debug");

/** @type {import("pg").Pool} */
let pool;
let postgresIntervalId;
// @ts-ignore
async function connectDatabase(tryCount = 0) {
  try {
    pool = new Pool({
      host: DB_HOST,
      password: DB_PASSWORD,
      user: DB_USERNAME,
      database: DB_DATABASE,
      port: Number(DB_PORT),
      application_name: "cs",
    });
    pool.on("error", (err) => {
      pgLog(`connectDatabase error listener err: ${err.message}`);
    });
    pool.on("connect", (client) => {
      pgLog(`connectDatabase connect listener call`);
      client.on("notice", (payload) => pgLog(`connectDatabase notice listener call: ${payload.message}`));
    });
    clearInterval(postgresIntervalId);
    (await pool.connect()).release();
    postgresIntervalId = setInterval(async () => {
      try {
        await queryDatabase({ sql: "SELECT 1;" });
      } catch (err) {
        errLog(`connectDatabase ping err: ${err.message}`);
        connectDatabase();
      }
    }, 3000);
  } catch (err) {
    errLog(`connectDatabase err: ${err.message} ${tryCount}`);
    setTimeout(() => connectDatabase(++tryCount), 3000);
  }
}

async function disconnectDatabase() {
  try {
    await pool.end();
  } catch (err) {
    pgLog(`disconnectDatabase err: ${err.message}`);
  }
}

/**
 * @type {(
 *  first:{
 *    client?:import("pg").PoolClient,
 *    sql:string,identifiers?:any[],
 *    parameters?:any[]
 *  }) => Promise<import("pg").QueryResult<any>>}
 */
async function queryDatabase({ client, sql, identifiers, parameters }) {
  pgLog("queryDatabase %o", { client: !!client, sql, identifiers, parameters });
  let formattedSql;
  if (identifiers && Array.isArray(identifiers) && identifiers.length > 0) {
    formattedSql = format(sql, ...identifiers);
  } else {
    formattedSql = sql;
  }
  pgLog(formattedSql);
  let pRes;
  if (parameters && Array.isArray(parameters) && parameters.length > 0) {
    if (client) {
      pRes = await client.query(formattedSql, parameters);
    } else {
      pRes = await pool.query(formattedSql, parameters);
    }
  } else if (client) {
    pRes = await client.query(formattedSql);
  } else {
    pRes = await pool.query(formattedSql);
  }
  return pRes;
}

/** @type {(txFunc:(client:import("pg").PoolClient) => Promise<any>) => Promise<any>} */
async function queryTxDatabase(txFunc) {
  pgLog("queryTxDatabase %o", { txFunc: !!txFunc });
  /** @type {import("pg").PoolClient} */
  let client;
  try {
    client = await pool.connect();
    await queryDatabase({ client, sql: "BEGIN;" });
    const txResult = await txFunc(client);
    await queryDatabase({ client, sql: "COMMIT;" });
    return txResult;
  } catch (err) {
    // @ts-ignore
    if (client != null) {
      try {
        await queryDatabase({ client, sql: "ROLLBACK;" });
      } catch (err) {
        errLog(`queryTxDatabase err: ${err.message}`);
      }
    }
    throw err;
  } finally {
    // @ts-ignore
    if (client != null) {
      client.release();
    }
  }
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  queryDatabase,
  queryTxDatabase,
};
