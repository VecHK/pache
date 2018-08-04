const compress = require('koa-compress')

module.exports = function (app, envir) {
  const GZIPMIME = /text|application|json|javascript/i
  if (envir.GZIP_ENABLE) {
    app.use(compress({
      filter: GZIPMIME.test.bind(GZIPMIME),
      threshold: 2048,
      flush: require('zlib').Z_SYNC_FLUSH
    }))
  }
}
