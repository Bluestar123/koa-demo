const db = [{name: '小李'}]

class UsersCtl {
  find(ctx) {
    ctx.body = db
  }
  findById(ctx) {
    ctx.body = db[ctx.params.id * 1]
  }
  create(ctx) {
    db.push(ctx.request.body)
    ctx.body = ctx.request.body
  }
  update(ctx) {

  }
  del(ctx) {

  }
}

module.exports = new UsersCtl