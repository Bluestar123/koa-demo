const Router = require('koa-router')
// const jsonwebtoken = require('jsonwebtoken')
const jwt = require('koa-jwt')
const { secret } = require('../config')
const { findById, create, update, unfollowTopic, listFollowingTopic, checkUserExist, find, del, login, checkOwner, listFollowing, follow, unfollow, followTopic } = require('../controllers/user')
const { checkTopicExist } = require('../controllers/topics')
const router = new Router({
  prefix: '/users'
})

// 先认证（告诉服务器你是谁） 在授权

// 认证中间件
// const auth = async (ctx, next) => {
//   // 解析 token 获取信息
//   const { authorization = '' } = ctx.request.header
//   const token = authorization.replace('Bearer ', '')
//   console.log(token ,456)
//   try {
//     // token 中获取用户信息
//     const user = jsonwebtoken.verify(token, secret)
//     // 存放用户信息
//     ctx.state.user = user
//   } catch (error) {
//     ctx.throw(401, error.message)
//   }
//   await next()
// }
const auth = jwt({ secret })

router.get('/', find)

// 使用前缀
router.post('/', create)

router.get('/:id', findById)

router.patch('/:id', auth, checkOwner, update)

// 自己删除自己 不能 a 删除 b  授权的逻辑
router.delete('/:id', auth, checkOwner, del)

// 登录验证 不是增删改查，使用 post + action 的方式定义接口
router.post('/login', login)

// 关注某人
router.put('/following/:id', auth, checkUserExist, follow)
// 取消关注
router.delete('/following/:id', auth, checkUserExist, unfollow)

// 关注某人
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
// 取消关注
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)

// 获取关注者列表
router.get('/:id/following', listFollowing)

router.get('/followingTopics/:id', listFollowingTopic)

module.exports = router