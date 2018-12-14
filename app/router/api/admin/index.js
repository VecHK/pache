const Router = require('koa-router')

module.exports = function () {
  const router = new Router
  const routers = [
    './record',
    './publish',
    './category',
    './music',
    './playlist',
    // './upload-image',
    // './upload-audio'
  ]

  for (let module_path of routers) {
    const mrouter = require(module_path)()
    router.use('', mrouter.routes(), mrouter.allowedMethods())
  }

  return router
}
