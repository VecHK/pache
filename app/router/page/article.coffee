Router = require 'koa-router'
root_dir = require 'app-root-path'

Controller = require "#{root_dir.resolve('app/controller/page/article')}"

module.exports = () ->
  router = new Router

  router.get '/:id', Controller.get
