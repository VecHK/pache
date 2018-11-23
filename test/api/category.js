require('coffeescript/register')
import 'arr-ext'
const test = require('ava')

const {
  clearModel,
  createAdminAgent
} = require('../_test_envirment')

/* 準備環境 */
let ag = null
test.before('准备环境', async t => {
  ag = await createAdminAgent()

  await clearModel()
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

  let web = await ag('post', '/api/category').testJson(new_category, 201)
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
  let web = await ag('post', '/api/category').testJson({
    name: '我会被删除的',
    position: 'left'
  }, 201)

  let created = web.json

  web = await ag('delete', `/api/category/${created._id}`).json(200)

  let deleted = web.json

  t.is(created._id, deleted._id)

  await ag('get', `/api/category/${deleted._id}`).json(404)
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

  let web = await ag('get', '/api/categories').json(200)

  let data = web.json

  t.is(typeof data, 'object')
  t.true(Array.isArray(data.left))
  t.true(Array.isArray(data.right))

  t.truthy(data.left.findBy('_id', left._id))
  t.truthy(data.right.findBy('_id', right._id))
})

async function getCategory(_id) {
  const web = await ag('get', `/api/category/${_id}`).json(200)
  return web.json
}

test('修改分类', async t => {
  const sourceValue = { name: 'source', color: '#BBBBBB' }
  const new_category = await createCategory(sourceValue)

  const web = await ag('patch', `/api/category/${new_category._id}`).testJson({
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

test('修改分类(重复分类)', async t => {
  await createCategory({ name: 'duplicate' })

  const new_category = await createCategory({ name: 'other_category' })
  const web = await ag('patch', `/api/category/${new_category._id}`).testJson({
    name: 'duplicate'
  }, 409)

  let err = web.json
  t.is(typeof err, 'object')
  t.truthy(err)
  t.is(typeof err.message, 'string')
})
