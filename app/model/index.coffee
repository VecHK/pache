mongoose = require 'mongoose'
EventEmitter = require 'events'
envir = require '../../envir'

model = new EventEmitter
module.exports = model

Object.assign model,
  Category: require('./category') && mongoose.model('Category')

  Record: require('./record') && mongoose.model('Record')

  Publish: require('./publish') && mongoose.model('Publish')

  Music: require('./music') && mongoose.model('Music')

  mongoose

  connect: () ->
    try
      result = await mongoose.connect(envir.db, {
        autoIndex: false,
        useNewUrlParser: true,
        poolSize: 20
      })

      model.removeCollection = mongoose.connection.db.dropCollection.bind(mongoose.connection.db)

      return result
    catch err
      console.error('数据库连接似乎出现了问题', err)
      process.exit(-1)

model.connectStatus = model.connect()
