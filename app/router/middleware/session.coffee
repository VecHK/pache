session = require 'koa-generic-session'
redisStore = require 'koa-redis'

module.exports = (app) ->
  app.use session
    prefix: 'pache:sess'
    store: redisStore()

    cookie:
      path: '/',
      httpOnly: true,
      maxAge: 3 * 60 * 60 * 1000 # 3 hours
      overwrite: true
      signed: true
