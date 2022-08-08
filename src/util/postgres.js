const { Pool } = require("pg");
const format = require("pg-format");
const { DB_HOST, DB_PORT, DB_PASSWORD, DB_USERNAME, DB_DATABASE } = require("./config");
const { pgLog, errLog } = require("./debug");

/** @type {import("pg").Pool} */
let pool;
let postgresIntervalId;
// @ts-ignore
async function connectPostgres(tryCount = 0) {
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
      pgLog(`psClientErr: ${err.message}`);
    });
    pool.on("connect", (client) => {
      pgLog(`pool connect another client`);
      client.on("notice", (payload) => pgLog(`notice: ${payload.message}`));
    });
    clearInterval(postgresIntervalId);
    (await pool.connect()).release();
    postgresIntervalId = setInterval(async () => {
      try {
        await pQuery({ sql: "SELECT 1;" });
      } catch (err) {
        errLog(`cannot ping postgres err: ${err.message}`);
        connectPostgres();
      }
    }, 3000);
  } catch (err) {
    errLog(`connectPostgresErr: ${err.message} ${tryCount}`);
    setTimeout(() => connectPostgres(++tryCount), 3000);
  }
}

async function disconnectPostgres() {
  pgLog("disconnectPostgres");
  try {
    await pool.end();
  } catch (err) {
    pgLog(`disconnectPostgresErr: ${err.message}`);
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
async function pQuery({ client, sql, identifiers, parameters }) {
  pgLog("pQuery %o", { client: !!client, sql, identifiers, parameters });
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
async function pQueryTx(txFunc) {
  pgLog("pQueryTx %o", { txFunc: !!txFunc });
  /** @type {import("pg").PoolClient} */
  let client;
  try {
    client = await pool.connect();
    await pQuery({ client, sql: "BEGIN;" });
    const txResult = await txFunc(client);
    await pQuery({ client, sql: "COMMIT;" });
    return txResult;
  } catch (err) {
    // @ts-ignore
    if (client != null) {
      try {
        await pQuery({ client, sql: "ROLLBACK;" });
      } catch (err) {
        errLog(`pQueryTxCatchErr: ${err.message}`);
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
  connectPostgres,
  disconnectPostgres,
  pQuery,
  pQueryTx,
};
