const service = require('../service/article')

module.exports = new class {
  // 创建文章
  async create(ctx) {
    const { body } = ctx.request

    ctx.backCreated(await service.create(body))
  }

  // 删除文章
  async destroy(ctx) {
    const { id } = ctx.params
    ctx.back(await service.destroy(id))
  }

  // 删除多个文章
  async destroyMulti(ctx) {
    let ids = ctx.request.body
    ctx.back(await service.destroyMulti(ids))
  }

  // 获取文章
  async get(ctx) {
    const { id } = ctx.params
    ctx.back(await service.get(id))
  }

  // 获取文章列表
  async getList(ctx) {
    let page = parseInt(ctx.params.page)

    if (!(Number.isInteger(page) && page > 0)) {
      page = 1
    }

    ctx.back(await service.getList({ page }))
  }

  // 更新文章
  async update(ctx) {
    let { id } = ctx.params
    let { body } = ctx.request

    const result = await service.update(id, body)

    ctx.back(await service.get(id))
  }

  // 更新多篇文章
  async updateMulti(ctx) {
    let { ids, data } = ctx.request.body
    ctx.back(await service.updateMulti(ids, data))
  }
}
