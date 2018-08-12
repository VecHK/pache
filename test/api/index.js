require('coffeescript/register')

const Koa = require('koa')
const supertest = require('supertest')

const test = require('ava')
const assert = require('power-assert')

const crypto = require('crypto')
const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const { Model, envir, JsonMiddle } = require('../_test_envirment')

const appRouter = require('../../app/router')
const app = new Koa
appRouter(app)

const agent = supertest.agent(app.callback())

/* 準備環境 */
let ag = null
let inserted_list = []
let delete_ids = null
let topic_article = null
let categories = []
test.before('準備環境', async t => {
  ag = agent

  // 登录
  const random_web = await ag.get('/api/auth/random').json(200)
  const random_code = random_web.json.data
  const login_pass = md5(random_code + envir.pass)
  let web = await ag.post('/api/auth/pass')
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(login_pass))
    .expect(200)
    .expect('Content-Type', /json/)

  await Model.connectStatus
  try {
    await Model.removeCollection('articles')
  } catch (_) {}
  try {
    await Model.removeCollection('categories')
  } catch(_) {}

  const category_1 = new Model.Category({name: 'cate_1'})
  const category_2 = new Model.Category({name: 'cate_2'})

  categories = categories.concat([
    await category_1.save(),
    await category_2.save()
  ])

  const d_arts = [
    { title: '我會被刪掉的' },
    { title: '我會被刪掉的' }
  ];
  const delete_article = [];
  for (let art of d_arts) {
    let inserted = await (new Model.Article({
      title: '我會被刪掉的'
    })).save()
    delete_article.push(inserted)
  }
  delete_ids = delete_article.map(a => a._id.toString())

  const article_list = [
    {title: '標題一', category: category_1._id.toString(), tags: ['java', 'python', 'public']},
    {title: '標題二', category: category_1._id.toString(), tags: ['torzo', 'public']},
    {title: '標題三', category: category_1._id.toString(), tags: ['pache', 'oop', 'public']},

    {title: '標題四', category: category_2._id.toString(), tags: ['durzo', 'osb', 'public']},
    {title: '標題五', category: category_2._id.toString(), tags: ['魔術', 'ability', 'fff']},
    {title: '標題六', category: category_2._id.toString(), tags: ['pache', 'iptp', 'fff']}
  ];
  const p_arr = [];

  for (let arts of article_list) {
    let article_ins = new Model.Article(arts)
    inserted_list.push(await article_ins.save())
  }
  topic_article = inserted_list.slice(-1)
})

// 获取文章列表
test('GET /api/articles/:pagecode', async (t) => {
  let web = await ag.get('/api/articles/1').expect(200).then(JsonMiddle)

  let {data} = web.json

  t.true(Array.isArray(data.list))
  t.is(data.list.length, envir.limit)  //單頁最大限制為 envir.limit

  t.is(data.list[0].title, '標題六')
  t.is(data.list[1].title, '標題五')
  t.is(data.list[2].title, '標題四')
})

// 修改单个文章
test('PATCH /api/article/:id', async t => {
  let patch_article = inserted_list.slice(-1).pop()
  let patch_id = patch_article._id.toString()

  let web = await ag.patch(`/api/article/${patch_id}`).testJson({
    $push: { tags: {$each: ['index']} }
  }, 200)

  let { data } = web.json

  let article = await Model.Article.findOne({ _id: patch_id })
  t.is(article.title, patch_article.title)
  t.is(article.tags.includes('index'), true)
})

// 修改多个文章
test('PATCH /api/articles', async t => {
  let patch_list = inserted_list.slice(-3)
  let patch_list_ids = patch_list.map(art => art._id.toString())

  let web = await ag.patch('/api/articles').expect(200).testJson({
    ids: patch_list_ids,
    data: {
      $push: { tags: {$each: ['Misaka10032', 'Sisters']} }
    }
  })

  let { data } = web.json

  const modelResult = await Model.Article.find({_id: {$in: patch_list_ids}})
  modelResult.forEach(art => {
    t.is(art.tags.includes('Misaka10032'), true)
    t.is(art.tags.includes('Sisters'), true)
  })
})

// 删除文章
test('DELETE /api/articles', async t => {
  let web = await ag.delete('/api/articles').send(delete_ids).expect(200).then(JsonMiddle)

  let {data} = web.json

  let list = await Model.Article.find()
  list.forEach(a => {
    t.false(delete_ids.includes(a._id.toString()))
  })
})

// 获取文章
test('GET /api/article/:articleid', async t => {
  const inserted = inserted_list.slice(-1).pop()
  const inserted_id = inserted._id.toString()

  let web = await ag.get(
    `/api/article/${inserted_id}`
  ).expect(200).then(JsonMiddle)

  const article = web.json.data

  t.is(article._id, inserted_id)
})

// 创建文章
test('POST /api/article', async t => {
  let web = await ag.post('/api/article').testJson({
    title: '這是一篇新的文章',
    content: '測試完成後就會被刪除',
    date: new Date(1970),
  }, 201)

  let new_article = web.json.data

  let inserted = await Model.Article.findOne({_id: new_article._id})

  t.is(new_article.title, inserted.title)

  await Model.Article.find({ _id: new_article._id }).remove()
})

// 获取分类列表
test('GET /api/categories', async t => {
  let web = await ag.get('/api/categories').expect(200).then(JsonMiddle)

  const name_list = web.json.data.map(r => r.name)

  t.is(name_list.length, 2)
  t.true(name_list.includes('cate_1'))
  t.true(name_list.includes('cate_2'))
})

// 创建分类
test('POST /api/category', async t => {
  const insert_cate = { name: 'new_cate'}
  let web = await ag.post('/api/category').testJson(insert_cate, 201)

  const new_category = web.json.data

  const category = await Model.Category.findOne({ _id: new_category._id})

  t.is(category.name, new_category.name)

  await category.remove()
})

// 修改分类
test('PATCH /api/category/:categoryid', async t => {
  const categories = await Model.Category.find()

  const inserted = categories.slice(-1).pop()
  const inserted_id = inserted._id.toString()

  let web = await ag.patch(`/api/category/${inserted_id}`).testJson({
    color: '#233'
  })

  let patched_category = await Model.Category.findOne({
    _id: inserted_id
  })
  patched_category = patched_category.toJSON()

  t.is(patched_category.color, '#233')
})

// 删除分类
test('DELETE /api/category/:categoryid', async t => {
  const new_cate = await (new Model.Category({ name: '我會被刪' })).save()
  const new_cate_id = new_cate._id.toString()
  let web = await ag.delete(`/api/category/${new_cate_id}`)
    .expect(200)
    .expect('Content-Type', /json/)
    .then(JsonMiddle)

  const deleted_cate = await Model.Category.findOne({ _id: new_cate_id })

  t.is(deleted_cate, null)
})
