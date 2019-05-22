const test = require('ava')

const {
  envir,
  createAgent
} = require('../_test_envirment')

import _Auth from '../_auth'

const PREFIX_URL = '/api'

let ag = null
let Auth
test.before('準備環境', async t => {
  ag = createAgent()
  Auth = new _Auth(ag)
})

test('登录(密码正确)', async t => {
  const token = await Auth.adminLogin(envir.pass)
  t.is(typeof token, 'string')
})

test('登录(密码错误)', async t => {
  const err = await Auth.adminLogin('invalidPassWord', 403)
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
  const token = await Auth.adminLogin(envir.pass)

  const web = await ag.get(PREFIX_URL + '/publishes/1').json(200, token)

  const result = web.json
  t.is(typeof result, 'object')
})
