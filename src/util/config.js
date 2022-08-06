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
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  ELASTIC_HOST: process.env.ELASTIC_HOST,
  ELASTIC_PORT: process.env.ELASTIC_PORT,
  INTERVAL_DURATION_IN_MS: process.env.INTERVAL_DURATION_IN_MS,
};
infoLog("%o", config);

module.exports = config;
