const { createCtxLogger } = require('@my-es-log/common-logger').loggerCreator

module.exports = function (appName) {
  return async function ctxLoggerMiddleware(ctx, next) {
    ctx.logger = createCtxLogger({
      req: ctx.request,
      appName,
    })

    await next()
  }
}
