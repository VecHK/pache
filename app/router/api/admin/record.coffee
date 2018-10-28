root_dir = require('app-root-path').resolve

resource = require root_dir 'app/lib/resource-router'

RecordController = require root_dir 'app/controller/api/record'

Router = require 'koa-router'

module.exports = () ->
  router = new Router

  resource router, '/record', RecordController

  return router
