const Router = require('koa-router')
const { findById, create, update, find, del } = require('../controllers/user')
const router = new Router({
  prefix: '/users'
})

router.get('/', find)

// 使用前缀
router.post('/', create)

router.get('/:id', findById)

router.patch('/:id', update)
router.delete('/:id', del)

module.exports = router