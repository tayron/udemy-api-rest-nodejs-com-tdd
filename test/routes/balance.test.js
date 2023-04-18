const request = require('supertest')
const moment = require('moment')
const faker = require('faker-br')
const app = require('../../src/app');


const MAIN_ROUTE = '/v1/balance'
const AUTH_ROUTE = '/auth'
const TRANSACTION_ROTE = '/v1/transactions'
const TRANSFER_ROTE = '/v1/transfers'

const SAIDA = 'SAIDA'
const ENTRADA = 'ENTRADA'

const TRANSACAO_CONCLUIDA = true
const TRANSACAO_PENDENTE = false

const PRINCIPAL_USER_ID = 10100
const SECONDARY_USER_ID = 10101
const THIRD_USER = 10102

let PRINCIPAL_USER_TOKEN = ''
let THIRD_USER_TOKEN = ''

describe('Balanço da conta bancária do usuário', async () => {
  beforeAll(async () => {
    await app.db.seed.run();

    const principalUser = await app.services.user.findById(PRINCIPAL_USER_ID)

    const credentialPrincipalUser = {
      mail: principalUser.mail,
      password: '123456'
    }

    await request(app)
      .post(`${AUTH_ROUTE}/signin`)
      .send(credentialPrincipalUser)
      .then(res => {
        PRINCIPAL_USER_TOKEN = res.body.token
      })

    const thirdUser = await app.services.user.findById(THIRD_USER)

    const credentialThirdUserUser = {
      mail: thirdUser.mail,
      password: '123456'
    }

    await request(app)
      .post(`${AUTH_ROUTE}/signin`)
      .send(credentialThirdUserUser)
      .then(res => {
        THIRD_USER_TOKEN = res.body.token
      })
  })

  test('Deve retornar apenas as contas com alguma transação', async () => {
    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(0)
      })
  })

  test('Deve adicionar valores de entrada', async () => {
    const transaction = {
      description: `Transaction: ${faker.random.number()}`,
      date: new Date(),
      amount: 100,
      type: ENTRADA,
      account_id: PRINCIPAL_USER_ID,
      status: TRANSACAO_CONCLUIDA
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transaction)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(transaction.amount)
      })
  })

  test('Deve subtrair as contas de saída', async () => {
    const transaction = {
      description: `Transaction: ${faker.random.number()}`,
      date: new Date(),
      amount: 200,
      type: SAIDA,
      account_id: PRINCIPAL_USER_ID,
      status: TRANSACAO_CONCLUIDA
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transaction)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(-100)
      })
  })

  test('Não deve considerar transações pendentes', async () => {
    const transaction = {
      description: `Transaction: ${faker.random.number()}`,
      date: new Date(),
      amount: 200,
      type: SAIDA,
      account_id: PRINCIPAL_USER_ID,
      status: TRANSACAO_PENDENTE
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transaction)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(-100.00)
      })
  })

  test('Não deve considerar saldo de contas distintas', async () => {
    const transaction = {
      description: `Transaction: ${faker.random.number()}`,
      date: new Date(),
      amount: 50,
      type: ENTRADA,
      account_id: SECONDARY_USER_ID,
      status: TRANSACAO_CONCLUIDA
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transaction)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(-100.00)
        expect(res.body[1].id).toBe(SECONDARY_USER_ID)
        expect(res.body[1].balance).toBe(50.00)
      })
  })

  test('Não deve considerar contas de outros usuários', async () => {
    const transaction = {
      description: `Transaction: ${faker.random.number()}`,
      date: new Date(),
      amount: 200,
      type: ENTRADA,
      account_id: 10102,
      status: TRANSACAO_CONCLUIDA
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transaction)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(-100.00)
        expect(res.body[1].id).toBe(SECONDARY_USER_ID)
        expect(res.body[1].balance).toBe(50.00)
      })
  })

  test('Deve considerar uma transação passada', async () => {
    const transaction = {
      description: `Transaction: ${faker.random.number()}`,
      date: moment().subtract({ days: 5 }),
      amount: 250,
      type: ENTRADA,
      account_id: PRINCIPAL_USER_ID,
      status: TRANSACAO_CONCLUIDA
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transaction)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(150.00)
        expect(res.body[1].id).toBe(SECONDARY_USER_ID)
        expect(res.body[1].balance).toBe(50.00)
      })
  })

  test('Não deve considerar transação futura', async () => {
    const transaction = {
      description: `Transaction: ${faker.random.number()}`,
      date: moment().add({ days: 5 }),
      amount: 250,
      type: ENTRADA,
      account_id: PRINCIPAL_USER_ID,
      status: TRANSACAO_CONCLUIDA
    }

    await request(app).post(TRANSACTION_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transaction)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(150.00)
        expect(res.body[1].id).toBe(SECONDARY_USER_ID)
        expect(res.body[1].balance).toBe(50.00)
      })
  })

  test('Deve considerar transferências', async () => {
    const transfer = {
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      amount: 250,
      origin_account_id: PRINCIPAL_USER_ID,
      destination_account_id: SECONDARY_USER_ID
    }

    await request(app).post(TRANSFER_ROTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .send(transfer)

    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${PRINCIPAL_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body[0].id).toBe(PRINCIPAL_USER_ID)
        expect(res.body[0].balance).toBe(-100)
        expect(res.body[1].id).toBe(SECONDARY_USER_ID)
        expect(res.body[1].balance).toBe(300.00)
      })
  })

  test('Deve calcular saldo das contas do usuário', async () => {
    await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${THIRD_USER_TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(2)
        expect(res.body[0].id).toBe(10104)
        expect(res.body[0].balance).toBe(226)
        expect(res.body[1].id).toBe(10105)
        expect(res.body[1].balance).toBe(-248)
      })
  })
})