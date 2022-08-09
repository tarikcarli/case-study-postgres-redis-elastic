const { addToSearchDatabase } = require("./addToSearchDatabase");
const { removeFromSearchDatabase } = require("./removeFromSearchDatabase");
const { removeFromDatabase } = require("./removeFromDatabase");
const { updateToSearchDatabase } = require("./updateToSearchDatabase");

function interval() {
  addToSearchDatabase();
  removeFromSearchDatabase();
  removeFromDatabase();
  updateToSearchDatabase();
}

module.exports = {
  interval,
};
