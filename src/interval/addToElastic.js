const { errLog } = require("../util/debug");
const { addElastic } = require("../util/elastic");
const { pQuery } = require("../util/postgres");

async function addToElastic() {
  try {
    {
      const { rows } = await pQuery({ sql: "SELECT * FROM category WHERE elastic_idx IS NULL AND deletion_time IS NULL ORDER BY idx;" });
      await Promise.allSettled(
        rows.map(async (row) => {
          const id = await addElastic("category", { name: row.name });
          await pQuery({ sql: "UPDATE category SET elastic_idx = $1 WHERE idx =$2", parameters: [id, row.idx] });
        })
      );
    }
    {
      const { rows } = await pQuery({ sql: "SELECT * FROM product WHERE elastic_idx IS NULL AND deletion_time IS NULL ORDER BY idx;" });
      await Promise.allSettled(
        rows.map(async (row) => {
          const id = await addElastic("product", { name: row.name });
          await pQuery({ sql: "UPDATE product SET elastic_idx = $1 WHERE idx =$2", parameters: [id, row.idx] });
        })
      );
    }
  } catch (err) {
    errLog(`addToElasticErr:${err.message}`);
  } finally {
    setTimeout(addToElastic, 1000);
  }
}

module.exports = {
  addToElastic,
};
