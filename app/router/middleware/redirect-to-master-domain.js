module.exports = function (app, envir) {
  // 是否強制跳轉到主域名
  envir.FORCE_REDIRECT_TO_MASTER_DOMAIN && app.use(async (ctx, next) => {
    console.warn(ctx.hostname, envir.master_domain)
    if (ctx.hostname.trim() !== envir.master_domain.trim()) {
      let protocol = envir.FORCE_H2 ? 'https' : ctx.protocol
      let port = envir.FORCE_H2 ? envir.H2_PORT : envir.port
      return ctx.redirect(`${protocol}://${envir.master_domain}:${envir.port}${ctx.url}`)
    }
    await next()
  })
}
