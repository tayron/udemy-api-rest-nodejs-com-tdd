const request = require('supertest');
const jwt = require('jwt-simple');
const app = require('../../src/app');
const faker = require('faker-br');

const MAIN_ROUTE = '/v1/users'
const TOKEN_SECRET = 'Segredo'

let userAdmin;

describe('Usuário', () => {
  beforeAll(async () => {
    const mail = faker.internet.email()

    await app.services.user.create({
      name: faker.name.firstName(),
      mail: mail,
      password: faker.internet.password()
    })

    userAdmin = await app.services.user.findByMail(mail)
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
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: faker.internet.password()
    }

    let spyUserCreate = jest.spyOn(app.services.user, 'create').mockImplementation(() => null);

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user)
      .then(res => {
        expect(spyUserCreate).toHaveBeenCalled()
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Usuário não criado')
        spyUserCreate.mockRestore();
      })
  })

  test('Deve inserir um usuário', () => {
    const user = {
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: faker.internet.password()
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
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: faker.internet.password()
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
      mail: faker.internet.email(),
      password: faker.internet.password()
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
      name: faker.name.firstName(),
      password: faker.internet.password()
    }

    const result = await request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user)

    expect(result.status).toBe(400)
    expect(result.body.error).toBe('Email é obrigatório')
  })

  test('Não deve inserir um usuário sem senha', (done) => {
    const user = {
      name: faker.name.firstName(),
      mail: faker.internet.email()
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

  test('Não deve inserir um usuário com email existente', async () => {
    const user1 = {
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: faker.internet.password()
    }

    await request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user1)
      .then(res => {
        expect(res.status).toBe(200);
        expect(res.body.name).toBe(user1.name)
        expect(res.body).not.toHaveProperty('password')
      })

    const user2 = {
      ...user1, ...{
        name: faker.name.firstName(), password: faker.internet.password()
      }
    }

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${userAdmin.token}`)
      .send(user2)
      .then(res => {
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Já existe um usuário com este email')
      })
  })
})