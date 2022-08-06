const { addToElastic } = require("./addToElastic");
const { removeFromElastic } = require("./removeFromElastic");
const { removeFromPostgres } = require("./removeFromPostgres");
const { updateToElastic } = require("./updateToElastic");

function interval() {
  addToElastic();
  removeFromElastic();
  removeFromPostgres();
  updateToElastic();
}

module.exports = {
  interval,
};
