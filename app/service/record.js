const envir = require('../../envir')
const { Record, Publish } = require('../model')
const PublishService = require('./publish')
const clone = require('../lib/clone')
const isNum = require('is-number')

class RecordService extends require('./service') {
  // 创建文章记录
  async create(data) {
    delete data._id

    const publish = await PublishService.get(data.publish_id)
    console.log('publish.record_lock', publish.record_lock)
    if (publish.record_lock) {
      throw this.Interrup('publish is locked', 423)
    } else {
      const record = new Record(data)
      return record.save()
    }
  }

  async destroy(id) {
    const record = await this.get(id)
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
}

module.exports = new RecordService
