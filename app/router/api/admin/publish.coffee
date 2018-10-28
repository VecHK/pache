root_dir = require('app-root-path').resolve

resource = require root_dir 'app/lib/resource-router'

PublishController = require root_dir 'app/controller/api/publish'

Router = require 'koa-router'

module.exports = () ->
  router = new Router

  resource router, '/publish', PublishController
  router.patch '/publish/:id/release/:record_id', PublishController.release

  return router
