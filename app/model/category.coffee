Model = require './index'
Mongoose = require 'mongoose'

# 分類的類型應該有三種：
#   普通分類
#
#   鏈接分類
#     指向某個鏈接（鏈接 URI 存在 value 中），也可以是某篇文章

CategorySchema = new Mongoose.Schema
  # 分类名
  name:
    type: String
    unique: true

  # 分类排序值
  sort:
    type: Number
    default: 0

  # 分类类型
  type:
    type: String
    default: 'category'
    enum: [ 'category', 'article', 'link' ]

  # 分类类型的值
  value: {}

  # 分类颜色
  color:
    type: String
    default: '#999'

  # 决定分类在文章列表页里的分类栏是放在左边还是右边
  position:
    required: true
    type: String
    enum: [ 'left', 'right' ]


cateUtils =
  checkName: (name) ->
    name == null || typeof(name.toString) != 'function'

CategoryModel = Mongoose.model 'Category', CategorySchema

CategorySchema.pre 'save', () ->
  topic = await CategoryModel.findOne().sort({ sort: -1 })

  unless topic
    @sort = 0
  else
    @sort = topic.sort + 1;

module.exports = CategoryModel
