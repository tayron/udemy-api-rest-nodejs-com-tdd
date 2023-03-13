const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const remove = async (id) => {
    return app.db('accounts').delete().where({ id });
  }
  const update = async (id, account) => {
    return app.db('accounts').update(account).where({ id });
  }

  const findById = async (id) => {
    const user = await app.db('accounts').select()
      .where({ id }).first()

    return JSON.parse(JSON.stringify(user))
  }

  const findAll = async () => {
    return app.db('accounts').select();
  }

  const create = async (account) => {
    if (!account.name) throw new ValidationError('Nome é obrigatório')
    if (!account.user_id) throw new ValidationError('Usuário é obrigatório')

    return app.db('accounts').insert(account);
  }

  const findByNameUserId = async (name, userId) => {
    const users = await app.db('accounts').select()
      .where({ name, user_id: userId }).first();

    return JSON.parse(JSON.stringify(users))
  }

  return { remove, update, findById, findAll, create, findByNameUserId }
}