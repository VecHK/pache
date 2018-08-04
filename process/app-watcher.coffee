root_dir = (require 'app-root-path').resolve

CHANGE_TIMEOUT = 1500

watch_dir = [
  'app/controller',
  'app/lib',
  'app/model',
  'app/page',
  'app/router',
  'app/service',
  'app/index.js'
].map (p) -> root_dir p

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
    getWatch().on 'all', (event, path) ->
      console.log 'app change detected, will change' if !timeout

      preChange()

      clearTimeout timeout
      timeout = setTimeout () ->
        timeout = 0
        change()
      , CHANGE_TIMEOUT
