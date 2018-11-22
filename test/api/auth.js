const Koa = require('koa')
const supertest = require('supertest')
const test = require('ava')

const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const {
  Model,
  envir,
  JsonMiddle,
  createAgent
} = require('../_test_envirment')

const app = require('../../app')

const PREFIX_URL = '/api'

let ag = null
test.before('準備環境', async t => {
  ag = createAgent()
})

async function getLoginInfo(t) {
  let web = await ag.get(PREFIX_URL + '/auth/login-info').expect(200).json(200)
  const result = web.json

  if (t) {
    t.is(typeof result, 'object')
    t.is(typeof result.salt, 'string')
    t.is(typeof result.token, 'string')
  }

  return result
}

async function adminLogin(login_token, salt, pass, expect_status = 200) {
  let web = await ag.post(PREFIX_URL + '/auth/login').testJson({
    pass: md5(`${salt}${pass}`),
    token: login_token
  }, expect_status)

  return web.json
}

test('获取登录 Token 和盐', async t => {
  await getLoginInfo(t)
})

test('登录(密码正确)', async t => {
  let login_info = await getLoginInfo(t)
  const token = await adminLogin(login_info.token, login_info.salt, envir.pass)
  t.is(typeof token, 'string')
})

test('登录(密码错误)', async t => {
  let login_info = await getLoginInfo(t)

  const err = await adminLogin(login_info.token, login_info.salt, 'failureError', 403)
  t.is(typeof err, 'object')
  t.truthy(err)
})

test('访问 admin 模块（未登录被拒）', async t => {
  let web = await ag.get(PREFIX_URL + '/publishes/1').json(401);
  let err = web.json
  t.is(typeof err, 'object')
  t.truthy(err)
})

test('访问 admin 模块（已登录）', async t => {
  let login_info = await getLoginInfo(t)
  const token = await adminLogin(login_info.token, login_info.salt, envir.pass)

  const web = await ag.get(PREFIX_URL + '/publishes/1').json(200, token)

  const result = web.json
  t.is(typeof result, 'object')
})
