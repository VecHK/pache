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
        const same_name_category = await Category.findOne({ name: category.name })
        if (
          same_name_category &&
          same_name_category._id.toString() !== id
        ) {
          console.dir(same_name_category, { colors: true })
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
