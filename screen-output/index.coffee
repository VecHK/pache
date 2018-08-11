_chalk = require 'chalk'
chalk = new _chalk.constructor { enabled: true, level: 3 }

dir_var = require './dir_var'

fnThunk = (back, outter = console.log) ->
  -> outter back arguments...

out =
  info: fnThunk chalk.blue
  tips: fnThunk chalk.keyword 'aqua'
  warn: fnThunk chalk.yellow
  error: fnThunk chalk.red, console.error
  var: dir_var

module.exports = new Proxy out,
  get: (target, key, receiver) ->
    unless target.hasOwnProperty key
      throw new Error "no out method: \"#{key}\""
    else
      () ->
        target[key] arguments...
        return receiver
      .bind target
