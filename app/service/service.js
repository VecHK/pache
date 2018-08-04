const extend = require('../router/api/extend')()

class Service { }
Object.assign(Service.prototype, {
  Error: extend.Error
})

const service = new Service

module.exports = Service
