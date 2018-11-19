
export default class Publish {
  async create(obj = {}) {
    const new_category = Object.assign({
      name: '发布',
      tags: []
    }, obj)

    let web = await this.agent.post('/api/publish').testJson(new_category, 201)
    return web.json
  }

  async destroy(id) {
    let web = await this.agent.delete(`/api/publish/${id}`).json(200)
    return web.json
  }

  async get(id) {
    let web = await this.agent.get(`/api/publish/${id}`).json(200)
    return web.json
  }

  async update(id, data, record_key) {
    let web = await this.agent.put(`/api/publish/${id}`).testJson({
      record_key,
      data
    }, 200)
    return web.json
  }

  constructor(agent) {
    this.agent = agent
  }
}
