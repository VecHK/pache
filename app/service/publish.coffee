envir = require '../../envir'
isNum = require 'is-number'
{ Publish } = require '../model'
RecordService = require('./record')

class PublishService extends require './service'
  create: (data) ->
    publish = new Publish data
    publish.output = { _isOutput: true }
    publish.save()

  destroy: (id) ->
    publish = await this.get id

    await RecordService.getRecordsByPublishId(publish.record).remove()

    publish.remove()

  _get: (_id) => Publish.findOne { _id }

  get: (id, populate) ->
    id = String id

    if populate
      publish = await (this._get id).populate('record').exec()
    else
      publish = await this._get id

    unless publish
      throw this.Error 'publish not found', 404

    return publish

  count: (conditions = {}) ->
    Publish.find(conditions).countDocuments()

  list: (conditions = {}, populate = false, page, limit = 10, dateSort = -1) ->
    if !isNum(page) || page < 1
      throw Object.assign(
        new Error('page must be Integer and greater or equal to 1'),
        { statusCode: 400 }
      )

    start = (page - 1) * limit

    mon = Publish.find(conditions)
      .sort({ date: dateSort })
      .skip(start)
      .limit(limit)

    if populate
      mon.populate('record').exec()
    else
      mon.exec()

  categoryIdCondition: (conditions, category_id) ->
    if typeof category_id is 'string'
      conditions.category = category_id

  tagsCondition: (conditions, tags) ->
    unless Array.isArray tags
      return

    if tags.length
      conditions.tags = { $all: tags }
    else
      conditions.tags = []

  getList: (opt = {}) ->
    { limit } = envir
    conditions = {}
    { page, category_id, tags, populate = false } = opt

    this.categoryIdCondition(conditions, category_id)
    this.tagsCondition(conditions, tags)

    count = await this.count(conditions)
    list = await this.list(conditions, populate, page)

    return {
      page,
      total_page: Math.ceil(count / limit),
      limit,
      count,
      list,
    }

  release: (id, record_id) ->
    id = String id
    publish = await this._get id
    unless publish
      throw this.Error('publish not found', 404)

    record = await RecordService.get(record_id)
    if record.publish_id is publish.record
      publish.record = record._id
      publish.save()
    else
      throw this.Error 'record is not belongs this publish', 403

module.exports = new PublishService
