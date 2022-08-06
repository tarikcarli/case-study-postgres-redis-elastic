const { errLog, infoLog } = require("../util/debug");
const { deleteElastic, addElastic } = require("../util/elastic");
const { pQuery } = require("../util/postgres");

async function updateToElastic() {
  try {
    {
      const { rows } = await pQuery({
        sql: "SELECT cui.idx job_idx, c.* FROM category c INNER JOIN category_updated_idx cui on c.idx = cui.category_idx ORDER BY cui.idx LIMIT 100;",
      });
      infoLog(rows);
      await Promise.allSettled(
        rows.map(async (row) => {
          await deleteElastic("category", row.elastic_idx);
          const id = await addElastic("category", { name: row.name });
          await pQuery({ sql: "UPDATE category SET elastic_idx=$1 WHERE idx =$2", parameters: [id, row.idx] });
          await pQuery({ sql: "DELETE FROM category_updated_idx WHERE idx = $1", parameters: [row.job_idx] });
        })
      );
    }
    {
      const { rows } = await pQuery({
        sql: "SELECT pui.idx job_idx, p.* FROM product p INNER JOIN product_updated_idx pui on p.idx = pui.product_idx ORDER BY pui.idx LIMIT 100;",
      });
      await Promise.allSettled(
        rows.map(async (row) => {
          await deleteElastic("product", row.elastic_idx);
          const id = await addElastic("product", { name: row.name });
          await pQuery({ sql: "UPDATE product SET elastic_idx=$1 WHERE idx =$2", parameters: [id, row.idx] });
          await pQuery({ sql: "DELETE FROM product_updated_idx WHERE idx = $1", parameters: [row.job_idx] });
        })
      );
    }
  } catch (err) {
    errLog(`removeFromElasticErr:${err.message}`);
  } finally {
    setTimeout(updateToElastic, 1000);
  }
}

module.exports = {
  updateToElastic,
};
