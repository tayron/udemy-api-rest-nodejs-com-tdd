const ValidationError = require('../erros/ValidationError')

const TABLE_NAME = 'transactions'

module.exports = (app) => {
  const findByAccountId = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ account_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const create = async (transaction) => {
    if (!transaction.description) throw new ValidationError('Descrição da transação é obrigatório')
    if (!transaction.date) throw new ValidationError('Data da transação é obrigatório')
    if (!transaction.ammount) throw new ValidationError('Valor da transação é obrigatório')
    if (!transaction.type) throw new ValidationError('Tipo da transação é obrigatório')
    if (!transaction.account_id) throw new ValidationError('Conta referente à transação é obrigatória')

    return app.db(TABLE_NAME).insert(transaction);
  }

  const findByDescriptionAccountId = async (description, accountId) => {
    const transaction = await app.db(TABLE_NAME).select()
      .where({ description, account_id: accountId }).first();

    return transaction ? JSON.parse(JSON.stringify(transaction)) : null
  }

  const findById = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ id }).first()

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  return { findByAccountId, create, findByDescriptionAccountId, findById }
}