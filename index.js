const Koa = require('koa')

// 实例化 application
const app = new Koa()
const PORT = 3000

// use 中一个函数 即中间件
app.use(async (ctx, next) => {
  console.log(1)
  await next()
  console.log(5)
  ctx.body = 'hello world'
})

// 会打印两次，localhost 和 iconfont
app.use(async (ctx, next) => {
  console.log(2)
  await next()
  console.log(4)
})

app.use((ctx) => {
  console.log(3)
})

app.listen(PORT)