# 控制器需要继承此类，方可实现实例方法绑定上下文

module.exports = class Controller
  constructor: ->
    return new Proxy this,
      get: (target, key) ->
        handle = target[key]
        handle = handle.bind(target) if typeof handle == 'function'
        handle
