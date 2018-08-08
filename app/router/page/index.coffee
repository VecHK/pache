Router = require 'koa-router'

article_generate = require './article'

home_generate = require './home'

module.exports = (app, envir) ->
  router = new Router

  article = article_generate()
  router.use '/article', article.routes(), article.allowedMethods()

  home = home_generate()
  router.use '', home.routes(), home.allowedMethods()

  app.use router.routes(), router.allowedMethods()
