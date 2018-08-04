root_dir = (require 'app-root-path').resolve

CHANGE_TIMEOUT = 1500

getWatch = () ->
  chokidar = require 'chokidar'
  chokidar.watch [
    root_dir('app/controller'),
    root_dir('app/lib'),
    root_dir('app/model'),
    root_dir('app/page'),
    root_dir('app/router'),
    root_dir('app/service'),
    root_dir('app/index.js')
  ],
    persistent: true
    ignoreInitial: true
    followSymlinks: false

module.exports =
  watch: ({ preChange, change }) ->
    timeout = 0
    watch = getWatch()
    watch.on 'all', (event, path) ->
      console.log 'detect app change, will change' if !timeout
      preChange()

      clearTimeout timeout
      timeout = setTimeout () ->
        timeout = 0
        change watch
      , CHANGE_TIMEOUT
