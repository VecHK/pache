const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const envir = require('../envir')

const PREFIX_URL = '/api'

export default class Auth {
  async adminLogin(pass, expect_status = 200) {
    let web = await this.agent.post(PREFIX_URL + '/auth/login').testJson({
      pass: md5(`${pass}`)
    }, expect_status)

    return web.json
  }

  async login(pass = envir.pass) {
    return this.adminLogin(pass)
  }

  constructor(ag) {
    this.agent = ag
  }
}
