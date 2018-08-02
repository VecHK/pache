const envir = require('../../envir')
const { Article } = require('../model')

module.exports = new class {
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

  async get(id) {
    id = String(id)
    const article = await Article.findOne({ _id: id })
    if (!article) {
      throw Object.assign(new Error('article not found'), { code: 404 })
    }

    return article
  }

  /* 有標籤的文章搜索，無標籤的文章搜索 */
  _applyTagsConditions(conditions) {
    if (Array.isArray(conditions.tags) && conditions.tags.length) {
      conditions.tags = { $all: conditions.tags };
    } else if (Array.isArray(conditions.tags)) {
      conditions.tags = [];
    } else {
      delete conditions.tags
    }
    return this;
  }

  _applyCategoryConditions(conditions){
    if (typeof(conditions.category) === 'string') {

    } else {
      delete conditions.category
    }
    return this;
  }

  count(conditions = {}){
    this._applyTagsConditions(conditions)
    this._applyCategoryConditions(conditions)

    return Article.find(conditions).count()
  }

  list(page, conditions = {}, dateSort = -1){
    let start = (page - 1) * envir.limit;
    if (!Number.isInteger(page) || page < 1) {
      let err = new Error('page must be Integer and greater or equal to 1');
      err.status = 500;
      return Promise.reject(err)
    }

    this._applyTagsConditions(conditions)
    this._applyCategoryConditions(conditions)

    return Article.find(conditions)
      .sort({date: dateSort})
      .skip(start)
      .limit(envir.limit)
      .exec()
  }

  async getList(opt = {}) {
    const { page } = opt
    const { conditions = {} } = opt

    const count = await this.count(conditions)
    const list = await this.list(page, conditions)

    return {
      page,
      total_page: Math.ceil(count / envir.limit),
      limit: envir.limit,
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
