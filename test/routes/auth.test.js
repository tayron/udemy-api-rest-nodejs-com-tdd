const request = require('supertest');
const app = require('../../src/app');

const MAIN_ROUTE = '/auth'
const USER_ROUTE = '/v1/users'

describe('Auth', () => {
  test('Deve criar usuário via signup', () => {
    const user = {
      name: 'Usuario criado via signup',
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }

    return request(app).post(`${MAIN_ROUTE}/signup`)
      .send(user)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.name).toBe(user.name)
        expect(res.body).toHaveProperty('mail')
        expect(res.body).not.toHaveProperty('senha')
      })
  })


  test('Deve receber token ao logar', () => {
    const user = {
      name: 'Usuario senha coreta',
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }

    const credential = {
      mail: user.mail,
      password: user.password
    }

    return app.services.user.create(user)
      .then(() => request(app).post(`${MAIN_ROUTE}/signin`)
        .send(credential)
        .then(res => {
          expect(res.status).toBe(200)
          expect(res.body).toHaveProperty('token')
        }))
  })

  test('Não deve autenticar usuário com senha errada', () => {
    const user = {
      name: 'Usuario senha errada',
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }

    const credential = {
      mail: user.mail,
      password: '987654'
    }

    return app.services.user.create(user)
      .then(() => request(app).post(`${MAIN_ROUTE}/signin`)
        .send(credential)
        .then(res => {
          expect(res.status).toBe(400)
          expect(res.body.error).toBe('Usuário ou senha inválido')
        }))
  })

  test('Não deve autenticar usuário com emal errado', () => {
    const user = {
      name: 'Usuario senha errada',
      mail: `nao-existe@mail.com`,
      password: '123456'
    }

    const credential = {
      mail: user.mail,
      password: user.password
    }

    return request(app).post(`${MAIN_ROUTE}/signin`)
      .send(credential)
      .then(res => {
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Usuário ou senha inválido')
      })
  })

  test('Não deve acessar uma rota protegida sem token', () => {
    return request(app).get(USER_ROUTE)
      .then(res => {
        expect(res.status).toBe(401)
      })
  })
})