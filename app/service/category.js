const envir = require('../../envir')
const { Category } = require('../model')

module.exports = new class extends require('./service') {
  async create(data) {
    delete data._id

    if (await this._getByName(data.name)) {
      throw this.Interrup('duplicate category name', 409)
    }

    const category = new Category(data)

    return category.save()
  }

  async destroy(id) {
    const category = await this.get(id)
    return category.delete()
  }

  async get(id) {
    id = String(id)
    const category = await Category.findById(id)
    if (!category) {
      throw this.Interrup('category not found', 404)
    }

    return category
  }

  async _getByName(name) {
    return Category.findOne({ name })
  }

  async getList() {
    const categories = await Category.find().sort({ 'sort': 1 })
    if (Array.isArray(categories)) {
      return categories
    } else {
      return []
    }
  }

  async update(id, data) {
    const category = await this.get(id)

    if (data.hasOwnProperty('name')) {
      if (category.name !== data.name) {
        const duplicate_name_category = await this._getByName(data.name)
        if (
          duplicate_name_category &&
          duplicate_name_category._id.toString() !== id
        ) {
          throw this.Interrup('duplicate category name', 409)
        }
      }
    }

    delete data._id
    return Category.updateOne(
      { _id: String(id) },
      { $set: data, orz: 1 }
    ).then(() => {
      return this.get(id)
    })
  }
}
