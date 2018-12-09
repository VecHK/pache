const root_dir = require('app-root-path').resolve;

const resource = require(root_dir('app/lib/resource-router'));

const controller = require(root_dir('./app/controller/api/playlist'));

const Router = require('koa-router');

module.exports = function () {

  const router = new Router;

  resource(router, '/playlist',controller);

  return router
}
