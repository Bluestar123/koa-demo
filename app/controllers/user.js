const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/user')
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
    // 操作数据库一定要 await
    ctx.body = await User.find() // .select('+password')
  }
  async findById(ctx) {
    // if (ctx.params.id * 1 >= db.length) {
    //   ctx.throw(412, '先决条件失败：id 大于等于数组长度')
    // }
    
    // 通过 fields 字段过滤
    const { fields } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    const user = await User.findById(ctx.params.id).select(selectFields)

    if (!user) {
      // id 位数对应上，随便写不行 500
      ctx.throw(404, '用户不存在')
    } else {
      ctx.body = user
    }
  }
  async create(ctx) {
    console.log(2222222222)
    // 校验name,age ,不满足条件返回 422 状态码
    // ctx.verifyParams({
    //   name: { type: 'string', required: true},
    //   password: {type: 'string', required: true}
    // })
    // 校验用户唯一性， 先查数据库中是否存在
    const { name } = ctx.request.body
    console.log(name, 123)
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
}

module.exports = new UsersCtl