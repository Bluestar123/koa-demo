const Answer = require('../models/answers')

class AnswersCtl {
  async find(ctx) {
    let { limit = 10, page = 1 } = ctx.query
    limit = Math.max(+page, 10)
    page = Math.max
    const q = new RegExp(ctx.query.q)
    ctx.body = await Answer.find(({ content: q, questionId: ctx.params.questionId }))
                      .limit(limit).skip(page * limit)
  }

  async checkAnswerExist(ctx) {
    const answer = await Answer.findById(ctx.params.id).select('+Answerer')
    if (!answer) {
      ctx.throw(404, '答案不存在')
    }
    // 答案的所属问题id 是否与当前的问题id一致。 增删改查使用。 赞和踩不使用
    if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有子答案')
    }
    // 和更新都用了findbyid，重复了，保存下
    ctx.state.answer = answer
    await next()
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    let answer = await Topic.findById(ctx.params.id).select(selectFields).populate('answerer')
    ctx.body = answer
  }

  async create(ctx) {
    // 有请求体要校验
    ctx.verifyParams({
      content: { type: 'string', required: true }
    })
    const answer = await new Answer({...ctx.request.body, answerer: ctx.state.user._id, questionId: ctx.params.questionId}).save()
    ctx.body = answer
  }

  // 只有提问题的人才能修改删除
  async checkAnswerer(ctx, next) {
    const { answer } = ctx.state
    if (answer.Answerer.toString() !== ctx.state.user._id) {
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
    await ctx.state.Answer.update(ctx.request.body)
    ctx.body = ctx.state.Answer
  }

  async delete(ctx) {
    let Answer = await Answer.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
    // ctx.body = Answer
  }
}

module.exports = new AnswersCtl()