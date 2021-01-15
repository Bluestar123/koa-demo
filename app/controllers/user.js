const User = require('../models/user')

class UsersCtl {
  async find(ctx) {
    // 操作数据库一定要 await
    ctx.body = await User.find()
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
      age: {type: 'number', required: false}
    })

    const user = await new User(ctx.request.body).save()
    ctx.body = user
  }
  async update(ctx) {
    // ctx.verifyParams({
    //   name: { type: 'string', required: true }
    // })
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
}

module.exports = new UsersCtl