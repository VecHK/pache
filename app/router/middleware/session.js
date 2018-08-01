const convert = require('koa-convert')
const koa_session = require('koa-session-redis')

module.exports = function (app) {
  const session_handle = convert(koa_session({
    key: 'pache:sess', /** (string) cookie key (default is koa:sess) */
    cookie: {
      maxage: 86400000, // cookie 有效期
      maxAge: 86400000, // cookie 有效期
      overwrite: true, /** (boolean) can overwrite or not (default true) */
      httpOnly: true, /** (boolean) httpOnly or not (default true) */
      signed: true, /** (boolean) signed or not (default true) */
    },
    store: {
      host: process.env.SESSION_PORT_6379_TCP_ADDR || '127.0.0.1',
      port: process.env.SESSION_PORT_6379_TCP_PORT || 6379,
      ttl: 3600,
    },
  }))

  app.use(session_handle)
}
