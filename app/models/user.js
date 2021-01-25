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
    select: false,
    type: [{
      type: Schema.Types.ObjectId,
      ref: 'Topic' // populate 读取详细信息
    }]
  },
  business: {
    type: Schema.Types.ObjectId, // 创建时候 使用id 字符串
    ref: 'Topic'
  },
  // 对象数组
  employments: {
    select: false,
    type: [
      {
        company: {
          type: Schema.Types.ObjectId,
          ref: 'Topic' // 引用// 创建时候 使用id 字符串
        },
        job: {
          type: Schema.Types.ObjectId,
          ref: 'Topic'
        }
      }
    ]
  },
  educations: {
    select: false,
    type: [{
      school: {type: String},
      major: { type: String },
      diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
      entrance_year: { type: Number },
      graduation_year: { type: Number }
    }]
  },
  // 关注数  存储id即可
  // 通过populate 拿到详细信息   我关注了谁
  following: {
    type: [{
      type: Schema.Types.ObjectId, // 用户 _id
      ref: 'User' // User model 名， 引用(跟user表对应)
    }],
    select: false
  },
  // 用户和话题多对多 (是topic 的_id  获取具体的使用populate)
  followingTopics: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Topic'
      }
    ],
    select: false
  }
}, {
  timestamps: {
    createdAt: 'created_time',
    updatedAt: 'updated_time'
  }
})

// 创建 user 表
module.exports = model('User', userSchema)