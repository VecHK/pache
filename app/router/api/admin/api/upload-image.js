const root_dir = require('app-root-path').resolve

const fs = require('fs')
const path = require('path')
const parse = require('async-busboy')
const utils = require('utility')

const envir = require(root_dir('envir'))

const Router = require('koa-router')

function readFile(address) {
  const args = arguments
  return new Promise((res, rej) => {
    fs.readFile(address, function (err, content) {
      err ? rej(err) : res(content)
    })
  })
}

const IMG_POOL_PATH = envir.IMAGE_PATH || root_dir('img_pool')

if (!fs.existsSync(IMG_POOL_PATH)) {
  fs.mkdir(IMG_POOL_PATH)
}
// console.log('image pool path:', IMG_POOL_PATH)

module.exports = function () {
  const router = new Router

  router.post('/img', async (ctx, next) => {
    console.log('start recevie image')

    const {files, fields} = await parse(ctx.req, {
      limits: {
        fieldSize: 32 * 1024 * 1024,
        fileSize: 64 * 1024 * 1024,
      },
    })

    console.info('fields:', fields)
    console.info('files:', files)

    let file = files[files.length - 1]

    const [type, extname] = fields.mimeType.split('/')
    const hash = utils.md5(await readFile(file.path))
    const filename = `${hash}.${extname}`
    const file_path = path.join(IMG_POOL_PATH, `/${filename}`)

    const stream = fs.createWriteStream(file_path)
    const result = await (new Promise((res, rej) => {
      file.pipe(stream)
      file.on('end', () => {
        res(file_path)
      })
    }))

    console.info('save:', result)

    const {apiBack} = ctx
    apiBack.result = filename
    apiBack.hash = hash
    apiBack.msg = 'ok'
    await next()
  })

  return router
}
