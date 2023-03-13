module.exports = (app) => {
  app.route('/auth/signin')
    .post(app.routes.auth.signin)

  app.route('/users')
    .all(app.config.passport.authenticate())
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