module.exports = (app) => {
  const findAll = () => {
    return app.db('accounts').select();
  }

  const create = async (user) => {
    if (!user.name) return { error: 'Nome é obrigatório' }
    if (!user.user_id) return { error: 'Usuário é obrigatório' }

    return app.db('accounts').insert(user);
  }

  const findByNameUserId = async (name, userId) => {
    const users = await app.db('accounts').select().where({ name, user_id: userId });
    return JSON.parse(JSON.stringify(users))
  }

  return { findAll, create, findByNameUserId }
}