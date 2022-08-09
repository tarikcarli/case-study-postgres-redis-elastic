const { infoLog } = require("./debug");

// @ts-nocheck
const config = {
  NODE_ENV: process.env.NODE_ENV,
  APP_PROTOCOL: process.env.APP_PROTOCOL,
  APP_HOST: process.env.APP_HOST,
  APP_PORT: process.env.APP_PORT,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SCHEMA: process.env.DB_SCHEMA,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  CACHE_HOST: process.env.CACHE_HOST,
  CACHE_PORT: process.env.CACHE_PORT,
  SEARCH_DATABASE_HOST: process.env.SEARCH_DATABASE_HOST,
  SEARCH_DATABASE_PORT: process.env.SEARCH_DATABASE_PORT,
  INTERVAL_DURATION_IN_MS: process.env.INTERVAL_DURATION_IN_MS,
  LOAD_FAKE_DATA: process.env.LOAD_FAKE_DATA,
  DEBUG: process.env.DEBUG,
};
for (const key in config) {
  const configItem = config[key];
  if (configItem == null || configItem === "") {
    throw new Error(`config property missing err: ${key} ${configItem}`);
  }
}
infoLog("%o", config);

module.exports = config;
