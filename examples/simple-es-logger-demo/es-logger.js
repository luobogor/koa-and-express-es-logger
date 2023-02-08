const { createLogger: createWinstonLogger, transports, format } = require('winston')
const { ElasticsearchTransport } = require('winston-elasticsearch')

const esNode = 'http://localhost:9200'
// const esNode = 'http://localhost:9200'

function createLogger() {
  return createWinstonLogger({
    level: 'info',// 只上报 info 级别以上日志，包括 info、warn、error
    transports: [
      new transports.Console({// 输出到控制台
        format: format.json(),
      }),
      new ElasticsearchTransport({// 输出到 ES
        indexPrefix: 'simple-es-logger-demo',// ES index 前缀
        indexSuffixPattern: 'YYYY.MM.DD',// ES index 后缀，跟前缀拼接起来 index 最终就是 simple-es-logger-demo-2023.01.12
        clientOpts: {
          node: esNode,
          maxRetries: 5,
          requestTimeout: 10000,
          sniffOnStart: false,
        },
      })
    ]
  })
}

module.exports = createLogger()
