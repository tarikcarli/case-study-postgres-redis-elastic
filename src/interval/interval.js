const { addToElastic } = require("./addToElastic");
const { removeFromElastic } = require("./removeFromElastic");
const { removeFromPostgres } = require("./removeFromPostgres");

function interval() {
  addToElastic();
  removeFromElastic();
  removeFromPostgres();
}

module.exports = {
  interval,
};
