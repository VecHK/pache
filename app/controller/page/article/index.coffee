root_dir = (require 'app-root-path')
isObjectId = (require 'mongoose').Types.ObjectId.isValid

service = require root_dir.resolve 'app/service/article'
draft_article = require './draft-article'

module.exports = new class
  get: (ctx, next) ->
    { id } = ctx.params

    return next() if !isObjectId id

    article = await service._get(id)

    if !article
      ctx.status = err.statusCode
      await ctx.render 'article/notfound', {}, true
    else
      article = draft_article(article) if article.is_draft
      await this.showArticlePage article, ctx

  showArticlePage: (article, ctx) ->
    await ctx.render 'article/found', { article }, true
