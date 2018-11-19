isNum = require 'is-number'
root_dir = (require 'app-root-path').resolve

publishService = require root_dir 'app/service/publish'
categoryService = require root_dir 'app/service/category'

isObjectId = (require 'mongoose').Types.ObjectId.isValid

envir = require root_dir 'envir'

module.exports = new class extends require '../../'
  processCategory: (ctx) ->
    { category } = ctx.params

    if typeof category != 'string'
      null
    else
      category = await categoryService._getByName(category)
      throw new Error 'category not found' if !category
      return category

  processTags: (ctx) ->
    { tags } = ctx.params
    if typeof tags != 'string'
      return null
    else
      tags.split ','
        .map (tag) -> tag.trim()
        .filter (tag) -> tag.length

  collectConditions: (category, tags) ->
    conditions = {}
    conditions.category = category if category
    conditions.tags = tags
    conditions.is_draft =
      $ne: true

    return conditions

  getList: (ctx, next) ->
    { page = 1 } = ctx.params
    return next() if !isNum page
    page = parseInt page

    category = await @processCategory ctx
    tags = @processTags ctx

    conditions = @collectConditions category, tags

    if category
      Object.assign conditions,
        category_id: category.id
        category_name: category.name

    result = await publishService.getList {
      category: conditions.category_id
      tags
      page
    }

    await ctx.render 'home/list', {
      category: category
      categories: await categoryService.getList()
      tags: tags

      limit: envir.limit
      page: page
      conditions: conditions

      count: result.count
      list: result.list
    }, true
