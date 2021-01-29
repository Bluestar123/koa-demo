const Router = require('koa-router')
// const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { find, findById, create, update, delete: del, checkCommentExist, checkCommentator } = require('../controllers/comments')
const router = new Router({
  // 三级嵌套结构
  prefix: '/questions/:questionId/answers/:answerId/comments'
})

const auth = jwt({ secret })

router.get('/', find)

// 使用前缀
router.post('/', auth, create)

router.get('/:id', checkCommentExist, findById)

router.patch('/:id', auth, checkCommentator, checkCommentExist, update)
router.delete('/:id', auth, checkCommentator, checkCommentExist, del)

module.exports = router