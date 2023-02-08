const Koa = require('koa')
const app = new Koa()
const logger = require('./es-logger')

app.use(async (ctx, next) => {
  const body = {
    text: `服务被访问了，生成随机数：${ Math.floor(Math.random() * 100) }`
  }

  logger.info(JSON.stringify(body))

  ctx.body = body

  next()
})

const port = 7115

app.listen(port, () => {
  console.log(`服务启动成功，http://localhost:${7115}`)
})
