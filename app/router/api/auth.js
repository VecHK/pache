const root_dir = require('app-root-path').toString()
const path = require('path')
const Router = require('koa-router')
const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const envir = require(path.join(root_dir, './envir'))
const randomString = require(path.join(root_dir, './app/lib/random-string'))
const RANDOM_LENGTH = 16
module.exports = function () {
  const router = new Router

  router.get('/auth/random', async (ctx, next) => {
    ctx.session.random = randomString(RANDOM_LENGTH)
    ctx.back(ctx.session.random)
  })

  router.post('/auth/pass', async (ctx, next) => {
    const true_pass = md5(ctx.session.random + envir.pass)
    const body_pass = ctx.request.body

    ctx.session.is_login = (true_pass === body_pass)
    ctx.back(ctx.session.is_login)
  })

  router.get('/auth/status', async (ctx, next) => {
    ctx.back(Boolean(ctx.session.is_login))
  })

  router.get('/auth/logout', async (ctx, next) => {
    ctx.back((delete ctx.session.is_login) && (delete ctx.session.random))
  })

  router.all('/*', async (ctx, next) => {
    if (ctx.session.is_login) {
      return next()
    } else {
      return ctx.backUnauthorized('需要登录')
    }
  })

  return router
}
