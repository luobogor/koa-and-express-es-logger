const { stringifyJSON, truncate, _, esLoggerConfig } = require('@my-es-log/common-logger').utils
const onFinished = require('on-finished')

const {
  isSls,
  isDebugger
} = esLoggerConfig

function logAccessRequest(req) {
  const reqHeaders = req.headers || {}
  const reqBody = req.body || {}
  const message = {
    reqHeaders,
    reqBody
  }

  req.context.logger.info(`ACCESS_REQUEST ${ stringifyJSON(message) }`)
}

function logAccessResponse(req, res) {
  const resHeaders = res.getHeaders() || {}
  const resStatus = res.statusCode
  const resBody = res._za_body || {}
  const message = {
    resStatus,
    resHeaders,
    resBody,
  }

  req.context.logger.info(`ACCESS_RESPONSE ${ truncate(stringifyJSON(message), 2000) }`)
}

module.exports = function (option) {
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development' || isDebugger) {
    return function accessLogMiddleware(req, res, next) {
      const ignore = _.get(option, 'ignore') || (() => false)

      if (ignore(req.originalUrl, req.path)) {
        next()
        return
      }

      const oldSendJson = res.json

      res.json = function (body) {
        res._za_body = body
        oldSendJson.apply(res, arguments)
      }

      logAccessRequest(req)

      onFinished(res, function () {
        logAccessResponse(req, res)

        if (isSls) {
          req.context.logger.flush()
        }
      })

      next()
    }
  }

  return function accessLogMiddleware(req, res, next) {
    next()
  }
}

