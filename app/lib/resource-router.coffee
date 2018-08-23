inflected = require 'inflected'

detectControllerMethod = (controller, method_name) ->
  (ctx, next) ->
    if controller[method_name]
      controller[method_name] ctx
    else
      next()

pluralizePath = (path) ->
  pluralized = path.split '/'
  last_word = pluralized.pop()
  pluralized.push inflected.pluralize last_word
  return pluralized.join '/'

fillPage = (ctx, next) ->
  ctx.params.page = 1 if ctx.params
  next()

module.exports = (router, path, ...middlewares) ->
  throw Error 'need a Controller' unless middlewares.length

  controller = middlewares.pop()

  detectController = (method_name) =>
    detectControllerMethod controller, method_name

  if path[path.length - 1] is '/'
    path = path.substr 0, path.length - 1

  router
    .get "#{path}/:id", ...middlewares, detectController 'get'
    .post "#{path}", ...middlewares, detectController 'destroy'
    .patch "#{path}/:id", ...middlewares, detectController 'update'
    .delete "#{path}/:id", ...middlewares, detectController 'destroy'

  pluralized = pluralizePath path
  router
    .get "#{pluralized}", fillPage, ...middlewares, detectController 'getList'
    .get "#{pluralized}/:page", ...middlewares, detectController 'getList'
