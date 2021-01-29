const mongoose = require('mongoose')
const { Schema, model } = mongoose

const commentSchema = new Schema({
  __v: {
    type: Number,
    select: false,
  },
  content: {
    type: String,
    required: true
  },
  commentator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false
  },
  questionid: {
    type: String,
    required: true
  },
  // 一对多
  answerId: {
    // 从属于 那个问题得答案
    // 一个 question 有多个答案，每个答案只有一个question
    type: String,
    required: true
  },
  rootCommentId: {// 归属谁
    type: String
  },
  replyTo: {// 回复给谁
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
})

module.exports = model('Comment', commentSchema)