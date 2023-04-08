const request = require('supertest')
const jwt = require('jwt-simple');
const app = require('../../src/app');

const TOKEN_SECRET = 'Segredo'
const TRANSACTION_ROTE = '/v1/transactions'
const ACCOUNT_ROUTE = '/v1/accounts'

const TABLE_TRANSACTIONS = 'transactions'
const TABLE_ACCOUNTS = 'accounts'
const TABLE_USERS = 'users'


let user1
let user2

let accountUser1
let accountUser2

describe('Transactions', () => {
  beforeAll(async () => {
    await app.db(TABLE_TRANSACTIONS).del()
    await app.db(TABLE_ACCOUNTS).del()
    await app.db(TABLE_USERS).del()

    await app.db(TABLE_USERS).insert([
      { name: 'User #1', mail: 'user1@mail.com', password: '$2a$10$39cN.qZ8MK7ElaMJGfEiHe3bJg//Vq7xV2viQKgg79a7Wvsc73tES' },
      { name: 'User #2', mail: 'user2@mail.com', password: '$2a$10$39cN.qZ8MK7ElaMJGfEiHe3bJg//Vq7xV2viQKgg79a7Wvsc73tES' }
    ])

    user1 = await app.services.user.findByMail('user1@mail.com')
    user1.token = jwt.encode(user1, TOKEN_SECRET)

    user2 = await app.services.user.findByMail('user2@mail.com')
    user2.token = jwt.encode(user2, TOKEN_SECRET)

    await app.db(TABLE_ACCOUNTS).insert([
      { name: 'Account #1', 'user_id': user1.id },
      { name: 'Account #2', 'user_id': user2.id }
    ])

    accountUser1 = (await app.services.account.findByUserId(user1.id))[0]
    accountUser2 = (await app.services.account.findByUserId(user2.id))[0]
  })

  test('Deve listar apenas as transações do usuário', async () => {
    const transactionsList = [
      { description: 'T1', date: new Date(), ammount: 100, type: 'ENTRADA', account_id: accountUser1.id },
      { description: 'T2', date: new Date(), ammount: 300, type: 'SAIDA', account_id: accountUser2.id }
    ]

    await app.db(TABLE_TRANSACTIONS).insert(transactionsList)

    return request(app).get(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .then(res => {
        const transactions = res.body[0].transactions
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1);
        expect(transactions[0].description).toBe('T1');
      })
  })

  test('Deve inserir uma transação com sucesso', async () => {
    const transaction = {
      description: 'new T',
      date: new Date(),
      ammount: 100,
      type: 'ENTRADA',
      account_id: accountUser1.id
    }

    return await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.account_id).toBe(accountUser1.id)
        expect(res.body.ammount).toBe(100)
      })
  })

  test('Deve inserir transação de entrada com valor positiva', async () => {
    const transaction = {
      description: 'new T',
      date: new Date(),
      ammount: '-100',
      type: 'ENTRADA',
      account_id: accountUser1.id
    }

    return await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.account_id).toBe(accountUser1.id)
        expect(res.body.ammount).toBe(100)
      })
  })

  test('Deve inserir transação de saída com valor negativo', async () => {
    const transaction = {
      description: 'new T SAIDA',
      date: new Date(),
      ammount: 100,
      type: 'SAIDA',
      account_id: accountUser1.id
    }

    return await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.account_id).toBe(accountUser1.id)
        expect(res.body.ammount).toBe(-100)
      })
  })

  const templateTestTransacaoIbvalida = async (newData, errorMessage) => {
    const transaction = {
      description: 'new T SAIDA',
      date: new Date(),
      ammount: 100,
      type: 'SAIDA',
      account_id: accountUser1.id
    }

    return await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send({ ...transaction, ...newData })
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      })
  }

  test('Não deve inserir uma transação sem descrição',
    async () => templateTestTransacaoIbvalida(
      { description: null }, 'Descrição da transação é obrigatório'))

  test('Não deve inserir uma transação sem valor',
    async () => templateTestTransacaoIbvalida(
      { ammount: null }, 'Valor da transação é obrigatório'))

  test('Não deve inserir uma transação sem data',
    async () => templateTestTransacaoIbvalida(
      { date: null }, 'Data da transação é obrigatório'))

  test('Não deve inserir uma transação sem conta',
    async () => templateTestTransacaoIbvalida(
      { account_id: null }, 'Conta referente à transação é obrigatória'))

  test('Não deve inserir uma transação sem tipo',
    async () => templateTestTransacaoIbvalida(
      { type: null }, 'Tipo da transação é obrigatório'))

  test('Não deve inserir uma transação com tipo errado',
    async () => templateTestTransacaoIbvalida(
      { type: 'RETIRADA' }, 'Tipo da transação inválida'))

  test('Deve retornar uma transação por id', async () => {
    const transaction = {
      description: 'new T ID',
      date: new Date(),
      ammount: 100,
      type: 'ENTRADA',
      account_id: accountUser1.id
    }

    const transactionCreated = await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)

    await request(app).get(`${TRANSACTION_ROTE}/${transactionCreated.body.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.id).toBe(transactionCreated.body.id)
        expect(res.body.description).toBe(transactionCreated.body.description)
      })
  })

  test('Deve alterar uma transação', async () => {
    const transaction = {
      description: 'new T ID',
      date: new Date(),
      ammount: 100,
      type: 'ENTRADA',
      account_id: accountUser1.id
    }

    const transactionCreated = await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)

    const transactionToupdate = {
      description: 'new T updated'
    }

    await request(app).patch(`${TRANSACTION_ROTE}/${transactionCreated.body.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .send(transactionToupdate)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.id).toBe(transactionCreated.body.id)
        expect(res.body.description).toBe(transactionToupdate.description)
      })
  })

  test('Deve remover uma transação', async () => {
    const transaction = {
      description: 'new T delete',
      date: new Date(),
      ammount: 100,
      type: 'ENTRADA',
      account_id: accountUser1.id
    }

    const transactionCreated = await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)

    await request(app).delete(`${TRANSACTION_ROTE}/${transactionCreated.body.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .then(res => {
        expect(res.status).toBe(204)
      })
  })

  test('Não deve remover uma transação de outro usuário', async () => {
    const transaction = {
      description: 'new T delete',
      date: new Date(),
      ammount: 100,
      type: 'ENTRADA',
      account_id: accountUser1.id
    }

    const transactionCreated = await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)

    await request(app).delete(`${TRANSACTION_ROTE}/${transactionCreated.body.id}`)
      .set('authorization', `bearer ${user2.token}`)
      .then(res => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe('Este recurso não pertence a este usuário')
      })
  })

  test('Não deve remover conta com transação', async () => {
    const transaction = {
      description: 'new T delete',
      date: new Date(),
      ammount: 100,
      type: 'ENTRADA',
      account_id: accountUser1.id
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(transaction)

    await request(app).delete(`${ACCOUNT_ROUTE}/${accountUser1.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .then(res => {
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Essa conta possui transações associadas')
      })
  })
})