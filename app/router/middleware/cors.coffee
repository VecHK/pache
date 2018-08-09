cors = require '@koa/cors'

module.exports = (app) ->
  app.use cors
    origin: '*'
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTION']
