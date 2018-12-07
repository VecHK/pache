const envir = require('../../envir')
const { Record, Publish } = require('../model')
const PublishService = require('./publish')

const isNum = require('is-number')

class RecordService extends require('./service') {
  validateRecordKey(publish, record_key) {
    if (publish.record_lock) {
      // 如果发布被锁定了，则对比 record_key 是否符合发布上的 record_key
      // 没有提供的话则返回 423，不符合则返回 403
      if (!record_key) {
        throw this.Interrup('publish is locked', 423)
      } else if (record_key !== publish.record_key) {
        throw this.Interrup('invalid record_key', 403)
      }
    }
  }

  // 创建文章记录
  async create(data, record_key) {
    delete data._id

    const publish = await PublishService.get(data.publish_id)
    this.validateRecordKey(publish, record_key)

    const record = new Record(data)
    return record.save()
  }

  async destroy(id, record_key) {
    const record = await this.get(id)

    const publish = await PublishService._get(record.publish_id)
    if (publish) {
      this.validateRecordKey(publish, record_key)
    }

    return record.remove()
  }

  _get(_id) {
    return Record.findOne({ _id })
  }

  async get(id) {
    const record = await this._get(id)
    if (!record) {
      throw Object.assign(
        new Error('record not found'),
        { statusCode: 404 }
      )
    }
    return record
  }

  count(conditions = {}) {
    return Record.find(conditions).countDocuments()
  }

  async getList(opt) {
    const {
      publish_id,
      page,
      limit = 10,
      dateSort = -1,
    } = opt

    if (!isNum(page) || page < 1) {
      throw this.Interrup('page must be Integer and greater or equal to 1', 400)
    }

    let start = (page - 1) * limit

    return {
      count: await this.count({ publish_id }),
      list: await this.getRecordsByPublishId(publish_id)
        .sort({ created_at: dateSort })
        .skip(start)
        .limit(parseInt(limit))
        .exec()
    }
  }

  getRecordsByPublishId(publish_id) {
    return Record.find({ publish_id })
  }

  async update(id, data, record_key) {
    const record = await this.get(id)

    const publish = await PublishService._get(record.publish_id)
    if (publish) {
      this.validateRecordKey(publish, record_key)
    }

    delete data._id
    delete data.publish_id
    return Object.assign(record, data).save()
  }
}

module.exports = new RecordService
