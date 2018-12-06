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

/* 準備環境 */
let ag = null
test.before('準備環境', async t => {
  ag = await createAdminAgent()
  Publish = new _Publish(ag.agent, ag.token)
  Record = new _Record(ag.agent, ag.token)

  await clearModel()
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
  await ag('get', `/api/publish/${publish._id}`).json(404)
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

  let web = await ag('get', `/api/publishes/1`).json(200)
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

  const mod = await Publish.update(pub._id, {
    data: { title: 'updated' }
  })

  t.is(typeof mod, 'object')
  t.not(mod, null)
  t.is(mod.title, 'updated')
  t.is(mod._id, pub._id)

  const updated = await Publish.get(mod._id)
  t.is(updated.title, 'updated')
  t.is(updated._id, mod._id)
})

test('锁定发布', async t => {
  const pub = await Publish.create({ title: 'lock' })

  t.is(typeof pub, 'object')
  t.not(pub, null)
  t.is(pub.title, 'lock')

  const info = await Publish.lock(pub._id)
  const { record_key } = info

  await Publish.update(pub._id, {
    data: { title: 'locked' }
  }, 403)

  let mod =   await Publish.update(pub._id, {
    data: { title: 'locked' },
    record_key
  })
  t.is(typeof mod, 'object')
  t.not(mod, null)
  t.is(mod.title, 'locked')

  const updated = await Publish.get(pub._id)
  t.is(typeof updated, 'object')
  t.not(updated, null)
  t.is(updated.title, 'locked')
  t.is(updated.record_key, undefined)
})

test('锁定发布', async t => {
  const pub = await Publish.create({ title: 'will_be_unlock' })
  const info = await Publish.lock(pub._id)
  const { record_key } = info

  await Publish.unlock(pub._id, 'failure_record_key', 403)

  await Publish.update(pub._id, {
    data: { title: 'unlocked' }
  }, 403)

  let mod = await Publish.get(pub._id)
  t.is(typeof mod, 'object')
  t.not(mod, null)
  t.is(mod.title, 'will_be_unlock')


  await Publish.unlock(pub._id, record_key, 200)
  mod = await Publish.update(pub._id, {
    data: { title: 'unlocked' }
  }, 200)
  t.is(typeof mod, 'object')
  t.not(mod, null)
  t.is(mod.title, 'unlocked')

  const updated = await Publish.get(pub._id)
  t.is(typeof updated, 'object')
  t.not(updated, null)
  t.is(updated.title, 'unlocked')
  t.is(updated.record_key, undefined)
})

test('发布文章', async t => {
  const publish = await Publish.create({ title: 'hello, Pache' })
  const record = await Record.create({
    publish_id: publish._id,
    content: 'new Article!'
  })

  const result = await Publish.release(publish._id, record._id)
  t.is(result._id, publish._id)
  t.is(result.title, publish.title)
  t.is(result.record, record._id)
})

test('发布文章(不存在的记录)', async t => {
  const publish = await Publish.create({ title: 'hello, Pache' })
  const record = await Record.create({
    publish_id: publish._id,
    content: 'new Article!'
  })
  await Record.destroy(record._id)
  const err = await Publish.release(publish._id, record._id, '', 404)
  t.is(typeof err, 'object')
  t.truthy(err)
  t.is(typeof err.message, 'string')
  t.regex(err.message, /record/)
})

test('发布文章(不是所属发布的记录)', async t => {
  const before_publish = await Publish.create({ title: 'hello' })
  const record = await Record.create({
    publish_id: before_publish._id,
    content: 'new Article!'
  })

  const publish = await Publish.create({ title: 'hello, publish' })
  const err = await Publish.release(publish._id, record._id, '', 403)
  t.is(typeof err, 'object')
  t.truthy(err)
  t.is(typeof err.message, 'string')
})

test('发布文章(被锁定状态)', async t => {
  const publish = await Publish.create({ title: 'hello, lock' })
  const record = await Record.create({
    publish_id: publish._id,
    content: 'new Article!'
  })
  const { record_key } = await Publish.lock(publish._id)

  await Publish.release(publish._id, record._id, '', 423)
  await Publish.release(publish._id, record._id, 'failure_record_key', 403)
  const result = await Publish.release(publish._id, record._id, record_key)
  t.is(result._id, publish._id)
  t.is(result.title, publish.title)
  t.is(result.record, record._id)
})

test('更新多篇发布(其中有被锁定的)', async t => {
  const p1 = await Publish.create({ title: 'multi publish 1' })
  const p2 = await Publish.create({ title: 'multi publish 2' })
  const p3 = await Publish.create({ title: 'multi publish 3 locked' })

  await Publish.lock(p3._id)

  const ids = [p1._id, p2._id, p3._id]

  const result = await Publish.updateMulti(
    ids,
    { data: { title: 'multi updated' } }
  )

  t.truthy(Array.isArray(result))

  t.is(result.length, ids.length)
  t.is(result[0].title, 'multi updated')
  t.is(result[0]._id, p1._id)
  t.is(result[1].title, 'multi updated')
  t.is(result[1]._id, p2._id)
  t.is(result[2].__is_error, true)
  t.is(typeof result[2].message, 'string')
})

test('更新多篇发布', async t => {
  const p1 = await Publish.create({ title: 'multi publish 1' })
  const p2 = await Publish.create({ title: 'multi publish 2' })
  const p3 = await Publish.create({ title: 'multi publish 3' })
  const ids = [p1._id, p2._id, p3._id]

  const result = await Publish.updateMulti(
    ids,
    { data: { title: 'multi updated' } }
  )

  t.truthy(Array.isArray(result))

  t.is(result.length, ids.length)
  t.is(result[0].title, 'multi updated')
  t.is(result[0]._id, p1._id)
  t.is(result[1].title, 'multi updated')
  t.is(result[1]._id, p2._id)
  t.is(result[2].title, 'multi updated')
  t.is(result[2]._id, p3._id)
})
