require('coffeescript/register')

import 'arr-ext'

const test = require('ava')

const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const {
  Model,
  envir,
  JsonMiddle,
  createAgent
} = require('../_test_envirment')

import _Publish from '../_publish'
let Publish

/* 準備環境 */
let ag = null
test.before('準備環境', async t => {
  ag = createAgent()
  Publish = new _Publish(ag)

  // 登录
  const random_web = await ag.get('/api/auth/random').json(200)
  const random_code = random_web.json
  const login_pass = md5(random_code + envir.pass)
  let web = await ag.post('/api/auth/pass')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(login_pass))
    .expect(200)
    .expect('Content-Type', /json/)

  await Model.connectStatus
  try {
    await Model.removeCollection('records')
    await Model.removeCollection('publishes')
  } catch (_) {}
  try {
    await Model.removeCollection('categories')
  } catch(_) {}
})

test('创建发布', async t => {
  let data = await Publish.create({
    title: 'hehe'
  })

  t.is(typeof data, 'object')
  t.is(data.title, 'hehe')
})

test('删除发布', async t => {
  let data = await Publish.create({
    title: 'hehe'
  })

  const publish = await Publish.get(data._id)

  t.is(typeof publish, 'object')
  t.is(publish._id, data._id)
  t.is(publish.title, data.title)

  await Publish.destroy(publish._id)
  await ag.get(`/api/publish/${publish._id}`).json(404)
})

test('获取发布', async t => {
  let data = await Publish.create({
    title: 'hehe'
  })

  const publish = await Publish.get(data._id)

  t.is(typeof publish, 'object')
  t.is(publish._id, data._id)
  t.is(publish.title, data.title)
})

test('获取发布列表', async t => {
  const s_list = [
    await Publish.create({
      title: 'list-1'
    }),
    await Publish.create({
      title: 'list-2'
    }),
    await Publish.create({
      title: 'list-3'
    })
  ]

  let web = await ag.get(`/api/publishes/1`).json(200)
  let info = web.json

  t.is(typeof info, 'object')
  t.is(info.page, 1)
  t.is(info.limit, envir.limit)
  t.true(info.list.length >= s_list.length)
})

test('修改发布', async t => {
  const pub = await Publish.create({
    title: 'will_be_update'
  })

  t.is(pub.title, 'will_be_update')

  const mod = await Publish.update(pub._id, { title: 'updated' })

  t.is(typeof mod, 'object')
  t.not(mod, null)
  t.is(mod.title, 'updated')
  t.is(mod._id, pub._id)

  const updated = await Publish.get(mod._id)
  t.is(updated.title, 'updated')
  t.is(updated._id, mod._id)
})
