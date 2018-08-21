envir = require '../../envir'
{ Publish, Article } = require '../model'

class PublishService extends require './service'
  create: (data) ->
    publish = new Publish data
    publish.save()

  destroy: (id) ->
    publish = await this.get id
    publish.remove()

  _get: _id => Publish.findOne { _id }

  get: (id) ->
    id = String id
    publish = await this._get id
    unless publish
      throw Object.assign new Error('publish not found'), { statusCode: 404 }
    return publish

  getList: () ->

module.exports = new PublishService
