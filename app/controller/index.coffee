module.exports = class Controller
  constructor ->
    new Proxy this,
      get: (target, key) ->
        handle = target[key]
        handle = handle.bind(target) if typeof handle == 'function'
        handle
