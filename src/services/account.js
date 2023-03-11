module.exports = (app) => {

  const findById = async (id) => {
    const user = await app.db('accounts').select()
      .where({ id }).first()

    return JSON.parse(JSON.stringify(user))
  }

  const findAll = () => {
    return app.db('accounts').select();
  }

  const create = async (user) => {
    if (!user.name) return { error: 'Nome é obrigatório' }
    if (!user.user_id) return { error: 'Usuário é obrigatório' }

    return app.db('accounts').insert(user);
  }

  const findByNameUserId = async (name, userId) => {
    const users = await app.db('accounts').select()
      .where({ name, user_id: userId }).first();

    return JSON.parse(JSON.stringify(users))
  }

  return { findById, findAll, create, findByNameUserId }
}