const envir = require('../../envir')
const { Category } = require('../model')

module.exports = new class extends require('./service') {
  create(data) {
    delete data._id
    const category = new Category(data)
    return category.save()
  }

  async destroy(id) {
    const category = await this.get(id)
    return category.remove()
  }

  async get(id) {
    id = String(id)
    const category = await Category.findById(id)
    if (!category) {
      throw this.Error('category not found', 404)
    }

    return category
  }

  getList() {
    return Category.find().sort({ 'sort': 1 })
  }

  async update(id, data) {
    const category = await this.get(id)

    if (category.name !== data.name) {
      const check_category = await Category.findOne({ name: category.name })
      if (check_category) {
        throw this.Error('duplicate category name', 409)
      }
    }

    delete data._id
    return Category.update(
      { _id: String(id) },
      { $set: data, orz: 1 }
    ).then(() => {
      return this.get(id)
    })
  }

}
