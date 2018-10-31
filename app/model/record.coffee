envir = require '../../envir'
mongoose = require 'mongoose'
{ Schema } = mongoose
{ ObjectId } = Schema.Types

RecordSchema = new Schema
  publish_id:
    type: ObjectId
    required: true

  content:
    type: String
    default: '(empty)'

  content_type:
    type: String
    default: 'pache'
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

mongoose.model 'Record', RecordSchema
