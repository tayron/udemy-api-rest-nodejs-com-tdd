const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');

const MAIN_ROUTE = '/users'
const TOKEN_SECRET = 'Segredo'
const EMAIL = `${Date.now()}@mail.com`

let userAdmin;

describe('Usuário', () => {
  beforeAll(async () => {
    await app.services.user.create({
      name: 'Admin',
      mail: EMAIL,
      password: '123456'
    })

    userAdmin = await app.services.user.findByMail(EMAIL)
    userAdmin.token = token = jwt.encode(userAdmin, TOKEN_SECRET)
  })


  test('Deve listar todos os usuários', () => {
    return request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
      })
  })

  test('Deve não inserir um usuário com sucesso', () => {

    const user = {
      name: 'Walter Milly',
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }

    let spyUserCreate = jest.spyOn(app.services.user, 'create').mockImplementation(() => null);

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user)
      .then(res => {
        console.error(res.body)
        expect(spyUserCreate).toHaveBeenCalled()
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Usuário não criado')
        spyUserCreate.mockRestore();
      })
  })

  test('Deve inserir um usuário', () => {
    const user = {
      name: 'Walter Milly',
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.name).toBe(user.name)
        expect(res.body).not.toHaveProperty('password')
      })
  })

  test('Deve armazenar senha criptografada', async () => {

    const user = {
      name: 'Walter Milly',
      mail: `${Date.now()}@mail.com`,
      password: '123456'
    }

    const res = await request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user)

    expect(res.status).toBe(200)

    const { id } = res.body;
    const userCreated = await app.services.user.findById(id)
    expect(userCreated.password).toBeDefined();
    expect(userCreated.password).not.toBe(user.password)

  })

  test('Não deve inserir um usuário sem nome', () => {
    const user = {
      mail: EMAIL,
      password: '123456'
    }

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
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
    const result = await request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user)

    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Email é obrigatório')
  })

  test('Não deve inserir um usuário sem senha', (done) => {
    const user = {
      name: 'Walter Milly',
      mail: EMAIL
    }
    request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
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

  test('Não deve inserir um usuário com email existente', () => {
    const user = {
      name: 'Walter Milly',
      mail: EMAIL,
      password: '123456'
    }

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user)
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Já existe um usuário com este email')
      })
  })
})