class Record
  create: (data, record_key, expect_status_code = 201) ->
    upload = {
      data,
      record_key
    }

    web = await this.agent
      .post "/api/record"
      .testJson upload, expect_status_code, @token

    return web.json

  destroy: (record_id, record_key, expect_status_code = 200) ->
    web = await this.agent
      .delete "/api/record/#{record_id}?record_key=#{encodeURIComponent record_key}"
      .json expect_status_code, @token

    return web.json

  get: (id, expect_status_code = 200) ->
    web = await this.agent
      .get "/api/record/#{id}"
      .json expect_status_code, @token

    web.json

  getList: (publish_id, page = 1, limit = 10, expect_status_code = 200) ->
    web = await this.agent
      .get "/api/records/#{page}?publish_id=#{encodeURIComponent publish_id}&limit=#{encodeURIComponent(limit)}"
      .json expect_status_code, @token

    return web.json

  update: (publish_id, data, record_key, expect_status_code = 200) ->
    web = await this.agent
      .put "/api/record/#{publish_id}"
      .testJson { data, record_key }, expect_status_code, @token

    return web.json

  constructor: (agent, token) ->
    @agent = agent
    @token = token


module.exports = Record
