module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select();
  }

  const create = (user) => {
    if (!user.name) return { error: 'Nome é obrigatório' }
    if (!user.mail) return { error: 'Email é obrigatório' }
    if (!user.password) return { error: 'Senha é obrigatória' }

    return app.db('users').insert(user);
  }


  const selectByMail = (mail) => {
    return app.db('users').select().where('mail', mail)
  }

  return { findAll, create, selectByMail }
}