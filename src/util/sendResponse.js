const { errLog, httpLog } = require("./debug");

/**
 * @type {(first:{
 *  err?:Error,
 *  res:import("express").Response,
 *  req:import("express").Request,
 *  responseStatus?:number,
 *  responseData?:any,
 *  logResponse?: boolean,
 *  logRequest?: boolean
 *  redirectUrl?: string
 * }) => Promise<void>
 * }
 * */
async function sendResponse({
  err,
  res,
  req,
  responseStatus = 200,
  responseData = {},
  logResponse = true,
  logRequest = true,
  redirectUrl,
}) {
  if (res.headersSent) return;
  const { method, url, baseUrl, body, query, params } = req;
  httpLog("%o", {
    level: err ? "ERROR  " : "INFO   ",
    type: "USER   ",
    message: {
      message: err ? err.message : null,
      method,
      url,
      baseUrl,
      request: logRequest && { body, query, params },
      response: logResponse && { responseStatus, responseData },
    },
  });
  if (redirectUrl) {
    return res.redirect(redirectUrl);
  }
  if (err) {
    errLog(err);
    res.status(responseStatus >= 200 && responseStatus < 300 ? 400 : responseStatus).json({ message: err.message });
  } else {
    if (typeof responseData === "object") {
      res.status(responseStatus).json(responseData);
    } else {
      res.set("Content-Type", "application/json");
      res.status(responseStatus).send(responseData).end();
    }
  }
}

module.exports = { sendResponse };
