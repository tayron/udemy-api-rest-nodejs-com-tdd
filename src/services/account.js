const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const remove = async (id) => {
    return app.db('accounts').delete().where({ id });
  }
  const update = async (id, account) => {
    return app.db('accounts').update(account).where({ id });
  }

  const findById = async (id) => {
    const account = await app.db('accounts').select()
      .where({ id }).first()

    return account ? JSON.parse(JSON.stringify(account)) : null
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
    const account = await app.db('accounts').select()
      .where({ name, user_id: userId }).first();

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  return { remove, update, findById, findAll, create, findByNameUserId }
}