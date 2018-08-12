const root_dir = require('app-root-path').resolve
const out = require(root_dir('./screen-output'))

const handles = {
  // `this` is middleware context(ctx)
  back(data = null, code = 200) {
    this.remove('Content-Length')
    this.type = 'json'

    this.status = code
    this.body = {
      data
    }

    return this
  },

  backCreated(data = 'created') {
    return this.back(data, 201)
  },

  backBadRequest(message = 'bad request') {
    return this.backFailMessage(message, 400)
  },

  backNotFound(message = 'not found') {
    return this.backFailMessage(message, 404)
  },

  backConflict(message = 'resource conflict') {
    return this.backFailMessage(message, 409)
  },

  backGone(message = 'resource was delete') {
    return this.backFailMessage(message, 410)
  },

  backError(message, code = 500) {
    return this.backFailMessage(message, code)
  },

  backFailMessage(message, code = 500) {
    this.back({ message }, code)
  },
}
const generateGetters = obj => Object.assign({},
  ...Object.keys(obj).map(key => ({
    [key]: {
      get: () => obj[key]
    }
  }))
)

const extendProperties = {
  middleWare(ctx, next) {
    return next().then(() => {
      console.log(ctx.body, ctx.status, typeof(ctx.status))

      if ((!ctx.body) && (ctx.status === 404)) {
        ctx.backNotFound()
      }
    }).catch(err => {
      out.error(`API got an Error: ${err.message} (code: ${err.code})\n ${err.stack}`)
      ctx.backError(err.message, err.statusCode || 500)
    })
  },

  Error(message = 'internal error', statusCode = 500) {
    return Object.assign(new Error(message), { statusCode })
  },

  throwError() {
    throw this.Error(...arguments)
  },
}

module.exports = function () {
  return Object.assign(function bindingContext(app) {
    Object.defineProperties(
      app.context,
      generateGetters(handles)
    )
  }, extendProperties)
}
