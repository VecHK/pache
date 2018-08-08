const envir = require('../../envir')
const { Article } = require('../model')
const clone = require('../lib/clone')
const isNum = require('is-number')

class ArticleService {
  create(data) {
    delete data._id
    const article = new Article(data)
    return article.save()
  }

  async destroy(id) {
    const article = await this.get(id)
    return article.remove()
  }

  destroyMulti(ids) {
    ids = ids.map(id => String(id))

    return Article.find({
      _id: { $in: ids }
    }).remove()
  }

  _get(id) {
    return Article.findOne({ _id: id })
  }

  async get(id) {
    id = String(id)
    const article = await this._get(id)
    if (!article) {
      throw Object.assign(new Error('article not found'), { statusCode: 404 })
    }

    return article
  }

  static count(conditions = {}) {
    return Article.find(conditions).count()
  }

  static async list(page, conditions = {}, dateSort = -1, limit = envir.limit) {
    if (!isNum(page) || page < 1) {
      throw Object.assign(
        new Error('page must be Integer and greater or equal to 1'),
        { statusCode: 400 }
      )
    }

    let start = (page - 1) * limit

    return Article.find(conditions)
      .sort({date: dateSort})
      .skip(start)
      .limit(limit)
      .exec()
  }

  static categoryCondition(conditions, category) {
    if (typeof category === 'string') {
      conditions.category = category
    }
  }

  static tagsCondition(conditions, tags) {
    if (!Array.isArray(tags)) {
      return
    }

    if (tags.length) {
      conditions.tags = { $all: tags }
    } else {
      conditions.tags = []
    }
  }

  async getList(opt = {}) {
    const { limit } = envir
    const conditions = {}
    const { page, category, tags } = opt

    ArticleService.categoryCondition(conditions, category)
    ArticleService.tagsCondition(conditions, tags)

    const count = await ArticleService.count(conditions)
    const list = await ArticleService.list(page, conditions)

    return {
      page,
      total_page: Math.ceil(count / limit),
      limit,
      count,
      list,
    }
  }

  update(id, data) {
    id = String(id)
    delete data._id

    return Article.update(
      { _id: id },
      Object.assign(data, { mod: new Date })
    )
  }

  updateMulti(ids = [], data) {
    delete data._id

    ids = ids.map(id => String(id))

    return Article.update(
      { _id: { $in: ids } },
      Object.assign(data, { mod: new Date }),
      { multi: true }
    )
  }
}

module.exports = new ArticleService
