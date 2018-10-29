const envir = require('../../envir')
const extend = require('../router/api/extend')()

class Service {}

Object.assign(Service.prototype, {
  Error: extend.Error,
  envir
})

module.exports = Service
