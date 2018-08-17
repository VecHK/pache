const envir = require('../../envir')

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CategoryModel = mongoose.model('Category')

const ObjectId = mongoose.Schema.Types.ObjectId

const ArticleSchema = new Schema({
  status: { type: Number, default: 0 },

  record_id: { type: ObjectId, require }

  article: {
    type: ObjectId,
    ref: 'Article'
  }
})

mongoose.model('Article', ArticleSchema)
