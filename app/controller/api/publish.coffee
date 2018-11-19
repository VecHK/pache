ArticleService = require '../../service/article'
PublishService = require '../../service/publish'

module.exports = new class PublishController
  create: (ctx) ->
    { body } = ctx.request
    ctx.backCreated await PublishService.create body

  # 删除发布
  # 删除前会检查锁定状态，若为锁定则无法删除
  destroy: (ctx) ->
    ctx.back await PublishService.destroy ctx.params.id

  # 获取发布
  get: (ctx) ->
    publish = (await PublishService.get ctx.params.id).toJSON()
    Reflect.deleteProperty(publish, 'record_key')
    ctx.back publish

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
    { params: { id }, request: { body } } = ctx
    ctx.back await PublishService.update id, body.data, body.record_key

  # 发布文章
  release: (ctx) ->
    { id, record_id } = ctx.params
    ctx.back await PublishService.release id, record_id

  # 锁定文章
  # 已锁定的文章如需延长锁定时长需要提交 record_key
  lock: (ctx) ->
    { id } = ctx.params
    { record_key } = ctx.request.body

    publish = await PublishService.get id

    if publish.record_lock and (record_key != publish.record_key)
      return ctx.backForbidden('invalid record_key')

    ctx.back {
      record_key: await PublishService.keepLockTime id
    }

  # 解锁文章
  unlock: (ctx) ->
    { id } = ctx.params
    { record_key } = ctx.request.body

    publish = await PublishService.get id

    if publish.record_lock and (record_key != publish.record_key)
      return ctx.backForbidden('invalid record_key')

    ctx.back await PublishService.clearLockTime id
