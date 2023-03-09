module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select();
  }

  const create = (user) => {
    return app.db('users').insert(user);
  }


  const selectByMail = (mail) => {
    return app.db('users').select().where('mail', mail)
  }

  return { findAll, create, selectByMail }
}