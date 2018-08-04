root_dir = (require 'app-root-path').resolve

service = require root_dir 'app/service/article'

isObjectId = (require 'mongoose').Types.ObjectId.isValid

draftArticle = require './draft-article'

module.exports = new class
  get: (ctx, next) ->
    { id } = ctx.params

    return next() if !isObjectId id

    article = await service._get(id)

    if !article
      ctx.status = err.statusCode
      await ctx.render 'article/notfound', {}, true
    else
      article = draftArticle(article) if article.is_draft
      await @showArticlePage article, ctx

  showArticlePage: (article, ctx) ->
    await ctx.render 'article/found', { article }, true
