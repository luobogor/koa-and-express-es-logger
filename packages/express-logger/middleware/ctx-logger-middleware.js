const { createCtxLogger } = require('@my-es-log/common-logger').loggerCreator

module.exports = function (appName) {
  return async function ctxLoggerMiddleware(req, res, next) {
    if (!req.context) {
      req.context = {}
    }

    req.context.logger = createCtxLogger({
      appName,
      req,
    })

    next()
  }
}
