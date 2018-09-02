envir = require '../../envir'
mongoose = require 'mongoose'
{ Schema } = mongoose
{ ObjectId } = mongoose.Schema.Types

PublishSchema = new Schema
  # 可枚举性，若为 false 意味着不会显示在文章列表中，但仍可通过 URL 访问文章页
  enumerable:
    type: Boolean
    default: true

  # 文章状态
  status:
    disable_describe:
      type: Number
      enum: [ 403, 451 ]
    pass: String
    release_date: Date
    type:
      enum: [
        'hidden'      # 隐藏，访问文章页时返回 404
        'disable'     # 被禁用，访问文章页时应该返回一个 403/451
        'need_pass'   # 需要密码，`pass` 字段即密码（非明文保存
        'coming_soon' # 定时文章发布功能用，`release_date` 字段即发布的日期
        'normal'      # 通常
      ]

  # 发布日期，ISO 格式
  date:
    type: Date
    default: Date.now

  # 转载相关字段
  repost:
    type: Schema.Types.Mixed
    default: null

  is_draft:
    type: Boolean
    default: false

  article:
    required: true
    type: ObjectId
    ref: 'record'

  output:
    required: true
    type: Object

  tags:
    type: Array
    default: []

  category:
    default: null
    type: ObjectId
    ref: 'category'

  fusion_color:
    type: String
    default: '#CCC'

PublishSchema.set 'toJSON',
  virtuals: true

mongoose.model 'Publish', PublishSchema
