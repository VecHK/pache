const Model = require('./index')
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ObjectId = mongoose.Schema.Types.ObjectId;

/*
  分類的類型應該有三種：
    普通分類

    鏈接分類
      指向某個鏈接（鏈接 URI 存在 value 中），也可以是某篇文章

*/

const CategorySchema = new Schema({
  value: {
  },
  name: {
    type: String,
    unique: true,
  },
  sort: {
    type: Number,
    default: 0
  },
  type: {
    type: String,
    default: 'category'
  },
  color: {
    type: String,
    default: '#999'
  },
});

const cateUtils = {
  checkName(name) {
    return name === null || typeof(name.toString) !== 'function'
  }
};

CategorySchema.pre('save', async function () {
  const topic = await CategoryModel.findOne().sort({ sort: -1 })
  if (topic === null) {
    this.sort = 0;
  } else {
    this.sort = topic.sort + 1;
  }
});

const CategoryModel = mongoose.model('Category', CategorySchema);
module.exports = CategorySchema
