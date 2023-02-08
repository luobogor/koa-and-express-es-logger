const express = require('express')
const bodyParser = require('body-parser')
const { accessLogMiddleware, ctxLoggerMiddleware, loggerCreator } = require('@my-es-log/express-logger')

const app = express()
const appLogger = loggerCreator.createAppLogger()

app.use(ctxLoggerMiddleware())
app.use(bodyParser.json())
app.use(accessLogMiddleware())

app.use((req, res, next) => {
  req.context.userId = 'jinzhan.ye@foxmail.com'

  next()
})

app.use('/', (req, res) => {
  const ctx = req.context

  ctx.logger.info()
  ctx.logger.warn()
  ctx.logger.error()

  ctx.logger.info('ctx info')
  ctx.logger.warn('ctx warn')
  ctx.logger.error('ctx error')

  ctx.logger.info('ctx info2', {
    a: 1
  })
  ctx.logger.warn('ctx warn2', {
    b: 1
  })
  ctx.logger.error('ctx error2', {
    c: 1
  })
  ctx.logger.error('ctx error2', new Error('ctx error2'))

  //
  appLogger.info()
  appLogger.warn()
  appLogger.error()

  appLogger.info('app info')
  appLogger.warn('app warn')
  appLogger.error('app error')

  appLogger.info('app info2', {
    a: 1
  })
  appLogger.warn('app warn2', {
    b: 1
  })
  appLogger.error('app error2', {
    c: 1
  })
  appLogger.error('app error2', new Error('ctx error2'))

  res.json({
    message: 'express ok'
  })
})

const port = 7112
app.listen(port, () => {
  appLogger.info(`test-express-logger start http://localhost:${port}`)
})
