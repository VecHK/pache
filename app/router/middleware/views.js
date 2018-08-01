const path = require('path')
const root_dir = require('app-root-path').toString()
const Views = require('koa-pug')
const npmPackage = require(path.join(root_dir, 'package.json'))

module.exports = function (app, envir) {
  const pug = new Views({
    viewPath: path.join(root_dir, '/app/views'),
    app,
  })

  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      ctx.status = 500
      await ctx.render('error-page', {
        error,
        npmPackage,
        envir: Object.assign({}, envir),
      })
    }
  })
}
