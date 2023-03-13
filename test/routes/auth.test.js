const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/auth'

const email = `${Date.now()}@mail.com`

describe('Auth', () => {
  test('Deve receber token ao logar', () => {
    const user = {
      name: 'Walter Milly',
      mail: email,
      password: '123456'
    }

    const credential = {
      mail: email,
      password: '123456'
    }

    return app.services.user.create(user)
      .then(() => request(app).post(`${MAIN_ROUTE}/signin`)
        .send(credential)
        .then(res => {
          expect(res.status).toBe(200)
          expect(res.body).toHaveProperty('token')
        }))
  })
})