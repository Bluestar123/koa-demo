const Router = require('koa-router')
const { findById, create, update, find, del, login } = require('../controllers/user')
const router = new Router({
  prefix: '/users'
})

router.get('/', find)

// 使用前缀
router.post('/', create)

router.get('/:id', findById)

router.patch('/:id', update)
router.delete('/:id', del)

// 登录验证 不是增删改查，使用 post + action 的方式定义接口
router.post('/login', login)
module.exports = router