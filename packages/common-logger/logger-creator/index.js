const dayjs = require('dayjs')
const { esLoggerConfig, _ } = require('../utils')
const stringifyJSON = require('json-stringify-safe')
const uuid = require('uuid')
const logger = require('./es-logger')

const START_TIME = Symbol('startTime')
const TRACE_ID = Symbol('traceId')

const {
  isSls,
} = esLoggerConfig

function getUserId(req) {
  // 可以结合自身业务获取 userId，比如从 cookie 中获取
  const userId = _.get(req, 'ctx.userId') || _.get(req, 'context.userId') || '-'
  return userId
}

function getLogHeader(req, loveLevel) {
  const date = dayjs().format('YYYY-MM-DD HH:mm:ss,SSS')
  const pid = process.pid

  const userId = getUserId(req)
  const ip = _.get(req, 'ip') || '-'
  const traceId = req && req[TRACE_ID] ? req[TRACE_ID] : '-'
  const cost = req && req[START_TIME] ? `${ Date.now() - req[START_TIME] }ms` : '-'
  const method = _.get(req, 'method') || '-'
  const url = _.get(req, 'url') || '-'

  return `${ date } ${ loveLevel } ${ pid } [${ userId }/${ ip }/${ traceId }/${ cost } ${ method } ${ url }]`
}

function mergeMessage(messages) {
  if (!messages || messages.length <= 0) {
    return ''
  }

  return messages.map((item) => {
    if (item instanceof Error) {
      const err = item
      const errName = err.name || '-'
      const errMessage = err.message || '-'
      const errStack = _.chain(err)
        .get('stack', [])
        .split('\n')
        .map(_.trim)
        .value()
      const errExtra = _.omit(err, [ 'name', 'message', 'stack' ])

      return stringifyJSON({
        errName,
        errMessage,
        errStack,
        errExtra,
      })
    } else if (_.isString(item)) {
      return item
    } else {
      return stringifyJSON(item)
    }
  }).join(' ')
}

function formatMessage(req, messages, logLevel) {
  const message = mergeMessage(messages)
  const logHeader = getLogHeader(req, logLevel)

  return `${ logHeader } ${ message }`
}

function createBaseLogger({ req }) {
  return {
    info(...args) {
      const finalMessage = formatMessage(req, args, 'INFO')

      logger.info(finalMessage, {})
    },
    warn(...args) {
      const finalMessage = formatMessage(req, args, 'WARN')

      logger.warn(finalMessage, {})
    },
    error(...args) {
      const finalMessage = formatMessage(req, args, 'ERROR')

      logger.error(finalMessage, {})

      if (isSls) {
        this.flush()
      }
    },
    flush() {
      return logger.flush()
    }
  }
}

function createCtxLogger({ req }) {
  req[START_TIME] = Date.now() // 记录请求处理开始时间
  req[TRACE_ID] = uuid.v1()

  return createBaseLogger({
    req,
  })
}

function createAppLogger() {
  return createBaseLogger({
    req: {}
  })
}

module.exports = {
  createAppLogger,
  createCtxLogger,
}
