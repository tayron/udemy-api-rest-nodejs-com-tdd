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

  test('Não deve inserir um usuário sem nome', () => {
    const user = {
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }

    return request(app).post('/users')
      .send(user)
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Nome é obrigatório')
      })
  })

  test('Não deve inserir um usuário sem email', async () => {
    const user = {
      name: 'Walter Milly',
      password: '123456'
    }
    const result = await request(app).post('/users')
      .send(user)

    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Email é obrigatório')
  })

  test('Não deve inserir um usuário sem senha', (done) => {
    const user = {
      name: 'Walter Milly',
      mail: `${Date.now()}@mail.com`
    }
    request(app).post('/users')
      .send(user)
      .then(res => {
        expect(res.status).toBe(400)
        expect(res.body.error).toBe('Senha é obrigatória')
        done();
      })
      .catch(error => {
        done.fail(error)
      })
  })
})