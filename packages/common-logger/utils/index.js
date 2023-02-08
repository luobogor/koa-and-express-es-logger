const stringifyJSON = require('json-stringify-safe')
const _ = require('lodash')
const esLoggerConfig = require(`${process.cwd()}/.es-logger-config`)

module.exports = {
  _,
  truncate(content, maxLength) {
    const safeContent = content || ''
    const safeLength = safeContent.length

    if (safeLength <= maxLength) {
      return safeContent
    }

    return `${ safeContent.substr(0, maxLength) }…`
  },
  stringifyJSON,
  esLoggerConfig
}
