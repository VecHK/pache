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

  // 获取登录用的 token 和 盐
  // token 有效期 10s
  router.get('/auth/login-info', async (ctx, next) => {
    const login_info = {
      salt: randomString(RANDOM_LENGTH)
    }
    const token = jwt.sign(login_info, envir.JWT_TOKEN, { expiresIn: '10s' })
    ctx.back({
      salt: login_info.salt,
      token
    })
  })

  router.post('/auth/login', async (ctx, next) => {
    const login_info = jwt.verify(ctx.request.body.token, envir.JWT_TOKEN)

    const true_pass = md5(login_info.salt + envir.pass)
    const body_pass = ctx.request.body.pass

    if (true_pass === body_pass) {
      const token = jwt.sign({
        status: true
      }, envir.JWT_TOKEN, { expiresIn: '10m' })

      ctx.back(token)
    } else {
      ctx.backForbidden('invalid pass')
    }
  })

  router.all('/*', koa_jwt({
    secret: envir.JWT_TOKEN
  }))

  router.all('/*', async (ctx, next) => {
    if (ctx.state.user.status) {
      return next()
    } else {
      return ctx.backUnauthorized('需要登录')
    }
  })

  return router
}
