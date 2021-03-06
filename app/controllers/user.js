const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/user')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')
class UsersCtl {
  // 单独写 或者 写在model 都可以，中间件
  async checkOwner(ctx, next) {
    // 如果操作人不是自己
    if (ctx.params.id !== ctx.state.user._id) {// 权限认证完后会存在state中
      ctx.throw(403, '没有权限操作')
    }
    await next()
  }

  async find(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    let { page = 1, limit = 10 } = ctx.query
    page = Math.max(+page, 1) - 1
    limit = Math.max(+limit, 10)

    // 操作数据库一定要 await
    ctx.body = await User.find().limit(limit).skip(page * limit).select(selectFields) // .select('+password')
  }
  async findById(ctx) {
    // 通过 fields 字段过滤
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')

    const pupilateStr = fields.split(';').filter(f => f).map(f => {
      if (f === 'employments') {
        return 'empolymets.job employments.company'
      }
      if (f === 'educations') {
        return 'educations.major educations.school'
      }
      return f
    })
    const user = await User.findById(ctx.params.id).select(selectFields)
                        .populate(pupilateStr)

    if (!user) {
      // id 位数对应上，随便写不行 500
      ctx.throw(404, '用户不存在')
    } else {
      ctx.body = user
    }
  }
  async create(ctx) {
    // 校验name,age ,不满足条件返回 422 状态码
    // ctx.verifyParams({
    //   name: { type: 'string', required: true},
    //   password: {type: 'string', required: true}
    // })
    // 校验用户唯一性， 先查数据库中是否存在
    const { name } = ctx.request.body
    const repeatedUser = await User.findOne({ name })
    if (repeatedUser) {
      ctx.throw(409, '用户名已经存在')
    }

    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true },
      password: {type: 'string', required: true},
      avatar_url: { type: 'string', required: false },
      gender: { type: 'string', required: false },
      locations: { type: 'array', itemType: 'string', required: false },
      business: { type: 'string', required: false },
      employments: { type: 'array', itemType: 'object', required: false } // 小写
    })
    const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    if (!user) {
      ctx.throw(404, '用户不存在')
    } else {
      ctx.body = user
    }
  }
  async del(ctx) {
    const user = await User.findByIdAndRemove(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    } else {
      ctx.body = user
    }
  }

  // 登录信息验证
  async login(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: true},
      password: { type: 'string', required: true }
    })
    const user = await User.findOne(ctx.request.body)
    if (!user) {
      ctx.throw(401, '用户名或密码不正确')
    }

    // 不敏感信息
    const { _id, name } = user
    const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' }) // 过期时间
    ctx.body = {
      token
    }
  }

  // 获取某人的关注者 (我关注了水)
  async listFollowing(ctx) {
    // 通过populate 的 following 字段内会是具体的 用户信息
    const user = await User.findById(ctx.params.id).select('+following').populate('following')
    if (!user) ctx.throw(404)
    ctx.body = user.following
  }

  // 获取xxxid的粉丝列表 （谁关注了我）
  async listFollower(ctx) {
    // 通过populate 的 following 字段内会是具体的 用户信息
    const users = await User.find({following: ctx.params.id})
    ctx.body = users
  }

  // 检查用户是否存在 中间件
  async checkUserExist(ctx, next) {
    const user = await User.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404, '用户不存在')
    }
    await next()
  }

  // 关注某人 (处理完数据库需要save)
  async follow(ctx) {
    const ownUser = await User.findById(ctx.state.user._id).select('+following')
    // mongoose 自带的数据类型, 使用toString（）方法
    if (!ownUser.following.map(id => id.toString()).includes(ctx.params.id)) {
      ownUser.following.push(ctx.params.id)
      ownUser.save()
    }
    ctx.status = 204
  }

  // 取消关注
  async unfollow(ctx) {
    // 当前登录者
    const ownUser = await User.findById(ctx.state.user._id).select('+following')
    const index = ownUser.following.map(id => id.toString()).indexOf(ctx.params.id)
    // mongoose 自带的数据类型, 使用toString（）方法
    if (index > -1) {
      ownUser.following.splice(index, 1)
      ownUser.save()
    }
    ctx.status = 204
  }

  // 获取某人的关注话题列表 
  async listFollowingTopic(ctx) {
    // 通过populate 的 following 字段内会是具体的 用户信息
    const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
    if (!user) ctx.throw(404, '用户不存在')
    ctx.body = user.followingTopics
  }

  // 关注话题
  async followTopic(ctx) {
    const ownUser = await User.findById(ctx.state.user._id).select('+followingTopics')
    // mongoose 自带的数据类型, 使用toString（）方法
    if (!ownUser.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
      ownUser.followingTopics.push(ctx.params.id)
      ownUser.save()
    }
    ctx.status = 204
  }
  // 取消关注话题
  async unfollowTopic(ctx) {
    // 当前登录者
    const ownUser = await User.findById(ctx.state.user._id).select('+followingTopics')
    const index = ownUser.followingTopics.map(id => id.toString()).indexOf(ctx.params.id)
    // mongoose 自带的数据类型, 使用toString（）方法
    if (index > -1) {
      ownUser.followingTopics.splice(index, 1)
      ownUser.save()
    }
    ctx.status = 204
  }


  // 列出我的提问
  async listQuestions(ctx) {
    const questions = await Question.find({ questioner: ctx.params.id })
    ctx.body = questions
  }


  // 某个用户赞过的答案列表
  async listLikingAnswers(ctx) {
    // 通过populate 的 likingAnswers 字段内会是具体的 用户信息
    const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
    if (!user) ctx.throw(404, '用户不存在')
    ctx.body = user.likingAnswers
  }

  // 我给答案点赞
  async likeAnswer(ctx) {
    const ownUser = await User.findById(ctx.state.user._id).select('+likingAnswers')
    // mongoose 自带的数据类型, 使用toString（）方法
    if (!ownUser.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      ownUser.likingAnswers.push(ctx.params.id)
      ownUser.save()
      // 答案投票数加 1
      await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: 1}})
    }
    ctx.status = 204
    await next()
  }
  // 取消赞过的答案
  async unlikeAnswer(ctx) {
    // 当前登录者
    const ownUser = await User.findById(ctx.state.user._id).select('+likingAnswers')
    const index = ownUser.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    // mongoose 自带的数据类型, 使用toString（）方法
    if (index > -1) {
      ownUser.likingAnswers.splice(index, 1)
      ownUser.save()
      await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: -1}})
    }
    ctx.status = 204
  }

  //////// 踩
  // 某个用户赞过的答案列表
  async listDisLikingAnswers(ctx) {
    // 通过populate 的 dislikingAnswers 字段内会是具体的 用户信息
    const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
    if (!user) ctx.throw(404, '用户不存在')
    ctx.body = user.dislikingAnswers
  }

  // 我给答案点赞
  async dislikeAnswer(ctx) {
    const ownUser = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    // mongoose 自带的数据类型, 使用toString（）方法
    if (!ownUser.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
      ownUser.dislikingAnswers.push(ctx.params.id)
      ownUser.save()
    }
    ctx.status = 204
  }
  // 取消赞过的答案
  async unDislikeAnswer(ctx) {
    // 当前登录者
    const ownUser = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
    const index = ownUser.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id)
    // mongoose 自带的数据类型, 使用toString（）方法
    if (index > -1) {
      ownUser.dislikingAnswers.splice(index, 1)
      ownUser.save()
    }
    ctx.status = 204
    await next()
  }
}

module.exports = new UsersCtl