const Router = require('koa-router')

module.exports = function () {
  const router = new Router
  const routers = [
    './record',
    './publish',
    './article',
    './category',
    // './upload-image'
  ]

  for (let module_path of routers) {
    const mrouter = require(module_path)()
    router.use('', mrouter.routes(), mrouter.allowedMethods())
  }

  return router
}
