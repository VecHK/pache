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
    const list = await service.getList()

    ctx.back({
      left: list.filter(category => category.position === 'left'),
      right: list.filter(category => category.position === 'right')
    })
  }

  // 获取分类
  async get(ctx) {
    ctx.back(await service.get(ctx.params.id))
  }

  // 修改分类
  async patch(ctx) {
    const { id } = ctx.params
    const { body } = ctx.request
    delete body._id

    ctx.back(await service.update(id, body))
  }
}
