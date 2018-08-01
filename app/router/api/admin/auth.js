const root_dir = require('app-root-path').toString()
const path = require('path')
const Router = require('koa-router')
const serve = require('koa-static')
const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const envir = require(path.join(root_dir, './envir'))
const randomString = require(path.join(root_dir, './app/tools/random-string'))
const RANDOM_LENGTH = 16
module.exports = function () {
  const router = new Router

  // router.use('/auth/*', async (ctx, next) => {
  //   ctx.apiBack = {
  //     code: 0,
  //     msg: '(缺省)',
  //     result: null,
  //   };
  //   await next()
  // })

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

  // router.use('/auth/*', async (ctx, next) => {
  //   const {apiBack} = ctx
  //   ctx.type = 'application/json'
  //
  //   if (apiBack.status)
  //     ctx.status = apiBack.status
  //   else if (apiBack.code > 0)
  //     ctx.status = 500
  //   else if (apiBack.result)
  //     ctx.status = 200
  //   else
  //     ctx.status = 401
  //
  //   ctx.body = JSON.stringify(apiBack)
  // })

  // router.all('/*', async (ctx, next) => {
  //   if (!ctx.session.is_login) {
  //     ctx.back('需要登录', 401)
  //   } else {
  //     await next()
  //   }
  // })

  return router
}
