require('coffeescript/register')

const supertest = require('supertest')

const envir = require('../envir')
const TEST_DB = 'pache3_test'
envir.db = `mongodb://127.0.0.1:27017/${TEST_DB}`
envir.limit = 3
envir.pass = '測試用的哦'

/**
  JSON 統一格式
  @param msg 消息
  @param code 返回碼，無錯誤時通常為 0
  @param result 返回的結果
*/
const JsonMiddle = (res) => {
  try {
    res.json = JSON.parse(res.text)
  } catch (e) {
    console.warn('JsonMiddle fail, text:', res.text)
    throw e
  }
  return res
}

supertest.Test.prototype.testJson = function (value, status = 200) {
  value = JSON.stringify(value)
  return this.set('Content-Type', 'application/json')
    .send(value)
    .expect(status)
    .expect('Content-Type', /json/)
    .then(JsonMiddle)
}

supertest.Test.prototype.json = function (expect_status = 200) {
  return this.set('Content-Type', 'application/json')
    .expect(expect_status)
    .expect('Content-Type', /json/)
    .then(JsonMiddle)
}

supertest.Test.prototype.sendJson = function (value) {
  if (typeof(value) === 'object') {
    value = JSON.stringify(value)
  }
  return this.set('Content-Type', 'application/json')
    .send(value)
}

module.exports = {
  JsonMiddle,
  envir,
  Model: require('../app/model')
}
