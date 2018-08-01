const root_dir = require('app-root-path').toString()
const path = require('path')

module.exports = argv => {
  const envir = require(`${root_dir}/envir`)
  let sucPath = argv.config_path || path.join(root_dir, './config.suc')
  envir.CONFIG_PATH = sucPath
  envir.reload()
}
