const { INTERVAL_DURATION_IN_MS } = require("../util/config");
const { errLog } = require("../util/debug");
const { pQuery } = require("../util/postgres");
const { randomInterval } = require("../util/randomInterval");

async function removeFromPostgres() {
  try {
    await pQuery({
      sql: `
DELETE FROM category WHERE idx IN(
  SELECT idx FROM category WHERE elastic_idx IS NULL AND deletion_time IS NOT NULL ORDER BY idx LIMIT 100);`,
    });
    await pQuery({
      sql: `
DELETE FROM product WHERE idx IN(
  SELECT idx FROM product WHERE elastic_idx IS NULL AND deletion_time IS NOT NULL ORDER BY idx LIMIT 100);`,
    });
  } catch (err) {
    errLog(`removeFromPostgresErr:${err.message}`);
  } finally {
    setTimeout(removeFromPostgres, randomInterval(INTERVAL_DURATION_IN_MS));
  }
}

module.exports = {
  removeFromPostgres,
};
