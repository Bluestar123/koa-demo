const Router = require('koa-router')
// const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update } = require('../controllers/topics')
const router = new Router({
  prefix: '/topics'
})

const auth = jwt({ secret })

router.get('/', find)

// 使用前缀
router.post('/', auth, create)

router.get('/:id', findById)

router.patch('/:id', auth, update)

module.exports = router