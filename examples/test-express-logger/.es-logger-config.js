module.exports = {
  esNode: 'http://localhost:9200',
  indexPrefix: 'my-es-log',
  appName: 'test-express-logger',
  isDebugger: process.env.ES_LOGGER_DEBUGGER === '1',
  isSls: process.env.SERVERLESS === '1',
  flushInterval: 1000
}
