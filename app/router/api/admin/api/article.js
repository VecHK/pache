const root_dir = require('app-root-path').resolve

const controller = require(root_dir('./app/controller/article'))
const Router = require('koa-router')

module.exports = function () {
  const router = new Router

  router.get('/articles/:page', controller.getList)

  router.patch('/article/:id', controller.update)
  router.patch('/articles', controller.updateMulti)

  router.delete('/article/:id', controller.destroy)
  router.delete('/articles', controller.destroyMulti)

  router.get('/article/:id', controller.get)

  router.post('/article', controller.create)

  return router
}
