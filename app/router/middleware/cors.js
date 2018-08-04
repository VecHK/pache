const cors = require('koa-cors')

// cors
module.exports = function (app) {
  app.use(cors({
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTION'],
  }))
}
