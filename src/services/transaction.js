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
    if (!transaction.amount) throw new ValidationError('Valor da transação é obrigatório')
    if (!transaction.account_id) throw new ValidationError('Conta referente à transação é obrigatória')
    validateTransactionType(transaction.type)

    transaction = formatTransactionamount(transaction)

    const listId = await app.db(TABLE_NAME).insert(transaction).returning('id');
    return listId[0]
  }

  const update = async (id, transaction) => {
    transaction = formatTransactionamount(transaction)
    return app.db(TABLE_NAME).update(transaction).where({ id });
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

  const removeByTransferID = async (id) => {
    return app.db(TABLE_NAME).delete().where({ transfer_id: id });
  }

  function formatTransactionamount(transaction) {
    if (transaction.type === TIPO_TRANSACAO_ENTRADA && transaction.amount < 0) {
      transaction.amount = transaction.amount * 1
    }

    if (transaction.type === TIPO_TRANSACAO_SAIDA && transaction.amount > 0) {
      transaction.amount = transaction.amount * -1
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

  return { findByAccountId, findByTransferId, create, findByDescriptionAccountId, findById, remove, removeByTransferID, update }
}