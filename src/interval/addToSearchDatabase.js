const { errLog } = require("../util/debug");
const { randomInterval } = require("../util/randomInterval");
const { addItemToSearchDatabase } = require("../adapter/search_database");
const { queryDatabase } = require("../adapter/database");
const { INTERVAL_DURATION_IN_MS } = require("../util/config");

async function addToSearchDatabase() {
  try {
    {
      const { rows } = await queryDatabase({ sql: "SELECT * FROM category WHERE elastic_idx IS NULL AND deletion_time IS NULL ORDER BY idx;" });
      await Promise.allSettled(
        rows.map(async (row) => {
          const id = await addItemToSearchDatabase("category", { name: row.name });
          await queryDatabase({ sql: "UPDATE category SET elastic_idx = $1 WHERE idx =$2", parameters: [id, row.idx] });
        })
      );
    }
    {
      const { rows } = await queryDatabase({ sql: "SELECT * FROM product WHERE elastic_idx IS NULL AND deletion_time IS NULL ORDER BY idx;" });
      await Promise.allSettled(
        rows.map(async (row) => {
          const id = await addItemToSearchDatabase("product", { name: row.name });
          await queryDatabase({ sql: "UPDATE product SET elastic_idx = $1 WHERE idx =$2", parameters: [id, row.idx] });
        })
      );
    }
  } catch (err) {
    errLog(`addToSearchDatabase err:${err.message}`);
  } finally {
    setTimeout(addToSearchDatabase, randomInterval(Number(INTERVAL_DURATION_IN_MS)));
  }
}

module.exports = {
  addToSearchDatabase,
};
