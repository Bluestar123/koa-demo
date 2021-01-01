const Koa = require('koa')
const Router = require('koa-router')

const app = new Koa()
const router = new Router()
// 前缀
const usersRouter = new Router({
  prefix: '/users'
})

// 定义中间件
const auth = async (ctx, next) => {
  if (ctx.url !== '/users') {
    ctx.throw(401)
  }
  await next()
}

// router.get('/', (ctx) => {
//   ctx.body = '首页'
// })

// router.get('/users', (ctx) => {
//   ctx.body = '用户列表'
// })

usersRouter.get('/', ctx => {
  ctx.body = [
    {
      name: '测不准1'
    },
    {
      name: '测不准2'
    }
  ]
})
// 使用前缀
usersRouter.post('/', ctx => {
  ctx.body = { name: '测不准3' }
})

usersRouter.get('/:id', (ctx) => {
  ctx.body = { name: '测不准3' }
})

usersRouter.put('/:id', ctx => {
  ctx.body = { name: '测不准333' }
})
usersRouter.delete('/:id', ctx => {
  ctx.status = 204
})

// 注册到中间件中
app.use(router.routes())
app.use(usersRouter.routes())
// 查看接口支持的方法 get post put ..
app.use(usersRouter.allowedMethods())

app.listen(3000)