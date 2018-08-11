root_dir = (require 'app-root-path').resolve

fs = require 'fs'

out = require root_dir 'screen-output'

CHANGE_TIMEOUT = 1500

exclude = /(^page$)|(^page-dist$)|(^static$)|(^views$)/

watch_dir = (fs.readdirSync root_dir 'app')
  .filter (path) ->
    !exclude.test(path)
  .map (p) -> root_dir "app/#{p}"

watch_options =
  persistent: true
  ignoreInitial: true
  followSymlinks: false

getWatch = () ->
  chokidar = require 'chokidar'
  chokidar.watch watch_dir, watch_options

module.exports =
  watch: ({ preChange, change }) ->
    timeout = 0
    getWatch().on 'all', ->
      out.tips 'app change detected, will change' if !timeout

      preChange()

      clearTimeout timeout
      timeout = setTimeout ->
        timeout = 0
        change()
      , CHANGE_TIMEOUT
