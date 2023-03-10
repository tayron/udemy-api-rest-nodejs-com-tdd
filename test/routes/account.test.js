const request = require('supertest')
const app = require('../../src/app')

const MAIN_ROUTE = '/accounts'
let user;

describe.only('Account', () => {
  beforeAll(async () => {
    const mail = `${Date.now()}@mail.com`
    await app.services.user.create({
      name: 'User Account',
      mail: mail,
      password: '123456'
    })

    const users = await app.services.user.findByMail(mail)
    user = users.length > 0 ? users[0] : null
  })

  test('Deve inserir uma conta com sucesso', () => {
    const account = {
      name: 'ACC1',
      user_id: user.id
    }

    return request(app).post(MAIN_ROUTE)
      .send(account)
      .then(result => {
        expect(result.status).toBe(200)
        expect(result.body.name).toBe('ACC1')
      })
  })

  test('Deve listar todas as contas', () => {
    const account = {
      name: 'Acc list',
      user_id: user.id
    }
    return app.db('accounts').insert(account)
      .then(() => request(app).get(MAIN_ROUTE))
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.length).toBeGreaterThan(0)
      })
  })
})