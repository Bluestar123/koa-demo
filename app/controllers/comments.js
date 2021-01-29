const Comment = require('../models/comments')

class CommentsCtl {
  async find(ctx) {
    let { limit = 10, page = 1 } = ctx.query
    limit = Math.max(+page, 10)
    page = Math.max
    const q = new RegExp(ctx.query.q)
    const { questionId, answerId } = ctx.params

    // 查找二级评论
    const { rootCommentId } = ctx.query // 当前的根是谁
    ctx.body = await Comment.find(({ content: q, questionId, answerId, rootCommentId }))
                      .limit(limit).skip(page * limit).populate('commentator replyTo')
  }

  async checkCommentExist(ctx) {
    const comment = await Comment.findById(ctx.params.id).select('+commentator')
    if (!comment) {
      ctx.throw(404, '评论不存在')
    }
    if (ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId) {
      ctx.throw(404, '该问题下没有此评论')
    }
    if (ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId) {
      ctx.throw(404, '该答案下没有此评论')
    }
    ctx.state.comment = comment
    await next()
  }

  async findById(ctx) {
    const { fields = '' } = ctx.query
    const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
    let comment = await Topic.findById(ctx.params.id).select(selectFields).populate('commentator')
    ctx.body = comment
  }

  async create(ctx) {
    // 有请求体要校验
    ctx.verifyParams({
      content: { type: 'string', required: true },
      // 如果是二级评论就增加这两个属性
      rootCommentId: { type: 'string', required: false },
      replyTo: { type: 'string', required: false }
    })
    const comment = await new Comment({...ctx.request.body, commentator: ctx.state.user._id, questionId: ctx.params.questionId, answerId: ctx.params.answerId}).save()
    ctx.body = comment
  }

  // 只有提问题的人才能修改删除
  async checkCommentator(ctx, next) {
    const { comment } = ctx.state
    if (comment.commentator.toString() !== ctx.state.user._id) {
      ctx.throw(403, '暂无权限操作')
    }
    await next()
  }

  async update(ctx) {
    ctx.verifyParams({
      content: { type: 'string', required: true },
    })

    // 因为id有归属关系，只更新content
    const { content } = ctx.request.body
    // 查一次id，保存
    await ctx.state.comment.update({ content })
    ctx.body = ctx.state.comment
  }

  async delete(ctx) {
    let comment = await Comment.findByIdAndRemove(ctx.params.id)
    ctx.status = 204
    // ctx.body = Comment
  }
}

module.exports = new CommentsCtl()