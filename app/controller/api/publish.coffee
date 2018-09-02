articleService = require '../../service/article'
publishService = require '../../service/publish'

module.exports = new class PublishController
  create: (ctx) ->
    { body } = ctx.request
    ctx.backCreated await publishService.create body

  destroy: (ctx) ->
    ctx.back await publishService.destroy ctx.params.id

  get: (ctx) ->
    ctx.back await publishService.get ctx.params.id

  getList: (ctx) ->

  update: (ctx) ->
