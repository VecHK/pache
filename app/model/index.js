const mongoose = require('mongoose')
const EventEmitter = require('events')
const envir = require('../../envir')

const model = new EventEmitter
module.exports = model

Object.assign(model, {
  Category: require('./category') && mongoose.model('Category'),

  Record: require('./record') && mongoose.model('Record'),

  Publish: require('./publish') && mongoose.model('Publish'),

  async connect() {
    try {
      const result = await mongoose.connect(envir.db, {
        useNewUrlParser: true,
        poolSize: 20
      })
      model.removeCollection = mongoose.connection.db.dropCollection.bind(mongoose.connection.db)
      return result
    } catch (err) {
      console.error('数据库连接似乎出现了问题', err)
      process.exit(-1)
    }
  },

  mongoose,

  async refreshContent(cb) {
    await this.connectStatus

    const all_article = await this.Article.find({})
    for (let cursor = 0; cursor < all_article.length; ++cursor ) {
      let article = all_article[cursor]
      await this.Article.update({ _id: article._id }, article)

      cb && cb(article, cursor, all_article)
    }
  },
})

model.connectStatus = model.connect()
