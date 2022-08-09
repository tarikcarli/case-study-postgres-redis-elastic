const { INTERVAL_DURATION_IN_MS } = require("../util/config");
const { errLog } = require("../util/debug");
const { deleteItemFromSearchDatabase } = require("../adapter/search_database");
const { queryDatabase } = require("../adapter/database");
const { randomInterval } = require("../util/randomInterval");

async function removeFromSearchDatabase() {
  try {
    {
      const { rows } = await queryDatabase({
        sql: "SELECT * FROM category WHERE elastic_idx IS NOT NULL AND deletion_time IS NOT NULL ORDER BY idx;",
      });
      await Promise.allSettled(
        rows.map(async (row) => {
          await deleteItemFromSearchDatabase("category", row.elastic_idx);
          await queryDatabase({ sql: "UPDATE category SET elastic_idx=null WHERE idx =$1", parameters: [row.idx] });
        })
      );
    }

    {
      const { rows } = await queryDatabase({
        sql: "SELECT * FROM product WHERE elastic_idx IS NOT NULL AND deletion_time IS NOT NULL ORDER BY idx;",
      });
      await Promise.allSettled(
        rows.map(async (row) => {
          await deleteItemFromSearchDatabase("product", row.elastic_idx);
          await queryDatabase({ sql: "UPDATE product SET elastic_idx=null WHERE idx =$1", parameters: [row.idx] });
        })
      );
    }
  } catch (err) {
    errLog(`removeFromSearchDatabase err:${err.message}`);
  } finally {
    setTimeout(removeFromSearchDatabase, randomInterval(Number(INTERVAL_DURATION_IN_MS)));
  }
}

module.exports = {
  removeFromSearchDatabase,
};
