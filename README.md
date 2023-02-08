# Koa/Express ES 日志上报 SDK
[Node.js、Elasticsearch、Kibana 日志上报实战](https://yejinzhan.gitee.io/2022/12/05/node-log-to-ek/) 介绍了如何使用 ES 做日志上报，Koa/Express ES Logger 用于将日志上报到 ES，以下先介绍 Koa 日志上报接入方式，Express 接入方式与 Koa 类似，文末介绍。开发文档参考[这里](./DEV.md)。接入例子参考 examples 目录。

## 安装
注意，@my-es-log/koa-logger 并没有发布到 NPM，需要使用可以自行发布。

```shell
npm i @my-es-log/koa-logger
```

## 配置
项目根目录下新建 `.es-logger-config.js` 填写配置：

- `esNode`\[none] 必填项，es 服务地址。
- `indexPrefix`\[none] 必填项，es index 前缀。
- `appName`\[none] 必填项，服务名称。
- `isDebugger`\[false] 是否为调试模式，默认情况下 process.env.NODE_ENV 无值或者为 `development` 时日志不上报，`isDebugger` 为 `true` 无论什么环境，都进行日志上报，一般在本地测试 logger 是否正常的情况开启。
- `isSls`\[false] 是否为 Serverless 环境，Serverless 环境请求结束就会马上销毁服务实例。针对这种情况，在请求结束前 SDK 会完成日志上报，保证日志不丢失。
- `flushInterval`\[30000] 非 Serverless 环境上报间隔时长。

示例：
```js
module.exports = {
  esNode: 'http://localhost:9200',
  indexPrefix: 'demo-log',
  appName: 'test-koa-logger',
  isDebugger: process.env.ES_LOGGER_DEBUGGER === '1',
  isSls: process.env.SERVERLESS === '1',
  flushInterval: 1000
}
```

## API
ctx logger、app logger 均提供 `info`、`warn`、`error` 方法，参数如下：
- logger.info(string | object | Error, msg2, msg3, ....)
- logger.warn(string | object | Error, msg2, msg3, ....)
- logger.error(string | object | Error, msg2, msg3, ....)

说明：
- 方法内部会自动对 object、Error 进行序列化
- message 可以传递多条，API 内部进行序列化及拼接

例子：
```
logger.info('this is a test message', { name: 'ok' })

// 输出结果：this is a test message {name:'ok'}
```

## ctxLoggerMiddleware
挂载 ctxLoggerMiddleware 绑定 ctx.logger 方法，就可以调用 ctx.logger 上报日志到 ES。

```js
/* app.js */
const { accessLogMiddleware, ctxLoggerMiddleware } = require('@my-es-log/koa-logger')

// 挂载 ctxLoggerMiddleware 绑定 ctx.logger
app.use(ctxLoggerMiddleware())

// ....

// 挂载 ctxLoggerMiddleware 中间件后，就可以使用 ctx.logger 上报日志
app.use(async (ctx, next) => {
  await next()

  ctx.logger.info('上报提示信息')
  ctx.logger.error(new Error('上报错误信息'))
})
```

Log 格式如下：

```
${timestamp} ${logLevel} ${pid} [${userId}/${ip}/${traceId}/${cost}ms ${method} ${url}] ${message}
```

例子：

绑定 userId

```
2022-12-09 17:58:20,639 INFO 15207 [jinzhan.ye@foxmail.com/::1/fba8c960-77a7-11ed-b6a7-9f409fa954b7/12265ms GET /] info {\"foo\":1}
```

## accessLogMiddleware
```js
/* app.js */
const { accessLogMiddleware } = require('@my-es-log/koa-logger')
// ...
app.use(accessLogMiddleware())
```

挂载 accessLogMiddleware 中间后，每个请求的请求和响应日志会被自动记录。挂载 accessLogMiddleware 前要先挂载这几个中间件：
- ctxLoggerMiddleware：accessLogMiddleware 内部依赖 ctx.logger
- bodyParser: 请求体需要经过 bodyParser 转换后，才能在 accessLogMiddleware 内获取记录下来

请求 message 格式如下，当 content-type 为 `multipart/form-data` 时请求参数是二进制数据，所以 reqBody 无法记录，其他类型 content-type 的 reqBody 都可以记录。

```
ACCESS_REQUEST { reqHeaders: { .... }, reqBody: { .... } }
```

最终上报到 ES 的日志：

```json
{
  "_index": "demo-log-2022.12.09",
  "_type": "_doc",
  "_id": "TiRS9oQBEQjZYbkHUZMl",
  "_version": 1,
  "_score": 1,
  "_ignored": [
    "message.keyword"
  ],
  "_source": {
    "@timestamp": "2022-12-09T09:58:08.380Z",
    "logLevel": "INFO",
    "fields": {
      "appName": "test-koa-logger"
    },
    "level": "info",
    "message": "2022-12-09 17:58:08,379 INFO 15207 [jinzhan.ye@foxmail.com/::1/fba8c960-77a7-11ed-b6a7-9f409fa954b7/6ms GET /] ACCESS_REQUEST {\"reqHeaders\":{\"host\":\"localhost:7111\",\"connection\":\"keep-alive\",\"cache-control\":\"max-age=0\",\"sec-ch-ua\":\"\\\"Not?A_Brand\\\";v=\\\"8\\\", \\\"Chromium\\\";v=\\\"108\\\", \\\"Google Chrome\\\";v=\\\"108\\\"\",\"sec-ch-ua-mobile\":\"?0\",\"sec-ch-ua-platform\":\"\\\"macOS\\\"\",\"upgrade-insecure-requests\":\"1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36\",\"accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\",\"sec-fetch-site\":\"none\",\"sec-fetch-mode\":\"navigate\",\"sec-fetch-user\":\"?1\",\"sec-fetch-dest\":\"document\",\"accept-encoding\":\"gzip, deflate, br\",\"accept-language\":\"zh-CN,zh;q=0.9,en;q=0.8\",\"cookie\":\"sid=374c7e9a-cdd9-49e9-a157-573cb6bfbfeb; Webstorm-46b31d7b=38b7759e-5a93-41ed-9d09-8cac8a1d482e; AGL_USER_ID=2f7edca4-95e6-4ac8-9fa5-4484914137e0; _ga=GA1.1.1385148448.1654482650; Hm_lvt_2c8ad67df9e787ad29dbd54ee608f5d2=1663211216; locale=zh-cn; io=0PsTKcGHGmvOZwWiAAAA; Hm_lvt_ad6b5732c36321f2dafed737ac2da92f=1669624135; Hm_lpvt_ad6b5732c36321f2dafed737ac2da92f=1669804631\"},\"reqBody\":{}}"
  },
  "fields": {
    "@timestamp": [
      "2022-12-09T09:58:08.380Z"
    ],
    "level.keyword": [
      "info"
    ],
    "logLevel": [
      "INFO"
    ],
    "level": [
      "info"
    ],
    "fields.appName.keyword": [
      "test-koa-logger"
    ],
    "logLevel.keyword": [
      "INFO"
    ],
    "fields.appName": [
      "test-koa-logger"
    ],
    "message": [
      "2022-12-09 17:58:08,379 INFO 15207 [jinzhan.ye@foxmail.com/::1/fba8c960-77a7-11ed-b6a7-9f409fa954b7/6ms GET /] ACCESS_REQUEST {\"reqHeaders\":{\"host\":\"localhost:7111\",\"connection\":\"keep-alive\",\"cache-control\":\"max-age=0\",\"sec-ch-ua\":\"\\\"Not?A_Brand\\\";v=\\\"8\\\", \\\"Chromium\\\";v=\\\"108\\\", \\\"Google Chrome\\\";v=\\\"108\\\"\",\"sec-ch-ua-mobile\":\"?0\",\"sec-ch-ua-platform\":\"\\\"macOS\\\"\",\"upgrade-insecure-requests\":\"1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36\",\"accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\",\"sec-fetch-site\":\"none\",\"sec-fetch-mode\":\"navigate\",\"sec-fetch-user\":\"?1\",\"sec-fetch-dest\":\"document\",\"accept-encoding\":\"gzip, deflate, br\",\"accept-language\":\"zh-CN,zh;q=0.9,en;q=0.8\",\"cookie\":\"sid=374c7e9a-cdd9-49e9-a157-573cb6bfbfeb; Webstorm-46b31d7b=38b7759e-5a93-41ed-9d09-8cac8a1d482e; AGL_USER_ID=2f7edca4-95e6-4ac8-9fa5-4484914137e0; _ga=GA1.1.1385148448.1654482650; Hm_lvt_2c8ad67df9e787ad29dbd54ee608f5d2=1663211216; locale=zh-cn; io=0PsTKcGHGmvOZwWiAAAA; Hm_lvt_ad6b5732c36321f2dafed737ac2da92f=1669624135; Hm_lpvt_ad6b5732c36321f2dafed737ac2da92f=1669804631\"},\"reqBody\":{}}"
    ]
  },
  "ignored_field_values": {
    "message.keyword": [
      "2022-12-09 17:58:08,379 INFO 15207 [jinzhan.ye@foxmail.com/::1/fba8c960-77a7-11ed-b6a7-9f409fa954b7/6ms GET /] ACCESS_REQUEST {\"reqHeaders\":{\"host\":\"localhost:7111\",\"connection\":\"keep-alive\",\"cache-control\":\"max-age=0\",\"sec-ch-ua\":\"\\\"Not?A_Brand\\\";v=\\\"8\\\", \\\"Chromium\\\";v=\\\"108\\\", \\\"Google Chrome\\\";v=\\\"108\\\"\",\"sec-ch-ua-mobile\":\"?0\",\"sec-ch-ua-platform\":\"\\\"macOS\\\"\",\"upgrade-insecure-requests\":\"1\",\"user-agent\":\"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36\",\"accept\":\"text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\",\"sec-fetch-site\":\"none\",\"sec-fetch-mode\":\"navigate\",\"sec-fetch-user\":\"?1\",\"sec-fetch-dest\":\"document\",\"accept-encoding\":\"gzip, deflate, br\",\"accept-language\":\"zh-CN,zh;q=0.9,en;q=0.8\",\"cookie\":\"sid=374c7e9a-cdd9-49e9-a157-573cb6bfbfeb; Webstorm-46b31d7b=38b7759e-5a93-41ed-9d09-8cac8a1d482e; AGL_USER_ID=2f7edca4-95e6-4ac8-9fa5-4484914137e0; _ga=GA1.1.1385148448.1654482650; Hm_lvt_2c8ad67df9e787ad29dbd54ee608f5d2=1663211216; locale=zh-cn; io=0PsTKcGHGmvOZwWiAAAA; Hm_lvt_ad6b5732c36321f2dafed737ac2da92f=1669624135; Hm_lpvt_ad6b5732c36321f2dafed737ac2da92f=1669804631\"},\"reqBody\":{}}"
    ]
  }
}
```

响应 message 格式如下，避免 log 性能问题，resBody 截取前 2000 位。
```
ACCESS_RESPONSE { resStatus: { ... }, resHeaders: { ... }, resBody: { ... } }
```

例子：

```json
{
  "_index": "demo-log-2022.12.09",
  "_type": "_doc",
  "_id": "diRS9oQBEQjZYbkHVZOh",
  "_version": 1,
  "_score": 1,
  "_source": {
    "@timestamp": "2022-12-09T09:58:20.693Z",
    "logLevel": "INFO",
    "fields": {
      "appName": "test-koa-logger"
    },
    "level": "info",
    "message": "2022-12-09 17:58:20,693 INFO 15207 [jinzhan.ye@foxmail.com/::1/fba8c960-77a7-11ed-b6a7-9f409fa954b7/12319ms GET /] ACCESS_RESPONSE {\"resStatus\":200,\"resHeaders\":{\"content-type\":\"application/json; charset=utf-8\"},\"resBody\":{\"message\":\"koa ok\"}}"
  },
  "fields": {
    "@timestamp": [
      "2022-12-09T09:58:20.693Z"
    ],
    "level.keyword": [
      "info"
    ],
    "logLevel": [
      "INFO"
    ],
    "level": [
      "info"
    ],
    "fields.appName.keyword": [
      "test-koa-logger"
    ],
    "message.keyword": [
      "2022-12-09 17:58:20,693 INFO 15207 [jinzhan.ye@foxmail.com/::1/fba8c960-77a7-11ed-b6a7-9f409fa954b7/12319ms GET /] ACCESS_RESPONSE {\"resStatus\":200,\"resHeaders\":{\"content-type\":\"application/json; charset=utf-8\"},\"resBody\":{\"message\":\"koa ok\"}}"
    ],
    "logLevel.keyword": [
      "INFO"
    ],
    "fields.appName": [
      "test-koa-logger"
    ],
    "message": [
      "2022-12-09 17:58:20,693 INFO 15207 [jinzhan.ye@foxmail.com/::1/fba8c960-77a7-11ed-b6a7-9f409fa954b7/12319ms GET /] ACCESS_RESPONSE {\"resStatus\":200,\"resHeaders\":{\"content-type\":\"application/json; charset=utf-8\"},\"resBody\":{\"message\":\"koa ok\"}}"
    ]
  }
}
```

## appLogger
appLogger 不依赖 ctx，在任何地方都可以使用，使用方法：

```js
/* utils.js */
const { loggerCreator } = require('@my-es-log/koa-logger')

const logger = loggerCreator.createAppLogger()

module.exports = {
  logger
}

/* 某个 js 文件 */
const utils = require('./utils')
utils.logger.info('上报提示信息')
utils.logger.error(new Error('上报错误信息'))
```

由于没有 ctx，拿不到请求上下文信息，所以 appLogger 只能记录最基本的信息 ，例子如下：

```
2022-10-27 15:00:50,671 INFO 33771 [-/-/-/- - -] 我是输出的日志信息
```

# Express ES 日志上报 SDK
## 安装
```shell
npm i @my-es-log/express-logger
```

## 使用
使用与 `@my-es-log/koa-logger` 基本一样，差别在于 `@my-es-log/koa-logger` 使用 ctx.logger 上报日志，而  `@my-es-log/express-logger` 使用 req.context.logger 上报日志。同时用户信息绑定到 `req.context.userId`。

