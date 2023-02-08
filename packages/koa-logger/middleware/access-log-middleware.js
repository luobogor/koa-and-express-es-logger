const { stringifyJSON, truncate, _ , esLoggerConfig } = require('@my-es-log/common-logger').utils

const {
  isSls,
  isDebugger
} = esLoggerConfig

function logAccessRequest(ctx) {
  const req = ctx.request
  const reqHeaders = req.headers || {}
  const reqBody = req.body || {}
  const message = {
    reqHeaders,
    reqBody
  }

  ctx.logger.info(`ACCESS_REQUEST ${ stringifyJSON(message) }`)
}

function logAccessResponse(ctx) {
  const res = ctx.response
  const resHeaders = res.headers
  const resStatus = res.status
  const resBody = res.body || {}
  const message = {
    resStatus,
    resHeaders,
    resBody,
  }

  ctx.logger.info(`ACCESS_RESPONSE ${ truncate(stringifyJSON(message), 2000) }`)
}

module.exports = function (option) {
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development' || isDebugger) {
    return async function accessLogMiddleware(ctx, next) {
      const ignore = _.get(option, 'ignore') || (() => false)

      if (ignore(ctx.request.originalUrl, ctx.request.path)) {
        next()
        return
      }

      logAccessRequest(ctx)

      await next()

      logAccessResponse(ctx)

      if (isSls) {
        ctx.logger.flush()
      }
    }
  }

  return async function accessLogMiddleware(ctx, next) {
    await next()
  }
}

