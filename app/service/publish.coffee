envir = require '../../envir'
isNum = require 'is-number'
{ Publish } = require '../model'

RecordService = null

setTimeout () ->
  RecordService = require('./record')
, 16

randomString = require('../lib/random-string')

class PublishService extends require './service'
  create: (data) ->
    publish = new Publish data
    publish.output = { _isOutput: true }
    publish.save()

  destroy: (id) ->
    publish = await @get id

    if publish.record_lock
      throw @Interrup 'publish is locked', 423

    await RecordService.getRecordsByPublishId(publish.record).remove()

    publish.remove()

  _get: (_id) => Publish.findOne { _id }

  get: (id, populate) ->
    id = String id

    if populate
      publish = await (@_get id)
      if publish.record
        await publish.populate('record')
    else
      publish = await @_get id

    unless publish
      throw @Interrup 'publish not found', 404

    return publish

  count: (conditions = {}) ->
    Publish.find(conditions).countDocuments()

  list: (conditions = {}, populate = false, page, limit = 10, dateSort = -1) ->
    if !isNum(page) || page < 1
      throw @Interrup 'page must be Integer and greater or equal to 1', 400

    start = (page - 1) * limit

    mon = Publish.find(conditions)
      .select("-record_key")
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
    { page, category, tags, populate = false } = opt

    @categoryIdCondition(conditions, category)
    @tagsCondition(conditions, tags)

    count = await @count(conditions)
    list = await @list(conditions, populate, page)

    return {
      page,
      total_page: Math.ceil(count / limit),
      limit,
      count,
      list,
    }

  update: (id, data, record_key) ->
    publish = @get id

    if publish.record_lock and (record_key != publish.record_key)
      throw @Interrup 'invalid record_key', 403

    Reflect.deleteProperty(data, '_id')

    await Publish.update(
      { _id: String(id) },
      { $set: data }
    )

    @get id

  release: (id, record_id) ->
    id = String id
    publish = await @get id

    record = await RecordService.get(record_id)
    if record.publish_id is publish.record
      publish.record = record._id
      publish.save()
    else
      throw @Interrup 'record is not belongs this publish', 403

  refreshRecordKey: (publish) ->
    new_record_key = randomString 32, true
    if new_record_key is publish.record_key
      @setRecordKey publish
    else
      publish.record_key = new_record_key

  keepLockTime: (id) ->
    publish = await @get(id)

    publish.lock_time = Date.now() + @envir.LOCK_TIMEOUT
    @refreshRecordKey(publish)

    await publish.save()

    return publish.record_key

  clearLockTime: (id) ->
    publish = await @get(id)
    publish.lock_time = Date.now() - 1
    await publish.save()

module.exports = new PublishService
