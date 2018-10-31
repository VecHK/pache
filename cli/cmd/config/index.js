const root_dir = require('app-root-path').toString()

const inquirer = require('inquirer')

const fs = require('fs')
const path = require('path')

const constructQuestion = require('./construct-question')
const createConfigSucData = require('./create-config')

function getQuestion(config_path) {
  const envir = require(`${root_dir}/envir`)
  if (!config_path) {
    throw new Error('请输入 <config_path>')
  } else if (fs.exists(config_path)) {
    envir.setConfigPath(config_path)
    envir.reload()
    return constructQuestion(Object.assign({}, envir))
  } else {
    return constructQuestion()
  }
}

function fillAnswers(source_answers) {
  const answers = Object.assign(source_answers)

  if (!answers.ESD_LIST) {
    answers.ESD_LIST = []
  } else {
    const raw_list = answers.ESD_LIST
    answers.ESD_LIST = raw_list.split('\r\n')
  }
  if (!answers.IMAGE_PATH) {
    answers.IMAGE_PATH = ''
  }
  if (!answers.enable_https) {
    Object.assign(answers, {
      https_port: 443,
      private_key: '',
      certificate: '',
      force_https: true,
    })
  }

  return answers
}

function writeConfig(config_path, suc_data) {
  let status
  if (fs.existsSync(config_path)) {
    status = '已更新'
  } else {
    status = '已创建'
  }

  fs.writeFileSync(config_path, suc_data)

  if (path.isAbsolute(config_path)) {
    console.log('\n配置文件 ' + `${config_path}` + ` ${status}`)
  } else {
    const config_abs_path = fs.realpathSync(config_path)
    console.log('\n配置文件 ' + `${config_abs_path}` + ` ${status}`)
  }
}

module.exports = argv => {
  const { config_path } = argv

  const questions = getQuestion(config_path)

  inquirer.prompt(questions).then(answers => {
    const filled_answers = fillAnswers(answers)

    return createConfigSucData(filled_answers)
  }).then(suc_data => {
    writeConfig(config_path, suc_data)
  })
}
