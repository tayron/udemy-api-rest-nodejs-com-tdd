// const ValidationError = require('../erros/ValidationError')

const TABLE_NAME = 'transactions'

module.exports = (app) => {
  const findByAccountId = async (id) => {
    const account = await app.db(TABLE_NAME).select()
      .where({ account_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  return { findByAccountId }
}