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

/* 準備環境 */
let ag = null
test.before('準備環境', async t => {
  ag = createAgent()

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

async function createCategory(obj = {}) {
  const defaultValue = {
    name: '分类',
    position: 'left'
  }
  const new_category = Object.assign({
    name: '分类',
    position: 'left'
  }, obj)

  let web = await ag.post('/api/category').testJson(new_category, 201)
  return web.json
}

test('创建分类', async t => {
  let data = await createCategory({
    name: '分类1',
    position: 'right'
  })

  t.is(typeof data, 'object')
  t.is(data.name, '分类1')
  t.is(data.position, 'right')
})

test('删除分类', async t => {
  let web = await ag.post('/api/category').testJson({
    name: '我会被删除的',
    position: 'left'
  }, 201)

  let created = web.json

  web = await ag.delete(`/api/category/${created._id}`).json(200)

  let deleted = web.json

  t.is(created._id, deleted._id)

  await ag.get(`/api/category/${deleted._id}`).json(404)
})

test('分类列表', async t => {
  const left = await createCategory({
    name: '分类_left',
    position: 'left'
  })
  const right = await createCategory({
    name: '分类_right',
    position: 'right'
  })

  let web = await ag.get('/api/categories').json(200)

  let data = web.json

  t.is(typeof data, 'object')
  t.true(Array.isArray(data.left))
  t.true(Array.isArray(data.right))

  t.truthy(data.left.findBy('_id', left._id))
  t.truthy(data.right.findBy('_id', right._id))
})

async function getCategory(_id) {
  const web = await ag.get(`/api/category/${_id}`).json(200)
  return web.json
}

test('修改分类', async t => {
  const sourceValue = { name: 'source', color: '#BBBBBB' }
  const new_category = await createCategory(sourceValue)

  const web = await ag.patch(`/api/category/${new_category._id}`).testJson({
    name: '新名字',
    color: '#CCCCCC',
    position: 'right'
  }, 200)
  const mod_category = web.json

  t.is(mod_category.name, '新名字')
  t.is(mod_category.color, '#CCCCCC')
  t.is(mod_category.position, 'right')

  const category = await getCategory(mod_category._id)

  t.is(category.name, '新名字')
  t.is(category.color, '#CCCCCC')
  t.is(category.position, 'right')
})
