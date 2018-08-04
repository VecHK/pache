const path = require('path')
const root_dir = require('app-root-path').toString()
const envir = require(path.join(root_dir, './envir'))

require('coffeescript/register')

// 路由
module.exports = function (app) {
  // cookie keys
  app.keys = [envir.session_secret];

  [
    './middleware/cors',
    './middleware/alias',
    './middleware/session',
    './middleware/gzip',
    './middleware/views',
    './middleware/redirect-to-master-domain',
    './api',
    './page',
    './static'
  ].map(p => {
    require(p)(app, envir)
  })
}
