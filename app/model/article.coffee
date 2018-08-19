envir = require '../../envir'
mongoose = require 'mongoose'
{ Schema } = mongoose
{ ObjectId } = Schema.Types

ArticleSchema = new Schema
  title:
    type: String
    default: '(title)'

  content:
    type: String
    default: '(empty)'

  content_type:
    type: String
    default: 'text'
    enum: [
      'text'      # 纯文本
      'html'      # HTML
      'markdown'  # Markdown
      'pache'     # Pache 格式
    ]

  created_at:
    type: Date
    default: Date.now

  updated_at:
    type: Date
    default: Date.now

mongoose.model 'Article', ArticleSchema
