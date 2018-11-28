const root_dir = require('app-root-path').toString()
const path = require('path')
const yargs = require('yargs')

const argvPreprocess = require('./utils/pre-process')

yargs
  .command({
    command: 'view <config_path>',
    desc: '查看 Pache 配置文件信息',
    handler: argvPreprocess(argv => {
      const envir = require(`${root_dir}/envir`)
      envir.printInfo()
    }, ['config-path'])
  })
  .command({
    command: 'config <config_path>',
    desc: '配置文件交互程序',
    handler: argvPreprocess('config'),
  })
  .command({
    command: 'refresh <config_path>',
    desc: '（实验）刷新全部文章',
    handler: argvPreprocess('refresh', ['config-path']),
  })
  .command({
    command: 'version',
    desc: '查看版本',
    handler: () => console.log( require('../package').version ),
  })
  .example('pache run ./my-config.suc')
  .command({
    command: 'run <config_path>',
    desc: '启动 web 服务器',
    handler: argv => {
      try {
        const envir = require(path.join(root_dir, './envir'))

        let sucPath = path.join(root_dir, './config.suc')

        envir.setConfigPath(sucPath)
        envir.reload()

        require(`${root_dir}/process/master`)()
      } catch (e) {
        console.error(e)
        throw e
      }

    },
  })
  .usage('用法： pache [command] [option]')
  .help('h')
  .alias('h', 'help')
  .command({
    command: '*',
    handler: argv => {
      require('child_process').exec(`node ${__filename} help`, (err, stdout, stderr) => {
        if (!err) {
          console.log(stdout)
        }
      })
    }
  })
  .argv
