module.exports = function (app, envir) {
  // 是否強制跳轉到主域名
  envir.force_redirect_to_master_domain && app.use(async (ctx, next) => {
    console.warn(ctx.hostname, envir.master_domain)
    if (ctx.hostname.trim() !== envir.master_domain.trim()) {
      let protocol = envir.force_https ? 'https' : ctx.protocol
      let port = envir.force_https ? envir.https_port : envir.port
      return ctx.redirect(`${protocol}://${envir.master_domain}:${envir.port}${ctx.url}`)
    }
    await next()
  })
}
