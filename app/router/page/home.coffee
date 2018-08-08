Router = require 'koa-router'
root_dir = require 'app-root-path'
Controller = require "#{root_dir.resolve('app/controller/page/home')}"

fill_page = (ctx, next) ->
  ctx.params.page = 1
  next()

module.exports = () ->
  router = new Router

  { getList } = Controller

  router
    .get '/category/:category/:page', getList
    .get '/category/:category/', fill_page, getList

    .get '/tag/:tags/:page', getList
    .get '/tag/:tags/', fill_page, getList

    .get '/category/:category/tag/:tags/:page', getList
    .get '/category/:category/tag/:tags/', fill_page, getList

    .get '/:page', getList
    .get '/', fill_page, getList
