const { errLog } = require("../util/debug");
const { deleteElastic } = require("../util/elastic");
const { pQuery } = require("../util/postgres");

async function removeFromElastic() {
  try {
    {
      const { rows } = await pQuery({
        sql: "SELECT * FROM category WHERE elastic_idx IS NOT NULL AND deletion_time IS NOT NULL ORDER BY idx;",
      });
      await Promise.allSettled(
        rows.map(async (row) => {
          await deleteElastic("category", row.elastic_idx);
          await pQuery({ sql: "UPDATE category SET elastic_idx=null WHERE idx =$1", parameters: [row.idx] });
        })
      );
    }

    {
      const { rows } = await pQuery({
        sql: "SELECT * FROM product WHERE elastic_idx IS NOT NULL AND deletion_time IS NOT NULL ORDER BY idx;",
      });
      await Promise.allSettled(
        rows.map(async (row) => {
          await deleteElastic("product", row.elastic_idx);
          await pQuery({ sql: "UPDATE product SET elastic_idx=null WHERE idx =$1", parameters: [row.idx] });
        })
      );
    }
  } catch (err) {
    errLog(`removeFromElasticErr:${err.message}`);
  } finally {
    setTimeout(removeFromElastic, 1000);
  }
}

module.exports = {
  removeFromElastic,
};
