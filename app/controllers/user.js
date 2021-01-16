const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/user')
const { secret } = require('../config')
class UsersCtl {
  async find(ctx) {
    // 操作数据库一定要 await
    ctx.body = await User.find() // .select('+password')
  }
  async findById(ctx) {
    // if (ctx.params.id * 1 >= db.length) {
    //   ctx.throw(412, '先决条件失败：id 大于等于数组长度')
    // }
    const user = await User.findById(ctx.params.id)

    if (!user) {
      // id 位数对应上，随便写不行 500
      ctx.throw(404, '用户不存在')
    } else {
      ctx.body = user
    }
  }
  async create(ctx) {
    // 校验name,age ,不满足条件返回 422 状态码
    ctx.verifyParams({
      name: { type: 'string', required: true},
      password: {type: 'string', required: true}
    })

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
      password: {type: 'string', required: true}
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
}

module.exports = new UsersCtl