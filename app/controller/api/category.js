const service = require('../../service/category')

module.exports = new class CategoryController {
  // 创建分类
  async create(ctx) {
    const { body } = ctx.request
    ctx.backCreated(await service.create(body))
  }

  // 删除分类
  async destroy(ctx) {
    const { id } = ctx.params

    ctx.back(await service.destroy(id))
  }

  // 获取分类列表
  async getList(ctx) {
    ctx.back(await service.getList())
  }

  // 更新分类
  async update(ctx) {
    const { id } = ctx.params
    const { body } = ctx.request
    delete body._id

    ctx.back(await service.update(id, body))
  }
}
