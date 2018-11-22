
export default class Publish {
  async create(obj = {}) {
    const new_category = Object.assign({
      name: '发布',
      tags: []
    }, obj)

    let web = await this.agent.post('/api/publish').testJson(new_category, 201, this.token)
    return web.json
  }

  async destroy(id) {
    let web = await this.agent.delete(`/api/publish/${id}`).json(200, this.token)
    return web.json
  }

  async get(id) {
    let web = await this.agent.get(`/api/publish/${id}`).json(200, this.token)
    return web.json
  }

  async update(id, body, expect_status_code = 200) {
    let web = await this.agent.put(`/api/publish/${id}`).testJson({
      data: body.data,
      record_key: body.record_key
    }, expect_status_code, this.token)
    return web.json
  }

  async lock(id) {
    let web = await this.agent.lock(`/api/publish/${id}`).json(200, this.token)
    return web.json
  }

  async unlock(id, record_key, expect_status_code = 200) {
    const url = `/api/publish/${id}?record_key=${encodeURIComponent(record_key)}`
    let web = await this.agent.unlock(url).json(expect_status_code, this.token)
    return web.json
  }

  constructor(agent, token) {
    this.agent = agent
    this.token = token
  }
}
