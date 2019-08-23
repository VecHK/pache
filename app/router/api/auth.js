const root_dir = require('app-root-path').toString()
const path = require('path')
const Router = require('koa-router')
const jwt = require('jsonwebtoken')
const koa_jwt = require('koa-jwt')
const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const envir = require(path.join(root_dir, './envir'))
const randomString = require(path.join(root_dir, './app/lib/random-string'))
const RANDOM_LENGTH = 16
module.exports = function () {
  const router = new Router

  router.post('/auth/login', async (ctx, next) => {
    const true_pass = md5(envir.pass)
    const body_pass = ctx.request.body.pass

    if (true_pass === body_pass) {
      const token = jwt.sign({
        status: true
      }, envir.JWT_TOKEN_SECRET, { expiresIn: '10m' })

      ctx.back(token)
    } else {
      ctx.backForbidden('invalid pass')
    }
  })

  const jwtMiddleware = koa_jwt({
    secret: envir.JWT_TOKEN_SECRET
  })
  router.all('/*', async function () {
    try {
      await jwtMiddleware.call(this, ...arguments)
    } catch (err) {
      throw Object.assign(err)
    }
  })

  router.all('/*', async (ctx, next) => {
    if (ctx.state.user.status) {
      return next()
    } else {
      return ctx.backUnauthorized('需要登录')
    }
  })

  router.get('/auth/test', async (ctx, next) => {
    ctx.back('test')
  })

  return router
}
