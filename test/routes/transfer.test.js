const request = require('supertest')
const app = require('../../src/app');
const faker = require('faker-br')

const MAIN_ROTE = '/v1/transfers'
const AUTH_ROUTE = '/auth'
let TOKEN = ''
const USER_ID = 10000

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

    return request(app).post(MAIN_ROTE)
      .set('authorization', `bearer ${TOKEN}`)
      .send(transfer)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.description).toBe(transfer.description)
      })
  })
})