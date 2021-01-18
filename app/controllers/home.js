const path = require('path')
class HomeCtl {
  index(ctx) {
    ctx.body = '这是主页'
  }

  // 通用方法 不加前缀
  upload(ctx) {
    // 名叫 file
    const file = ctx.request.files.file

    // 得到图片名称 + 拓展名
    const basename = path.basename(file.path)
    // ctx.origin 域名
    ctx.body = {
      url: `${ctx.origin}/uploads/${basename}`
    }
  }
}

module.exports = new HomeCtl()