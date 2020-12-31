# 初始化
- 使用 nodemon 启动
```
const Koa = require('koa')

// 实例化 application
const app = new Koa()
const PORT = 3000

// use 中一个函数 即中间件
app.use((ctx) => {
  ctx.body = 'hello world'
})

app.listen(PORT)
```

# 中间件和洋葱模型