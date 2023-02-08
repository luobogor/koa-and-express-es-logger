const { createLogger: createWinstonLogger, transports, format } = require('winston')
const { ElasticsearchTransport } = require('winston-elasticsearch')
const { esLoggerConfig, _ } = require('../utils')

const {
  isDebugger,
  appName
} = esLoggerConfig

// 连接失败异常会被 winston-elasticsearch 忽略，所以不用捕获
const esTransportOpts = (() => {
  const {
    isSls,
    flushInterval: rawFlushInterval,
    indexPrefix,
    esNode,
  } = esLoggerConfig

  let flushInterval = 30000
  if (isSls) {
    flushInterval = 0
  } else if (_.isNumber(rawFlushInterval)) {
    flushInterval = rawFlushInterval
  }

  return {
    level: 'info',
      indexPrefix,
      flushInterval,
      indexSuffixPattern: 'YYYY.MM.DD',
    clientOpts: {
    node: esNode,
      maxRetries: 5,
      requestTimeout: 10000,
      sniffOnStart: false,
  },
    // 不要使用 winston-elasticsearch 的 useTransformer，因为 winston-elasticsearch 内部 index.js 第 125 行如果判断 useTransformer 为 true，会触发一个异步任务上报日志。
    // 但是在 serverless 环境下，有可能出现响应结束，但是异步任务没有执行完的情况，可能导致一个请求最后一条日志丢失的情况。
    useTransformer: false,
  };
})()

function transformerMeta(logData) {
  return {
    '@timestamp': new Date().toISOString(),
    logLevel: logData.level,
    fields: logData.meta,
  }
}

function createLogger() {
  const customTransports = [
    new transports.Console({
      format: isDebugger ? format.json() : format.printf((i) => `${ i.message }`),
    }),
  ]

  let esTransport = null
  if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development' || isDebugger) {
    esTransport = new ElasticsearchTransport(esTransportOpts)
    customTransports.push(esTransport)
  }

  const winstonLogger = createWinstonLogger({
    level: 'info',
    transports: customTransports
  })

  const rawInfo = winstonLogger.info
  const rawWarn = winstonLogger.warn
  const rawError = winstonLogger.error

  Object.assign(winstonLogger, {
    flush() {
      if (esTransport) {
        return esTransport.flush()
      }
    },
    info(message, meta) {
      const _meta = transformerMeta({
        level: 'INFO',
        meta: {
          appName,
          ...meta,
        },
      })

      return rawInfo.call(this, message, _meta)
    },
    warn(message, meta) {
      const _meta = transformerMeta({
        level: 'WARN',
        meta: {
          appName,
          ...meta,
        },
      })

      return rawWarn.call(this, message, _meta)
    },
    error(message, meta) {
      const _meta = transformerMeta({
        level: 'ERROR',
        meta: {
          appName,
          ...meta,
        },
      })

      return rawError.call(this, message, _meta)
    }
  })

  return winstonLogger
}

module.exports = createLogger()
