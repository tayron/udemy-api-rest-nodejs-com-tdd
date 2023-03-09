const request = require('supertest');
const app = require('../../src/app')

describe('Usuário', () => {
  test('Deve listar todos os usuários', () => {
    return request(app).get('/users')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      })
  })

  test('Deve inserir um usuário com sucesso', () => {
    const user = {
      name: 'Walter Milly',
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }
    return request(app).post('/users')
      .send(user)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.name).toBe(user.name)
      })
  })
})