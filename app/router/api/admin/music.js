const root_dir = require('app-root-path').resolve;

const resource = require(root_dir('app/lib/resource-router'));

const controller = require(root_dir('./app/controller/api/music'));

const Router = require('koa-router');

module.exports = function () {

  const router = new Router;

  resource(router, '/music',controller);

  return router
}
