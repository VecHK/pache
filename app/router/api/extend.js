const handles = {
  // `this` is middleware context(ctx)
  back(data = null, code = 200) {
    this.remove('Content-Length')
    this.type = 'json'

    this.status = code
    this.body = JSON.stringify(data)

    return this
  },

  backCreated(data = 'created') {
    return this.back(data, 201)
  },

  backBadRequest(message = 'bad request') {
    return this.back(message, 400)
  },

  backNotFound(message = 'not found') {
    return this.back(message, 404)
  },

  backConflict(message = 'resource conflict') {
    return this.back(message, 409)
  },

  backGone(message = 'resource was delete') {
    return this.back(message, 410)
  },

  backError(message, code = 500) {
    return this.back(message, code)
  },
}
const generateGetters = obj => Object.assign({},
  ...Object.keys(obj).map(key => ({
    [key]: {
      get: () => obj[key]
    }
  }))
)

module.exports = function () {
  return Object.assign(function bindingContext(app) {
    Object.defineProperties(
      app.context,
      generateGetters(handles)
    )
  }, {
    middleWare(ctx, next) {
      return next().then(() => {
        console.log(ctx.body, ctx.status, typeof(ctx.status))

        if ((!ctx.body) && (ctx.status === 404)) {
          ctx.backNotFound()
        }
      }).catch(err => {
        console.error(err.code, err)
        ctx.backError(err.message, err.code || err.status || 500)
      })
    },

    extendError(message = 'internal error', code = 500) {
      return Object.assign(new Error(message), { code })
    },

    throwError() {
      throw this.extendError(...arguments)
    },
  })
}
