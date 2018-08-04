Router = require 'koa-router'

article_generate = require './article'

module.exports = (app, envir) ->
  router = new Router

  article = article_generate()

  router.use '/article', article.routes(), article.allowedMethods()

  app.use router.routes(), router.allowedMethods()
