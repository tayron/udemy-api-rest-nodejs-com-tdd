const ValidationError = require('../erros/ValidationError')
const TRANSFERS_TABLE = 'transfers'
const ACCOUNTS_TABLE = 'accounts'

module.exports = (app) => {
  const findByUserId = async (id) => {
    const account = await app.db(TRANSFERS_TABLE).select()
      .where({ user_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const create = async (transfer) => {
    const listId = await app.db(TRANSFERS_TABLE).insert(transfer).returning('id');
    return listId[0]
  }

  const update = async (id, transfer) => {
    return app.db(TRANSFERS_TABLE).update(transfer).where({ id });
  }

  const validateData = async (transfer) => {
    if (!transfer.description) throw new ValidationError('Descrição deve ser informada')
    if (!transfer.date) throw new ValidationError('Data deve ser informada')
    if (!transfer.amount) throw new ValidationError('Valor deve ser informado')
    if (!transfer.origin_account_id) throw new ValidationError('Conta de origem deve ser informada')
    if (!transfer.destination_account_id) throw new ValidationError('Conta de destino deve ser informada')
    if (!transfer.user_id) throw new ValidationError('Usuário responsável pela transação deve ser informado')

    if (transfer.origin_account_id == transfer.destination_account_id) {
      throw new ValidationError('Conta de origem e destino não podem ser a mesma')
    }

    const accounts = await app.db(ACCOUNTS_TABLE)
      .whereIn('id', [transfer.origin_account_id, transfer.destination_account_id])

    accounts.forEach(account => {
      if (account.user_id != parseInt(transfer.user_id, 10)) {
        throw new ValidationError(`A conta #${account.id} não pertence ao usuário`)
      }
    });
  }

  const findById = async (id) => {
    const account = await app.db(TRANSFERS_TABLE).select()
      .where({ id }).first()

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const remove = async (id) => {
    return app.db(TRANSFERS_TABLE).delete().where({ id });
  }

  return { findByUserId, create, update, validateData, findById, remove }
}