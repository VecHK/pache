detectControllerMethod = (controller, method_name) ->
  (ctx, next) ->
    if controller[method_name]
      controller[method_name] ctx
    else
      next()

module.exports = (router, path, controller) ->
  detectController = (method_name) =>
    detectControllerMethod controller, method_name

  if path[path.length - 1] is '/'
    path = path.substr 0, path.length - 1

  router
    .get "#{path}/:id", detectController 'get'
    .post "#{path}", detectController 'destroy'
    .patch "#{path}/:id", detectController 'update'
    .delete "#{path}/:id", detectController 'destroy'
