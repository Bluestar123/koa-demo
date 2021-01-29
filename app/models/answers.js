const mongoose = require('mongoose')
const { Schema, model } = mongoose

const answersSchema = new Schema({
  __v: {
    type: Number,
    select: false,
  },
  content: {
    type: String,
    required: true
  },
  answerer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    select: false
  },
  // 一对多
  questionId: {
    // 从属于 那个问题得答案
    // 一个 question 有多个答案，每个答案只有一个question
    type: String,
    required: true
  },
  voteCount: {
    type: Number,
    required: true,
    default: 0
  }
})

module.exports = model('Answer', answersSchema)