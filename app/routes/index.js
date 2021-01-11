const fs = require('fs')

// app koa实例
module.exports = (app) => {
  fs.readdirSync(__dirname).forEach(file => {
    if (file === 'index.js') return
    const router = require(`./${file}`)
    // allowedMethods 响应 options
    app.use(router.routes()).use(router.allowedMethods())
  })
}