require('coffeescript/register')
import 'arr-ext'
const test = require('ava')

const {
  envir,
  createAdminAgent,
  clearModel
} = require('../_test_envirment')


import _Publish from '../_publish'
const _Record = require('../_record')
let Publish, Record

let ag = null
test.before('准备环境', async t => {
  ag = await createAdminAgent()
  Publish = new _Publish(ag.agent, ag.token)
  Record = new _Record(ag.agent, ag.token)

  await clearModel()
})

test('创建记录', async t => {
  let pub = await Publish.create({
    title: 'rPublish'
  })

  t.is(typeof pub, 'object')
  t.is(pub.title, 'rPublish')

  const record = await Record.create({
    publish_id: pub._id,
    content: 'hehe',
    content_type: 'text'
  })

  t.is(pub._id, record.publish_id)
  t.is(record.content, 'hehe')
  t.is(record.content_type, 'text')
})

test('创建记录(指定一个不存在的 publish)', async t => {
  const no_exist_publish_id = '55555528864d729fb86ae5d5'

  const err = await Record.create({
    publish_id: no_exist_publish_id,
    content: 'hehe',
    content_type: 'text'
  }, 404)

  t.is(typeof err, 'object')
  t.is(typeof err.message, 'string')
})

test('删除记录', async t => {
  let pub = await Publish.create({
    title: 'rPublish'
  })
  const record = await Record.create({
    publish_id: pub._id,
    content: 'hehe',
    content_type: 'text'
  })

  let info = await Record.getList(pub._id, 1)
  t.is(info.count, info.list.length, 1)

  const del = await Record.destroy(record._id)
  t.is(del.publish_id, record.publish_id)
  t.is(del.content, record.content)
  t.is(del.content_type, record.content_type)

  info = await Record.getList(pub._id, 1)
  t.is(info.count, info.list.length, 0)

  const err = await Record.destroy(record._id, 404)
  t.is(typeof err, 'object')
  t.truthy(err)
  t.is(typeof err.message, 'string')
})

test('记录列表', async t => {
  let pub = await Publish.create({
    title: 'rPublish'
  })

  await Record.create({
    publish_id: pub._id,
    content: 'list1',
    content_type: 'text'
  })
  await Record.create({
    publish_id: pub._id,
    content: 'list2',
    content_type: 'text'
  })
  await Record.create({
    publish_id: pub._id,
    content: 'list3',
    content_type: 'text'
  })

  const info = await Record.getList(pub._id, 1)
  t.is(info.count, 3)
  t.truthy(Array.isArray(info.list))

  t.is(info.list[0].content, 'list3')
  t.is(info.list[1].content, 'list2')
  t.is(info.list[2].content, 'list1')
})
