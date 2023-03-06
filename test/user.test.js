const request = require('supertest');
const app = require('../src/app')

describe('Usuário', () => {
  test('Deve listar todos os usuários', () => {
    return request(app).get('/users')
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty('name', 'Jhon Doe');
      })
  })

  test('Deve inserir um usuário com sucesso', () => {
    const user = {
      name: 'Walter Milly',
      mail: 'walter@mail.com'
    }
    return request(app).post('/users')
      .send(user)
      .then(res => {
        expect(res.status).toBe(201);
        expect(res.body.name).toBe(user.name)
      })
  })
})