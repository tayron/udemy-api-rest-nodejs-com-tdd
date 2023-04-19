const request = require('supertest')
const app = require('../../src/app');
const faker = require('faker-br')

const MAIN_ROTE = '/v1/transfers'
const AUTH_ROUTE = '/auth'

const TRANSFERS_TABLE = 'transfers'
const TRANSACTIONS_TABLE = 'transactions'

const TRANSACAO_CONCLUIDA = true

const ENTRADA = 'ENTRADA'
const SAIDA = 'SAIDA'

const USER_ID = 10000
let TOKEN = ''

describe('Transferência bancaria do usuário', () => {

  let transferID

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
      amount: 95.10,
      origin_account_id: USER_ID,
      destination_account_id: 10001,
      user_id: USER_ID
    }

    const transferCreated = await request(app).post(MAIN_ROTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send(transfer)

    transferID = transferCreated.body.id

    expect(transferCreated.status).toBe(200)
    expect(transferCreated.body.description).toBe(transfer.description)

    const transactions = await app.db(TRANSACTIONS_TABLE)
      .where({ transfer_id: transferCreated.body.id })

    expect(transactions).toHaveLength(2)
    expect(transactions[0].description).toBe(transferCreated.body.transactions[0].description)
    expect(transactions[1].description).toBe(transferCreated.body.transactions[1].description)
    expect(transactions[0].id).toBe(transferCreated.body.transactions[0].id)
    expect(transactions[1].id).toBe(transferCreated.body.transactions[1].id)
    expect(transactions[0].amount).toBe(transferCreated.body.transactions[0].amount)
    expect(transactions[1].amount).toBe(transferCreated.body.transactions[1].amount)
  })

  test('Deve alterar uma transferencia com sucesso', async () => {
    const transfer = {
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      amount: 600.10,
      origin_account_id: USER_ID,
      destination_account_id: 10001,
      user_id: USER_ID
    }

    const transferUpdated = await request(app).put(`${MAIN_ROTE}/${transferID}`)
      .set('authorization', `bearer ${TOKEN}`)
      .send(transfer)

    expect(transferUpdated.status).toBe(200)
    expect(transferUpdated.body.description).toBe(transfer.description)
  })

  test('Deve retornar transferencia por id', async () => {
    return request(app).get(`${MAIN_ROTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.description).toContain('Transfer:')
      })
  })

  test('Não deve retornar transferencia de outro usuário', async () => {
    return request(app).get(`${MAIN_ROTE}/10001`)
      .set('authorization', `bearer ${TOKEN}`)
      .then(res => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe('Este recurso não pertence a este usuário')
      })
  })
})


describe('Transferência bancaria com transação', () => {
  let transferId
  let transacaoEntrada
  let transacaoSaida

  test('Deve inserir uma transferencia com sucesso', async () => {
    const transfer = {
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      amount: 95.10,
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
      .where({ transfer_id: transferId }).orderBy('amount', 'asc');

    [transacaoSaida, transacaoEntrada] = transactions

    expect(transactions).toHaveLength(2)
  })

  test('A transação de saída deve ser negativa', async () => {
    expect(transacaoSaida.type).toBe(SAIDA)
    expect(transacaoSaida.amount).toBeLessThan(0)
  })

  test('A transação de entrada deve ser positiva', async () => {
    expect(transacaoEntrada.type).toBe(ENTRADA)
    expect(transacaoEntrada.amount).toBeGreaterThan(0)
  })

  test('Todas as transações devem referenciar a trasnferencia que a originou', async () => {
    expect(transacaoEntrada.transfer_id).toBe(transferId)
    expect(transacaoSaida.transfer_id).toBe(transferId)
  })

  test('Todas as transações devem estar com status de realizadas', async () => {
    expect(Boolean(transacaoEntrada.status)).toBe(TRANSACAO_CONCLUIDA)
    expect(Boolean(transacaoSaida.status)).toBe(TRANSACAO_CONCLUIDA)
  })
})

describe('Criando transferência bancaria inválida', () => {

  const templateTestTransferenciaInvalida = async (newData, errorMessage) => {
    const transferData = {
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      amount: 12.05,
      origin_account_id: USER_ID,
      destination_account_id: 10001,
      user_id: USER_ID
    }

    return await request(app).post(MAIN_ROTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...transferData, ...newData })
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      })
  }

  test('Não deve inserir sem descrição',
    async () => templateTestTransferenciaInvalida(
      { description: null }, 'Descrição deve ser informada'))

  test('Não deve inserir sem valor',
    async () => templateTestTransferenciaInvalida(
      { amount: null }, 'Valor deve ser informado'))

  test('Não deve inserir sem data',
    async () => templateTestTransferenciaInvalida(
      { date: null }, 'Data deve ser informada'))

  test('Não deve inserir sem conta destino',
    async () => templateTestTransferenciaInvalida(
      { destination_account_id: null }, 'Conta de destino deve ser informada'))

  test('Não deve inserir sem conta origem',
    async () => templateTestTransferenciaInvalida(
      { origin_account_id: null }, 'Conta de origem deve ser informada'))

  test('Não deve inserir se a conta origem e destino forem as mesmas',
    async () => templateTestTransferenciaInvalida(
      { origin_account_id: USER_ID, destination_account_id: USER_ID },
      'Conta de origem e destino não podem ser a mesma'))

  test('Não deve inserir se as contas pertencerem a outro usuario',
    async () => templateTestTransferenciaInvalida(
      { origin_account_id: 10002 }, 'A conta #10002 não pertence ao usuário'))
})

describe('Alterando transferência bancaria inválida', () => {

  const templateTestTransferenciaInvalida = async (newData, errorMessage) => {
    const transferData = {
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      amount: 12.05,
      origin_account_id: USER_ID,
      destination_account_id: 10001,
      user_id: USER_ID
    }

    return await request(app).put(`${MAIN_ROTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .send({ ...transferData, ...newData })
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe(errorMessage);
      })
  }

  test('Não deve inserir sem descrição',
    async () => templateTestTransferenciaInvalida(
      { description: null }, 'Descrição deve ser informada'))

  test('Não deve inserir sem valor',
    async () => templateTestTransferenciaInvalida(
      { amount: null }, 'Valor deve ser informado'))

  test('Não deve inserir sem data',
    async () => templateTestTransferenciaInvalida(
      { date: null }, 'Data deve ser informada'))

  test('Não deve inserir sem conta destino',
    async () => templateTestTransferenciaInvalida(
      { destination_account_id: null }, 'Conta de destino deve ser informada'))

  test('Não deve inserir sem conta origem',
    async () => templateTestTransferenciaInvalida(
      { origin_account_id: null }, 'Conta de origem deve ser informada'))

  test('Não deve inserir se a conta origem e destino forem as mesmas',
    async () => templateTestTransferenciaInvalida(
      { origin_account_id: USER_ID, destination_account_id: USER_ID },
      'Conta de origem e destino não podem ser a mesma'))

  test('Não deve inserir se as contas pertencerem a outro usuario',
    async () => templateTestTransferenciaInvalida(
      { origin_account_id: 10002 }, 'A conta #10002 não pertence ao usuário'))
})

describe('Removendo transferência bancaria', () => {

  test('Deve retornar o status 204', async () => {
    return request(app).delete(`${MAIN_ROTE}/10000`)
      .set('authorization', `bearer ${TOKEN}`)
      .then(res => {
        expect(res.status).toBe(204)
      })
  })

  test('O registro deve ter sido apagado no banco', async () => {
    return app.db(TRANSFERS_TABLE).where({ id: 10000 })
      .then(res => {
        expect(res).toHaveLength(0)
      })
  })

  test('As transações associadas devem ter sido removidas', async () => {
    return app.db(TRANSACTIONS_TABLE).where({ transfer_id: 10000 })
      .then(res => {
        expect(res).toHaveLength(0)
      })
  })
})