const Router = require('koa-router')
// const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update, delete: del, checkQuestioner } = require('../controllers/questions')
const router = new Router({
  prefix: '/questions/:questionId/answers'
})

const auth = jwt({ secret })

router.get('/', find)

// 使用前缀
router.post('/', auth, create)

router.get('/:id', findById)

router.patch('/:id', auth, checkQuestioner, update)
router.delete('/:id', auth, checkQuestioner, del)

module.exports = router