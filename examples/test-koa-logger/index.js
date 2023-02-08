const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const { accessLogMiddleware, ctxLoggerMiddleware, loggerCreator } = require('@my-es-log/koa-logger')

const app = new Koa()
const appLogger = loggerCreator.createAppLogger()

app.use(ctxLoggerMiddleware())
app.use(bodyParser())

app.use((ctx, next) => {
  ctx.userId = 'jinzhan.ye@foxmail.com'

  next()
})

app.use(accessLogMiddleware())

app.use(async (ctx, next) => {
  if (ctx.path === '/') {
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

    ctx.body = {
      message: 'koa ok'
    }
  }

  next()
})

const port = 7111
app.listen(port, () => {
  appLogger.info(`test-koa-logger start http://localhost:${port}`)
})
