const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const envir = require('../envir')

const PREFIX_URL = '/api'

export default class Auth {
  async testGetLoginInfo(t) {
    let web = await this.agent.get(PREFIX_URL + '/auth/login-info').json(200)
    const result = web.json

    if (t) {
      t.is(typeof result, 'object')
      t.is(typeof result.salt, 'string')
      t.is(typeof result.token, 'string')
    }

    return result
  }

  async adminLogin(login_token, salt, pass, expect_status = 200) {
    let web = await this.agent.post(PREFIX_URL + '/auth/login').testJson({
      pass: md5(`${salt}${pass}`),
      token: login_token
    }, expect_status)

    return web.json
  }

  async login(pass = envir.pass, t) {
    let login_info = await this.testGetLoginInfo(t)
    return this.adminLogin(login_info.token, login_info.salt, pass)
  }

  constructor(ag) {
    this.agent = ag
  }
}
