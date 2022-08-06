const { infoLog } = require("./debug");

// @ts-nocheck
const config = {
  NODE_ENV: process.env.NODE_ENV,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SCHEMA: process.env.DB_SCHEMA,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
};
infoLog("%o", config);
module.exports = config;
