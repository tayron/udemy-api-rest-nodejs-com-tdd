module.exports = (app) => {
  const findAll = () => {
    return app.db('users').select();
  }

  const create = async (user) => {
    if (!user.name) return { error: 'Nome é obrigatório' }
    if (!user.mail) return { error: 'Email é obrigatório' }
    if (!user.password) return { error: 'Senha é obrigatória' }

    const userCreated = await selectByMail(user.mail)
    if (userCreated.length > 0) return { error: 'Já existe um usuário com este email' }

    return app.db('users').insert(user);
  }

  const selectByMail = (mail) => {
    return app.db('users').select().where('mail', mail)
  }

  return { findAll, create, selectByMail }
}