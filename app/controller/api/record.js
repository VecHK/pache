const service = require('../../service/record')

module.exports = new class RecordController {
  // 创建文章记录
  async create(ctx) {
    const { data, record_key } = ctx.request.body

    ctx.backCreated(await service.create(data, record_key))
  }

  // 删除文章记录
  async destroy(ctx) {
    const { id } = ctx.params
    ctx.back(await service.destroy(id, ctx.query.record_key))
  }

  // 获取文章记录
  async get(ctx) {
    const { id } = ctx.params
    ctx.back(await service.get(id))
  }

  // 获取文章记录列表
  async getList(ctx) {
    let page = parseInt(ctx.params.page)
    if (!ctx.query.publish_id) {
      return ctx.backBadRequest(`required 'publish_id' query`)
    }
    const publish_id = String(ctx.query.publish_id)

    let limit
    if (ctx.query.limit) {
      limit = parseInt(ctx.query.limit)
    } else {
      limit = 10
    }

    if (!(Number.isInteger(page) && page > 0)) {
      page = 1
    }

    ctx.back(
      await service.getList({
        publish_id,
        page,
        limit
      })
    )
  }

  // 更新文章记录
  async patch(ctx) {
    let { id } = ctx.params
    let { body } = ctx.request

    const result = await service.update(id, body)

    ctx.back(await service.get(id))
  }
}
