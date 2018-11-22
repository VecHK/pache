require('coffeescript/register')

const supertest = require('supertest')

const envir = require('../envir')
const TEST_DB = 'pache3_test'
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`
envir.limit = 3
envir.pass = '測試用的哦'

import _Auth from './_auth'

/**
  JSON 統一格式
  @param msg 消息
  @param code 返回碼，無錯誤時通常為 0
  @param result 返回的結果
*/
const JsonMiddle = (res) => {
  try {
    res.json = JSON.parse(res.text)
  } catch (e) {
    console.warn('JsonMiddle fail, text:', res.text)
    throw e
  }
  return res
}

supertest.Test.prototype.testJson = function (value, status = 200, token) {
  value = JSON.stringify(value)

  let inst = this.set('Content-Type', 'application/json')
  if (token) {
    inst = inst.set('Authorization', `Bearer ${token}`)
  }

  return inst
    .send(value)
    .expect(status)
    .expect('Content-Type', /json/)
    .then(JsonMiddle)
}

supertest.Test.prototype.json = function (expect_status = 200, token) {
  let inst = this.set('Content-Type', 'application/json')
  if (token) {
    inst = inst.set('Authorization', `Bearer ${token}`)
  }

  return inst
    .expect(expect_status)
    .expect('Content-Type', /json/)
    .then(JsonMiddle)
}

supertest.Test.prototype.sendJson = function (value, token) {
  if (value && (typeof(value) === 'object')) {
    value = JSON.stringify(value)
  }

  const inst = this.set('Content-Type', 'application/json')
  if (token) {
    inst = inst.set('Authorization', `Bearer ${token}`)
  }

  return inst.send(value)
}

const Koa = require('koa')
const appRouter = require('../app/router')
const app = new Koa
appRouter(app)

const server = app.listen()
function createAgent() {
  return supertest.agent(server)
}

async function createAdminAgent() {
  const ag = supertest.agent(server)
  const Auth = new _Auth(ag)
  const token = await Auth.login()

  const fn = (method, ...args) =>
    ag[method](...args).set('Authorization', `Bearer ${token}`)

  return Object.assign(fn, {
    agent: ag
  })
}

module.exports = {
  JsonMiddle,
  envir,
  Model: require('../app/model'),
  createAgent,
  createAdminAgent,
  agent: createAgent()
}
