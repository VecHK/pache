const fs = require('mz/fs')
const path = require('path')
const root_dir = require('app-root-path').toString()
const pache_static = require('../lib/pache-static')

module.exports = function (app, envir) {
  app.use(pache_static({
    path: path.join(root_dir, './app/page-dist/'),

    enable_modified_cache: true,
  }))

  app.use(pache_static({
    path: path.join(root_dir, './app/static/'),

    enable_modified_cache: true,
  }))

  app.use(pache_static({
    path: path.join(root_dir, './app/public/'),

    enable_modified_cache: true,
  }))
  const send = require('koa-send')
  const ROOT_DIR = __dirname
  const IMG_POOL_PATH = envir.IMAGE_PATH || path.join(__dirname, '/img_pool')

  app.use(async (ctx, next) => {
    let {dir, base} = path.parse(ctx.path)
    const filePath = path.join(IMG_POOL_PATH, base)
    if ('/img-pool' !== dir) {
      await next()
    } else if (!await fs.exists(filePath)) {
      await next()
    } else {
      const mod_time = (await fs.stat(filePath)).mtime.toGMTString()
      const {header} = ctx.request
      const modProp = 'if-modified-since'
      if (header[modProp] && (header[modProp] === mod_time)) {
        ctx.status = 304
        return
      } else {
        ctx.response.set('Last-Modified', mod_time)
        await send(ctx, base, { root: IMG_POOL_PATH })
      }
    }
  })
  envir.ESD_ENABLE && app.use(async (ctx, next) => {
    for (let esd_path of envir.ESD_LIST) {
      const filePath = path.join(esd_path, decodeURIComponent(ctx.path))
      if (await fs.exists(filePath)) {
        const {dir, base} = path.parse(filePath)
        await send(ctx, base, { root: dir })
        return
      }
    }
    await next()
  })
}
