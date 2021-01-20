const mongoose = require('mongoose')

// schema 类  // 增删改查 给予model
const { Schema, model } = mongoose

// 通过schema 设计出表结构，嵌套的复杂结构也可以
// 用户唯一性
const userSchema = new Schema({
  __v: {
    type: Number,
    select: false
  },
  name: {
    type: String,// 传入会被转成 string
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false, // 不会返回
  },
  avatar_url: { type: String },
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male',
    required: true
  },
  // 一句话介绍
  headline: {
    type: String
  },
  // 字符串数组
  locations: {
    type: [{
      type: String
    }]
  },
  business: {
    type: String
  },
  // 对象数组
  employments: {
    type: [
      {
        company: {
          type: String
        },
        job: {
          type: String
        }
      }
    ]
  },
  educations: {
    type: [{
      school: {type: String},
      major: { type: String },
      diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
      entrance_year: { type: Number },
      graduation_year: { type: Number }
    }]
  }
  // age: {
  //   type: Number,
  //   required: false,
  //   default: 0
  // }
})

// 创建 user 表
module.exports = model('User', userSchema)