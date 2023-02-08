## 安装
本仓库使用 PNPM 创建 Monorepo，所以安装必须使用 PNPM，在根目录执行 `pnpm i`，即可完成所有子目录依赖安装。

## 目录
- express-logger：@my-es-log/express-logger 代码
- koa-logger：@my-es-log/koa-logger 代码
- common-logger：@my-es-log/common-logger 代码，express-logger、koa-logger 的公用代码
- test-express-logger：测试 @my-es-log/express-logger
- test-koa-logger：测试 @my-es-log/koa-logger

## 发布
express-logger、koa-logger、common-logger 这三个目录的 `package.json` 都有以下脚本，用于发布正式和 beta 版本。

```json
{
  "scripts": {
    "pub": "pnpm publish",
    "pub:beta": "pnpm publish --tag beta"
  }
}
```

由于 @my-es-log/koa-logger、@my-es-log/express-logger 依赖 @my-es-log/common-logger，所以 common-logger 发生改动必须重新发布 @my-es-log/common-logger。

发布 @my-es-log/koa-logger、@my-es-log/express-logger 时，PNPM 自动对 `workspace:^` 进行转换成具体的版本。[参考文档](https://pnpm.io/zh/workspaces#%E5%8F%91%E5%B8%83-workspace-%E5%8C%85)。
