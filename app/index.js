require('coffeescript/register')

const Koa = require('koa')
const router = require('./router')

const app = new Koa
router(app)

module.exports = app
