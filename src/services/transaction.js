// const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const findByAccountId = async (id) => {
    const account = await app.db('transactions').select()
      .where({ account_id: id })

    return account ? JSON.parse(JSON.stringify(account)) : null
  }

  return { findByAccountId }
}