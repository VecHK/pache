const root_dir = require('app-root-path').resolve
const controller = require(root_dir('./app/controller/category'))

const Router = require('koa-router')
module.exports = function () {
  const router = new Router

  router.get('/categories', controller.getList)
  router.post('/category', controller.create)
  router.patch('/category/:id', controller.update)
  router.delete('/category/:id', controller.destroy)

  return router
}
