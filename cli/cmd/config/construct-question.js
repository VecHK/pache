const createQuestion = (name, type, assign = {}) => ({
  name,
  question: Object.assign({
    type, name,
  }, assign),
})

const default_question = {
  db: 'mongodb://127.0.0.1:27017/pache3',
  // JWT_TOKEN: '',
  // pass: "",
  port: 80,
  session_secret: 'the_pache_session_secret',
  limit: 10,
  repost_color: '#46c01b',
  // master_domain: '',
  FORCE_REDIRECT_TO_MASTER_DOMAIN: false,
  USE_H2: false,
  H2_PORT: 443,
  FORCE_H2: true,
  // PRIVATE_KEY: '',
  // CERTIFICATE: '',
  markdown_entitles: false,
  GZIP_ENABLE: true,
  PUG_CACHE: true,
  META_IMG: true,
  cluster_fork_num: 0,
  ESD_ENABLE: false,
  // ESD_LIST: [],
}

module.exports = function (pre_fill = default_question) {
  const pre_questions = [
    createQuestion('db', 'input', {
      message: 'MongoDB URL',
    }),
    createQuestion('JWT_TOKEN', 'input', {
      message: 'JWT TOKEN',
    }),
    createQuestion('pass', 'password', {
      mask: '*',
      message: '管理员密码',
      validate: pass => {
        if (pass.length) {
          return true
        } else {
          return '不能是空密码'
        }
      },
    }),
    createQuestion('retry_pass', 'password', {
      message: '确认管理员密码',
      mask: '*',
      validate: (retry_pass, ctx) => {
        if (ctx.pass === retry_pass) {
          return true
        } else {
          return '与首次输入的密码不一致'
        }
      },
    }),

    createQuestion('port', 'input', {
      message: 'HTTP 端口',
    }),
    createQuestion('session_secret', 'input', {
      message: 'session 密钥',
    }),
    createQuestion('limit', 'input', {
      message: '单页最大文章数',
    }),
    createQuestion('IMAGE_PATH', 'input', {
      message: '图片存储目录，按回车则使用默认路径',
    }),

    createQuestion('repost_color', 'input', {
      message: '转载文章的颜色',
    }),

    createQuestion('FORCE_REDIRECT_TO_MASTER_DOMAIN', 'confirm', {
      message: '是否强制重定向到主域名',
    }),
    createQuestion('master_domain', 'input', {
      message: '主域名',
      when: (ctx) => {
        if (ctx.FORCE_REDIRECT_TO_MASTER_DOMAIN) {
          return true
        } else {
          ctx.master_domain = ''
        }
      },
    }),

    createQuestion('USE_H2', 'confirm', {
      message: '启用 http/2',
    }),
    createQuestion('H2_PORT', 'input', {
      message: 'http/2 端口',
      when: ctx => ctx.USE_H2,
    }),
    createQuestion('PRIVATE_KEY', 'input', {
      message: '私钥文件路径',
      when: ctx => ctx.USE_H2,
    }),
    createQuestion('CERTIFICATE', 'input', {
      message: '证书文件路径',
      when: ctx => ctx.USE_H2,
    }),
    createQuestion('FORCE_H2', 'confirm', {
      message: '是否强制跳转到 HTTPS',
      when: ctx => ctx.USE_H2,
    }),

    createQuestion('markdown_entitles', 'confirm', {
      message: '已格式化的 Markdown 文章是否转换为 HTML 实体字符',
    }),

    createQuestion('GZIP_ENABLE', 'confirm', {
      message: '启用 GZIP？',
    }),

    createQuestion('PUG_CACHE', 'confirm', {
      message: '启用 Pug 模板缓存？',
    }),

    createQuestion('META_IMG', 'confirm', {
      message: '启用图片框？',
    }),

    createQuestion('cluster_fork_num', 'input', {
      message: 'cluster 线程数，0 为自动判断',
    }),

    createQuestion('ESD_ENABLE', 'confirm', {
      message: '启用 ESD?',
    }),
    createQuestion('ESD_LIST', 'editor', {
      message: '输入 ESD 列表',
      validate: text => {
        return true
      },
      when: answers => answers.ESD_ENABLE,
    })
  ]

  return pre_questions.map(pre_que => {
    const { name, question } = pre_que

    if ((pre_fill[name] !== undefined)) {
      Object.assign(question, {
        default: pre_fill[name]
      })
    }
    return question
  })
}
