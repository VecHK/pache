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

  const new_record = await Record.get(record._id)
  t.is(new_record._id, record._id)
  t.is(new_record.publish_id, record.publish_id)
  t.is(new_record.content, record.content)
  t.is(new_record.content_type, record.content_type)
})

test('创建记录(指定一个不存在的 publish)', async t => {
  const no_exist_publish_id = '55555528864d729fb86ae5d5'

  const err = await Record.create({
    publish_id: no_exist_publish_id,
    content: 'hehe',
    content_type: 'text'
  }, '', 404)

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

  const err = await Record.destroy(record._id, '', 404)
  t.is(typeof err, 'object')
  t.truthy(err)
  t.is(typeof err.message, 'string')

  const get_err = await Record.get(record._id, 404)
  t.is(typeof get_err, 'object')
  t.truthy(get_err)
  t.is(typeof get_err.message, 'string')
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

test.serial('在被锁定的发布上添加记录', async t => {
  let pub = await Publish.create({
    title: 'locked'
  })

  const result = await Publish.lock(pub._id)
  const { record_key } = result

  await Record.create({
    publish_id: pub._id,
    content: 'list1'
  }, '', 423)

  t.falsy(
    (await Record.getList(pub._id, 1)).list.length
  )

  await Record.create({
    publish_id: pub._id,
    content: 'list1'
  }, 'failure_key', 403)

  t.falsy(
    (await Record.getList(pub._id, 1)).list.length
  )

  await Record.create({
    publish_id: pub._id,
    content: 'list1'
  }, record_key)

  const { list } = await Record.getList(pub._id, 1)
  t.is(list.length, 1)
  t.is(list[0].content, 'list1')
})

test.serial('在被锁定的发布上删除记录', async t => {
  let pub = await Publish.create({
    title: 'locked——delete'
  })

  const result = await Publish.lock(pub._id)
  const { record_key } = result

  const record = await Record.create({
    publish_id: pub._id,
    content: 'list1'
  }, record_key)

  t.truthy(
    (await Record.getList(pub._id, 1)).list.length
  )

  await Record.destroy(record._id, '', 423)
  const locked_list = (await Record.getList(pub._id, 1)).list
  t.truthy(locked_list.length)
  t.is(locked_list[0].content, 'list1')

  await Record.destroy(record._id, 'failure_key', 403)
  const block_list = (await Record.getList(pub._id, 1)).list
  t.truthy(block_list.length)
  t.is(block_list[0].content, 'list1')

  await Record.destroy(record._id, record_key)
  const destroyed_list = (await Record.getList(pub._id, 1)).list
  t.is(destroyed_list.length, 0)
})
