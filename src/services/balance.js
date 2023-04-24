const TRANSACTIONS_TABLE = 'transactions'
const ACCOUNTS_TABLE = 'accounts'

const TRANSACAO_CONCLUIDA = true

module.exports = (app) => {
  const getBalanceByUserId = async (id) => {
    const balance = await app.db(TRANSACTIONS_TABLE)
      .sum('amount as balance')
      .join(ACCOUNTS_TABLE, `${ACCOUNTS_TABLE}.id`, '=', `${TRANSACTIONS_TABLE}.account_id`)
      .where({ user_id: id, status: TRANSACAO_CONCLUIDA })
      .where('date', '<=', new Date())
      .select(`${ACCOUNTS_TABLE}.id`)
      .groupBy(`${ACCOUNTS_TABLE}.id`)
      .orderBy(`${ACCOUNTS_TABLE}.id`)

    return balance

      ? JSON.parse(JSON.stringify(balance)) : null
  }

  return { getBalanceByUserId }
}