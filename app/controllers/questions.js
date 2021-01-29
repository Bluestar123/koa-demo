const Question = require('../models/questions')

class QuestionsCtl {
  async find(ctx) {
    let { limit = 10, page = 1 } = ctx.query
    limit = Math.max(+page, 10)
    page = Math.max
    const q = new RegExp(ctx.query.q)
    ctx.body = await Question.find(({ $or: [{title: q}, {description: q}] }))
                      .limit(limit).skip(page * limit)
  }

  async checkQuestionExist(ctx) {
    const question = await Question.findById(ctx.params.id).select('+questioner')
    if (!question) {
      ctx.throw(404, '问题不存在')
    }
    // 和更新都用了findbyid，重复了，保存下
    ctx.state.question = question
    await next()
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    let question = await Topic.findById(ctx.params.id).select(selectFields).populate('questioner topics')
    ctx.body = question
  }

  async create(ctx) {
    // 有请求体要校验
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false }
    })
    const question = await new Question({...ctx.request.body, questioner: ctx.state.user._id}).save()
    ctx.body = question
  }

  // 只有提问题的人才能修改删除
  async checkQuestioner(ctx, next) {
    const { question } = ctx.state
    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, '暂无权限操作')
    }
    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      title: { type: 'string', required: true },
      description: { type: 'string', required: false }
    })
    // 查一次id，保存
    await ctx.state.question.update(ctx.request.body)
    ctx.body = ctx.state.question
  }

  async delete(ctx) {
    let question = await Question.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
    // ctx.body = question
  }
}

module.exports = new QuestionsCtl()