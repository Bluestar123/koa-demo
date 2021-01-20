const Koa = require('koa')

// 只支持 json 和 form 的请求体 不支持文件 使用 koa-body 替换
const koaBody = require('koa-body')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const koaStatic = require('koa-static')
const mongoose = require('mongoose')
const path = require('path')
const config = require('./config')
// 实例化 application
const app = new Koa()
const PORT = 3000
const routing = require('./routes')

mongoose.connect(config.connectionStr, { useNewUrlParser: true }, () => console.log('数据库连接成功'))
mongoose.connection.on('error', console.error)

// // use 中一个函数 即中间件
// app.use(async (ctx, next) => {
//   console.log(1)
//   await next()
//   console.log(5)
//   ctx.body = 'hello world'
// })

// // 会打印两次，localhost 和 iconfont
// app.use(async (ctx, next) => {
//   console.log(2)
//   await next()
//   console.log(4)
// })

// app.use((ctx) => {
//   console.log(3)
// })

// 异常处理
// app.use(async (ctx, next) => {
//   try {
//     await next()
//   } catch (err) {
//     ctx.status = err.status || err.statusCode || 500 // 运行时报错返回500
//     ctx.body = {
//       msg: err.message
//     }
//   }
// })

// 静态文件放在最前面 生成静态文件路径
app.use(koaStatic(path.join(__dirname, 'public')))

// 默认配置
app.use(error({
  // stack包含信息，生产环境不返回
  postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack, ...rest}
}))

// 设置koa-body
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'),//上传目录
    keepExtensions: true, // 保留拓展名
  }
}))

// 校验请求体的，放在后面
app.use(parameter(app)) // 上下文 ctx 加个方法，全局校验
routing(app)

app.listen(PORT, () => console.log(`程序启动 ${PORT}`))