module.exports = (app) => {
  app.route('/users')
    .get(app.routes.users.findAll)
    .post(app.routes.users.create)

  app.route('/accounts/:id')
    .get(app.routes.accounts.findById)
    .patch(app.routes.accounts.update)
    .delete(app.routes.accounts.remove)

  app.route('/accounts')
    .get(app.routes.accounts.findAll)
    .post(app.routes.accounts.create)
}