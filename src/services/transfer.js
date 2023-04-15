const ValidationError = require('../erros/ValidationError')
const TABLE_NAME = 'transfers'

module.exports = (app) => {
  const findByUserId = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ user_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const create = async (transfer) => {
    if (!transfer.description) throw new ValidationError('Descrição deve ser informada')
    if (!transfer.date) throw new ValidationError('Data deve ser informada')
    if (!transfer.amount) throw new ValidationError('Valor deve ser informado')
    if (!transfer.origin_account_id) throw new ValidationError('Conta de origem deve ser informada')
    if (!transfer.destination_account_id) throw new ValidationError('Conta de destino deve ser informada')
    if (!transfer.user_id) throw new ValidationError('Usuário responsável pela transação deve ser informado')

    if (transfer.origin_account_id == transfer.destination_account_id) {
      throw new ValidationError('Conta de origem e destino não podem ser a mesma')
    }

    if (transfer.origin_account_id != transfer.user_id) {
      throw new ValidationError('Conta de origem deve pertencer ao usuário logado')
    }

    const listId = await app.db(TABLE_NAME).insert(transfer).returning('id');
    return listId[0]
  }

  const findById = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ id }).first()

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  return { findByUserId, create, findById }
}