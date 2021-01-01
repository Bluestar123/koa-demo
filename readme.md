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
使用 next 调用下一层中间件 async await
中间件是个函数注册到 app.use 中

# 路由
如果不设置路由，任何方法(get/post/put)的请求都会返回相同的结果
- 处理不同 url
- 处理不同的 http 方法
- 解析 url 参数

## koa-router
```
const Router = require('koa-router')
const app = new Koa()
const router = new Router()

router.get('/', (ctx) => {
  ctx.body = '首页'
})

router.get('/users', (ctx) => {
  ctx.body = '用户列表'
})

// 注册到app中，中间件使用
app.use(router.routes())
```
### 路由前缀
```
// 前缀
const usersRouter = new Router({
  prefix: '/users'
})

// 使用前缀
usersRouter.post('/', ctx => {
  ctx.body = '添加用户'
})

app.use(usersRouter.routes())
```
### 多中间件，权鉴
```
// 定义中间件
const auth = async (ctx, next) => {
  if (ctx.url !== '/users') {
    ctx.throw(401)
  }
  await next()
}

usersRouter.get('/:id', auth, (ctx) => {
  ctx.body = `这是用户 ${ctx.params.id}`
})
```

### allowedMethods
```
// 1. 查看接口支持的方法 get post put ..
// 2. 如果koa-router支持这个方法但是没写，返回405； 如果koa-router不支持这个方法，返回 501 状态码
app.use(usersRouter.allowedMethods())
```

# 路由参数获取
### query
```
ctx.query 获取
```

### params
```
ctx.params.
```

### body
```
npm i koa-bodyparser --save

const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

使用 ctx.request.body
```

### header
```
ctx.header
```