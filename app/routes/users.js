const Router = require('koa-router')
const { findById, create, update } = require('../controllers/user')
const router = new Router({
  prefix: '/users'
})

router.get('/', (ctx) => {
  ctx.body = '用户列表'
})

// 使用前缀
router.post('/', create)

router.get('/:id', findById)

router.put('/:id', update)
router.delete('/:id', ctx => {
  ctx.status = 204
})

module.exports = router