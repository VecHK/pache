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
        autoIndex: false,
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

  mongoose
})

model.connectStatus = model.connect()
