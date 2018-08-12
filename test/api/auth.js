const Koa = require('koa')
const supertest = require('supertest')
const test = require('ava')

const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const { Model, envir, JsonMiddle } = require('../_test_envirment')

const app = require('../../app')

const PREFIX_URL = '/api'

const agent = app => supertest.agent(app.callback())
let ag = null
test.before('準備環境', async t => {
  ag = agent(app)
})

let random_code = null
test('獲取隨機碼', async t => {
  let web = await ag.get(PREFIX_URL + '/auth/random').expect(200).json(200)

  let { data } = web.json
  t.is(typeof data, 'string')
  random_code = data
})

test('認證（錯誤的密碼）', async t => {
  let web = await ag.post(PREFIX_URL + '/auth/pass').testJson({
    pass: '這絕對會是錯誤的密碼，朋友',
  }, 200)

  t.false(web.json.data, false)
})

test('認證（正確的密碼）', async t => {
  const random_web = await ag.get(PREFIX_URL + '/auth/random').then(JsonMiddle)
  const random_code = random_web.json.data

  const login_pass = md5(random_code + envir.pass)
  let web = await ag.post(PREFIX_URL + '/auth/pass')
    .testJson(login_pass, 200)
    .then(JsonMiddle)

  t.true(web.json.data)
})

test('獲取認證狀態（已登錄）', async t => {
  const random_web = await ag.get(PREFIX_URL + '/auth/random').json(200)
  const random_code = random_web.json.data
  const login_pass = md5(random_code + envir.pass)
  let web = await ag.post(PREFIX_URL + '/auth/pass').testJson(login_pass, 200)

  web = await ag.get(PREFIX_URL + '/auth/status').json(200)

  let { data } = web.json
  t.is(data, true)
})

test('登出', async t => {
  let web = await agent(app).get(PREFIX_URL + '/auth/logout').json(200)

  t.is(web.json.data, true)
})

test('獲取認證狀態（未登錄）', async t => {
  let web = await agent(app).get(PREFIX_URL + '/auth/status').json(200)

  t.false(web.json.data)
})

test('訪問 admin 模塊（未登錄被拒）', async t => {
  let web = await agent(app).get(PREFIX_URL + '/bucunzai').expect(401);

  t.regex(web.text, /需要登录/)
})

test('訪問 admin 模塊（已認證）', async t => {
  const random_web = await ag.get(PREFIX_URL + '/auth/random').json(200)
  const random_code = random_web.json.data
  const login_pass = md5(random_code + envir.pass)
  let web = await ag.post(PREFIX_URL + '/auth/pass').testJson(login_pass, 200)

  t.true(web.json.data)

  web = await ag.get(PREFIX_URL + '/articles/1').expect(200)

  t.not(web.status, 401)
})
