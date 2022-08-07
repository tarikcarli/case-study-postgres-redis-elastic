const axios = require("axios").default;
const casual = require("casual");
const { APP_PROTOCOL, APP_HOST, APP_PORT } = require("./util/config");
const { infoLog, errLog } = require("./util/debug");
async function faker() {
  try {
    let res = await axios.get(`${APP_PROTOCOL}://${APP_HOST}:${APP_PORT}/api/category`);
    if (res.data.count == 0) {
      for (let i = 0; i < 100; i++) {
        await axios.post(`${APP_PROTOCOL}://${APP_HOST}:${APP_PORT}/api/category`, { name: casual.sentence });
        infoLog(`category loading ${i}`);
      }
    }
    res = await axios.get(`${APP_PROTOCOL}://${APP_HOST}:${APP_PORT}/api/product`);
    if (res.data.count == 0) {
      for (let i = 0; i < 10000; i++) {
        await axios.post(`${APP_PROTOCOL}://${APP_HOST}:${APP_PORT}/api/product`, {
          categoryIdx: casual.integer(1, 100),
          name: casual.sentence,
        });
        infoLog(`product loading ${i}`);
      }
    }
  } catch (err) {
    errLog(`fakerErr: ${err.message}`);
  }
}

module.exports = {
  faker,
};
