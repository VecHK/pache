const root_dir = require('app-root-path').toString()
const path = require('path')
const envir = require(path.join(root_dir, 'envir'))
const Model = require(path.join(root_dir, './app/model'))
const libArticle = require(path.join(root_dir, './app/lib/article'))

const Router = require('koa-router')

module.exports = function () {
  const router = new Router

  router.get('/topic', async (ctx, next) => {
    const topic = await Model.Article.findOne().sort({ date: -1 })
    ctx.back(topic)
  })

  router.get('/articles/:pagecode', async (ctx, next) => {
    let pagecode = parseInt(ctx.params.pagecode)

    if (!(Number.isInteger(pagecode) && pagecode > 0)) {
      pagecode = 1
    }

    let list = await libArticle.list(pagecode, {})

    const count = await libArticle.count()
    ctx.back({
      total_page: Math.ceil(count / envir.limit),
      count,
      list,
    })
  })

  router.patch('/article/:id', async (ctx, next) => {
    let {id} = ctx.params
    let fields = ctx.request.body
    Object.assign(fields, { mod: new Date })

    ctx.back(await Model.Article.update(
      { _id: id },
      fields
    ))
  })

  router.patch('/articles', async (ctx, next) => {
    let { ids, fields } = ctx.request.body
    Object.assign(fields, { mod: new Date })
    ctx.back(await Model.Article.update(
      { _id: { $in: ids } },
      fields,
      { multi: true }
    ))
  })

  router.delete('/articles', async (ctx, next) => {
    let ids = ctx.request.body

    if (!Array.isArray(ids)) {
      ctx.backBadRequest('ids 不是一個數組')
    } else {
      ctx.back(await Model.Article.find({
        _id: { $in: ids }
      }).remove())
    }
  })

  router.get('/article/:articleid', async (ctx, next) => {
    const article = await Model.Article.findOne({
      _id: ctx.params.articleid
    })

    if (article) {
      ctx.back(article)
    } else {
      ctx.backNotFound('article not found')
    }
  })

  router.post('/article', async (ctx, next) => {
    const { body } = ctx.request

    delete body._id
    const article = new Model.Article(body)
    ctx.backCreated(await article.save())
  })

  return router
}
