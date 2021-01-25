const jsonwebtoken = require('jsonwebtoken')
const Topic = require('../models/topics')

class TopicsCtl {

  async checkTopicExist(ctx) {
    const topic = await Topic.findById(ctx.params.id)
    if (!topic) {
      ctx.throw(404, '没有相关话题')
    }
    await next()
  }

  async find(ctx) {
    let { limit = 10, page = 1, q = '' } = ctx.query
    // 默认1
    limit = Math.max(limit * 1, 1)
    page = Math.max(page * 1, 1) - 1
    // 分页
    ctx.body = await Topic.find({
      name: new RegExp(q) // 模糊搜索
    }).limit(limit).skip(page * limit)// 跳过前n项
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    let topic = await Topic.findById(ctx.params.id).select(selectFields)
    ctx.body = topic
  }

  async create(ctx) {
    // 有请求体要校验
    ctx.verifyParams({
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    const topic = await new Topic(ctx.request.body).save()
    ctx.body = topic
  }

  async update(ctx) {
    ctx.verifyParams({
      name: { type: 'string', required: false },
      avatar_url: { type: 'string', required: false },
      introduction: { type: 'string', required: false }
    })
    const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
    ctx.body = topic
  }
}

module.exports = new TopicsCtl()