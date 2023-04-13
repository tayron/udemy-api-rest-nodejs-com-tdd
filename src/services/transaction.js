const ValidationError = require('../erros/ValidationError')

const TABLE_NAME = 'transactions'
const TIPO_TRANSACAO_ENTRADA = 'ENTRADA';
const TIPO_TRANSACAO_SAIDA = 'SAIDA';

module.exports = (app) => {
  const findByAccountId = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ account_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const findByTransferId = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ transfer_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  const create = async (transaction) => {
    if (!transaction.description) throw new ValidationError('Descrição da transação é obrigatório')
    if (!transaction.date) throw new ValidationError('Data da transação é obrigatório')
    if (!transaction.ammount) throw new ValidationError('Valor da transação é obrigatório')
    if (!transaction.account_id) throw new ValidationError('Conta referente à transação é obrigatória')
    validateTransactionType(transaction.type)

    transaction = formatTransactionAmmount(transaction)
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

  const remove = async (id) => {
    return app.db(TABLE_NAME).delete().where({ id });
  }

  const update = async (id, transaction) => {
    transaction = formatTransactionAmmount(transaction)
    return app.db(TABLE_NAME).update(transaction).where({ id });
  }

  function formatTransactionAmmount(transaction) {
    if (transaction.type === TIPO_TRANSACAO_ENTRADA && transaction.ammount < 0) {
      transaction.ammount = transaction.ammount * 1
    }

    if (transaction.type === TIPO_TRANSACAO_SAIDA && transaction.ammount > 0) {
      transaction.ammount = transaction.ammount * -1
    }

    return transaction
  }

  function validateTransactionType(type) {
    if (!type) {
      throw new ValidationError('Tipo da transação é obrigatório')
    }

    if (type !== TIPO_TRANSACAO_ENTRADA && type !== TIPO_TRANSACAO_SAIDA) {
      throw new ValidationError('Tipo da transação inválida')
    }
  }

  return { findByAccountId, findByTransferId, create, findByDescriptionAccountId, findById, remove, update }
}