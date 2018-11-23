root_dir = (require 'app-root-path').resolve

service = require root_dir 'app/service/publish'

isObjectId = require root_dir 'app/lib/is-object-id'

draftArticle = require './draft-article'

module.exports = new class extends require('../../')
  get: (ctx, next) ->
    { id } = ctx.params

    return next() if !isObjectId id

    article = await service._get(id)

    if !article
      ctx.status = 404
      await ctx.render 'article/notfound', {}, true
    else
      article = draftArticle(article) if article.is_draft
      await @showArticlePage article, ctx

  showArticlePage: (article, ctx) ->
    await ctx.render 'article/found', { article }, true
