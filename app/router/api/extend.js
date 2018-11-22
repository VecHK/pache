const root_dir = require('app-root-path').resolve
const out = require(root_dir('./screen-output'))

const handles = {
  // `this` is middleware context(ctx)
  back(data = null, code = 200) {
    this.remove('Content-Length')
    this.type = 'json'

    if (data instanceof Promise) {
      this.status = 500
      this.body = { message: 'back data is instanceof Promise' }
      out.error(`back data is instanceof Promise:`, data)
    } else {
      this.status = code
      this.body = JSON.stringify(data)
    }

    return this
  },

  backCreated(data = 'created') {
    return this.back(data, 201)
  },

  backBadRequest(message = 'bad request') {
    return this.backFailMessage(message, 400)
  },

  backUnauthorized(message = 'Unauthorized') {
    return this.backFailMessage(message, 401)
  },

  backForbidden(message = 'Forbidden') {
    return this.backFailMessage(message, 403)
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

  backLocked(message = 'Locked') {
    return this.backFailMessage(message, 423)
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
      if ((!ctx.body) && (ctx.status === 404)) {
        ctx.backNotFound()
      }
    }).catch(err => {
      if (!err.is_interrup && !err.is_jwt_error) {
        out.error(`API got an Error: ${err.message}\n ${err.stack}`)
      }

      ctx.backError(err.message, err.statusCode || 500)
    })
  },

  Error(message = 'internal error', statusCode = 500) {
    return Object.assign(Error(message), { statusCode })
  },

  Interrup(message, statusCode) {
    return Object.assign(Error(message), { statusCode, is_interrup: true })
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
