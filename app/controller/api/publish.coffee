ArticleService = require '../../service/article'
PublishService = require '../../service/publish'

module.exports = new class PublishController
  create: (ctx) ->
    { body } = ctx.request
    ctx.backCreated await PublishService.create body

  destroy: (ctx) ->
    ctx.back await PublishService.destroy ctx.params.id

  get: (ctx) ->
    ctx.back await PublishService.get ctx.params.id

  getList: (ctx) ->
    if ctx.query.limit
      limit = parseInt(ctx.query.limit)
    else
      limit = 10

    page = parseInt ctx.params.page
    unless Number.isInteger(page) && page > 0
      page = 1

    ctx.back(
      await PublishService.getList({
        page,
        limit
      })
    )

  update: (ctx) ->

  release: (ctx) ->
    { id, record_id } = ctx.params
    ctx.back await PublishService.release id, record_id
