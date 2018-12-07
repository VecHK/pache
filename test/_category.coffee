class Record
  create: (obj = {}, expect_status_code = 201) ->
    defaultValue = {
      name: '分类'
      position: 'left'
    }

    new_category = Object.assign {
      name: '分类',
      position: 'left'
    }, obj

    web = await this.agent
      .post "/api/category"
      .testJson new_category, expect_status_code, @token

    web.json

  get: (id, expect_status_code = 200) ->
    web = await this.agent
      .get "/api/category/#{id}"
      .json expect_status_code, @token

    web.json

  constructor: (agent, token) ->
    @agent = agent
    @token = token


module.exports = Record
