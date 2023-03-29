const ValidationError = require('../erros/ValidationError')

const TABLE_NAME = 'accounts'

module.exports = (app) => {
  const remove = async (id) => {
    return app.db(TABLE_NAME).delete().where({ id });
  }
  const update = async (id, account) => {
    return app.db(TABLE_NAME).update(account).where({ id });
  }

  const findById = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ id }).first()

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const findAll = async () => {
    return app.db(TABLE_NAME).select();
  }

  const findByUserId = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ user_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const create = async (account) => {
    if (!account.name) throw new ValidationError('Nome é obrigatório')
    if (!account.user_id) throw new ValidationError('Usuário é obrigatório')

    const accountExist = await findByNameUserId(account.name, account.user_id)
    if (accountExist) throw new ValidationError('Já existe uma conta com nome informado')

    return app.db(TABLE_NAME).insert(account);
  }

  const findByNameUserId = async (name, userId) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ name, user_id: userId }).first();

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  return { remove, update, findById, findAll, create, findByNameUserId, findByUserId }
}