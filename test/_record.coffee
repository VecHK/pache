class Record
  create: (data, expect_status_code = 201) ->
    web = await this.agent
      .post "/api/record"
      .testJson data, expect_status_code, @token

    return web.json

  destroy: (record_id, expect_status_code = 200) ->
    web = await this.agent
      .delete "/api/record/#{record_id}"
      .json expect_status_code, @token

    return web.json

  getList: (publish_id, page = 1) ->
    web = await this.agent
      .get "/api/records/#{page}?publish_id=#{encodeURIComponent publish_id}"
      .json 200, @token

    return web.json

  constructor: (agent, token) ->
    @agent = agent
    @token = token


module.exports = Record
