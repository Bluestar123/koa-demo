const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const db = [{name: '小李'}]

const router = new Router({
  prefix: '/users'
})
const app = new Koa()


router.get('/', ctx => {
  ctx.body = db
})

router.get('/:id', ctx => {
  ctx.body = db[ctx.params.id * 1]
})

router.post('/', ctx => {
  console.log(ctx.request.body)
  db.push(ctx.request.body)
  ctx.body = ctx.request.body
})

app.use(bodyParser())
app.use(router.routes())
app.use(router.allowedMethods())
app.listen(3000)