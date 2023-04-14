const request = require('supertest')
const app = require('../../src/app');
const faker = require('faker-br')

const MAIN_ROTE = '/v1/transfers'
const AUTH_ROUTE = '/auth'

const TRANSACTIONS_TABLE = 'transactions'
const ENTRADA = 'ENTRADA'
const SAIDA = 'SAIDA'

const USER_ID = 10000
let TOKEN = ''

describe('Transfers', async () => {

  beforeAll(async () => {
    // await app.db.migrate.rollback()
    // await app.db.migrate.latest()
    await app.db.seed.run();

    const user = await app.services.user.findById(USER_ID)

    const credential = {
      mail: user.mail,
      password: '123456'
    }

    await request(app)
      .post(`${AUTH_ROUTE}/signin`)
      .send(credential)
      .then(res => {
        TOKEN = res.body.token
      })
  })

  test('Deve listar apenas as transferencias do usuário', async () => {
    return request(app).get(MAIN_ROTE)
      .set('authorization', `bearer ${TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body).toHaveLength(1)
        expect(res.body[0].description).not.toBeNull()
      })
  })

  test('Deve inserir uma transferencia com sucesso', async () => {
    const transfer = {
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      ammount: 95.10,
      origin_account_id: USER_ID,
      destination_account_id: 10001,
      user_id: USER_ID
    }

    const transferCreated = await request(app).post(MAIN_ROTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send(transfer)

    expect(transferCreated.status).toBe(200)
    expect(transferCreated.body.description).toBe(transfer.description)

    const transactions = await app.db(TRANSACTIONS_TABLE)
      .where({ transfer_id: transferCreated.body.id })

    expect(transactions).toHaveLength(2)
    expect(transactions[0].description).toBe(transferCreated.body.transactions[0].description)
    expect(transactions[1].description).toBe(transferCreated.body.transactions[1].description)
    expect(transactions[0].id).toBe(transferCreated.body.transactions[0].id)
    expect(transactions[1].id).toBe(transferCreated.body.transactions[1].id)
    expect(transactions[0].ammount).toBe(transferCreated.body.transactions[0].ammount)
    expect(transactions[1].ammount).toBe(transferCreated.body.transactions[1].ammount)
  })
})


describe('Transfers with transactions', async () => {
  let transferId
  let transacaoEntrada
  let transacaoSaida

  test('Deve inserir uma transferencia com sucesso', async () => {
    const transfer = {
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      ammount: 95.10,
      origin_account_id: USER_ID,
      destination_account_id: 10001,
      user_id: USER_ID
    }

    const transferCreated = await request(app).post(MAIN_ROTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send(transfer)

    transferId = transferCreated.body.id

    expect(transferCreated.status).toBe(200)
    expect(transferCreated.body.description).toBe(transfer.description)
  })

  test('As transações equivalentes devem ter sido geradas', async () => {
    const transactions = await app.db(TRANSACTIONS_TABLE)
      .where({ transfer_id: transferId }).orderBy('ammount', 'asc');

    [transacaoSaida, transacaoEntrada] = transactions

    expect(transactions).toHaveLength(2)
  })

  test('A transação de saída deve ser negativa', async () => {
    expect(transacaoSaida.type).toBe(SAIDA)
    expect(transacaoSaida.ammount).toBeLessThan(0)
  })

  test('A transação de entrada deve ser positiva', async () => {
    expect(transacaoEntrada.type).toBe(ENTRADA)
    expect(transacaoEntrada.ammount).toBeGreaterThan(0)
  })

  test('Todas as transações devem referenciar a trasnferencia que a originou', async () => {
    expect(transacaoEntrada.transfer_id).toBe(transferId)
    expect(transacaoSaida.transfer_id).toBe(transferId)
  })
})