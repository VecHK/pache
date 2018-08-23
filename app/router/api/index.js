const root_dir = require('app-root-path').toString()
const path = require('path')
const Router = require('koa-router')
const router = new Router

module.exports = function (app, envir) {
  const bodyParser = require('koa-bodyparser')
  router.use(bodyParser({
    strict: false,
    enableTypes: ['json', 'form'],
    formLimit: '32768kb'
  }))

  // API Extend
  const extend = require('./extend')()
  extend(app)
  router.use('/api', extend.middleWare)

  // 登录
  const authRouter = require('./auth')()
  router.use('/api', authRouter.routes(), authRouter.allowedMethods())

  // API
  const adminApiRouter = require('./admin')()
  router.use('/api', adminApiRouter.routes(), adminApiRouter.allowedMethods())

  app.use(router.routes(), router.allowedMethods())
}
