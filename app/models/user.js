const mongoose = require('mongoose')

// schema 类  // 增删改查 给予model
const { Schema, model } = mongoose

// 通过schema 设计出表结构，嵌套的复杂结构也可以
const userSchema = new Schema({
  name: {
    type: String,// 传入会被转成 string
    required: true
  },
  age: {
    type: Number,
    required: false,
    default: 0
  }
})

// 创建 user 表
module.exports = model('User', userSchema)