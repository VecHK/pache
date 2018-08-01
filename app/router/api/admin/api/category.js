const root_dir = require('app-root-path')

const Model = require(root_dir.resolve('./app/model'))
const libCategory = require(root_dir.resolve('./app/lib/category'))

const Router = require('koa-router')

module.exports = function () {
  const router = new Router

  router.get('/categories', async (ctx, next) => {
    const categories = await libCategory.getAll()

    if (Array.isArray(categories)) {
      ctx.back(categories)
    } else {
      ctx.back([])
    }
  })

  router.post('/category', async (ctx, next) => {
    const { body } = ctx.request
    const new_category = new Model.Category(body)

    ctx.backCreated(await new_category.save())
  })

  router.patch('/category/:id', async (ctx, next) => {
    const { id } = ctx.params
    const { body } = ctx.request
    delete body._id

    const category = await Model.Category.findOne({ _id: id })
    if (category) {
      Object.assign(category, body)
      ctx.back(await category.save())
    } else {
      ctx.backNotFound('category not found')
    }
  })

  router.delete('/category/:id', async (ctx, next) => {
    const { id } = ctx.params

    const category = await Model.Category.findOne({ _id: id })
    if (category) {
      ctx.backGone(await category.remove())
    } else {
      ctx.backNotFound('category not found')
    }
  })

  return router
}
