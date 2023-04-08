const request = require('supertest')
const jwt = require('jwt-simple');
const app = require('../../src/app');
const faker = require('faker-br');

const TOKEN_SECRET = 'Segredo'
const MAIN_ROUTE = '/v1/accounts'

const TABLE_ACCOUNTS = 'accounts'

let user1
let user2

describe('Account', () => {
  beforeAll(async () => {
    user1 = await createUser()
    user2 = await createUser()
  })

  async function createUser() {
    const mail = `${faker.random.number()}_${faker.internet.email()}`

    await app.services.user.create({
      name: faker.name.firstName(),
      mail: mail,
      password: faker.internet.password()
    })

    user = await app.services.user.findByMail(mail)
    user.token = token = jwt.encode(user, TOKEN_SECRET)

    return user;
  }

  test('Deve inserir uma conta com sucesso', () => {
    const account = { name: faker.finance.accountName() }

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(account)
      .then(result => {
        expect(result.status).toBe(200)
        expect(result.body.name).toBe(account.name)
      })
  })

  test('Não deve inserir uma conta sem nome', () => {
    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user1.token}`)
      .then(result => {
        expect(result.status).toBe(400)
        expect(result.body.error).toBe('Nome é obrigatório')
      })
  })

  test('Não deve inserir uma conta de nome duplicado para o mesmo usuário', async () => {
    const account = {
      name: faker.name.firstName(),
      user_id: user1.id
    }

    await app.db(TABLE_ACCOUNTS).insert(account)

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(account)
      .then(result => {
        expect(result.status).toBe(400)
        expect(result.body.error).toBe('Já existe uma conta com nome informado')
      })
  })

  test('Deve listar apenas as contas do usuário', async () => {
    const accountUser1 = faker.finance.accountName()

    await app.db(TABLE_ACCOUNTS).insert([
      { name: accountUser1, user_id: user1.id },
      { name: faker.finance.accountName(), user_id: user2.id }
    ])

    const req = await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user1.token}`)

    expect(req.status).toBe(200)
    expect(req.body.length).toBeGreaterThan(0)
    expect(req.body[req.body.length - 1].name).toBe(accountUser1)
  })

  test('Deve retornar uma conta por id', async (done) => {
    const account = {
      name: faker.finance.accountName(),
      user_id: user1.id
    }

    await app.db(TABLE_ACCOUNTS).insert(account)

    const accountCreated = await app.services.account
      .findByNameUserId(account.name, account.user_id)

    if (!accountCreated) {
      done.fail()
    }

    await request(app).get(`${MAIN_ROUTE}/${accountCreated.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.name).toBe(account.name)
        expect(res.body.user_id).toBe(account.user_id)
        done()
      })
  })

  test('Não deve retornar uma conta de outro usuário', async () => {
    const account = {
      name: faker.finance.accountName(),
      user_id: user2.id
    }

    await app.db(TABLE_ACCOUNTS).insert(account)
    const accountCreated = await app.services.account
      .findByNameUserId(account.name, account.user_id)

    const req = await request(app).get(`${MAIN_ROUTE}/${accountCreated.id}`)
      .set('authorization', `bearer ${user1.token}`)

    expect(req.status).toBe(403)
    expect(req.body.error).toBe('Este recurso não pertence a este usuário')
  })

  test('Deve alterar uma conta', async (done) => {
    const account = {
      name: faker.finance.accountName(),
      user_id: user1.id
    }

    await app.db(TABLE_ACCOUNTS).insert(account)

    const accountCreated = await app.services.account
      .findByNameUserId(account.name, account.user_id)

    if (!accountCreated) {
      done.fail()
    }

    const newName = faker.finance.accountName()

    await request(app).patch(`${MAIN_ROUTE}/${accountCreated.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .send({ name: newName })
      .then(res => {
        expect(res.status).toBe(200)
        expect(res.body.name).toBe(newName)
        expect(res.body.user_id).toBe(account.user_id)
        done()
      })
  })

  test('Não deve alterar uma conta de outro usuário', async () => {
    const account = {
      name: faker.finance.accountName(),
      user_id: user2.id
    }

    await app.db(TABLE_ACCOUNTS).insert(account)
    const accountCreated = await app.services.account
      .findByNameUserId(account.name, account.user_id)

    accountCreated.name = faker.finance.accountName()

    const req = await request(app).patch(`${MAIN_ROUTE}/${accountCreated.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .send(accountCreated)

    expect(req.status).toBe(403)
    expect(req.body.error).toBe('Este recurso não pertence a este usuário')
  })

  test('Deve remover uma conta', async (done) => {
    const account = {
      name: faker.finance.accountName(),
      user_id: user1.id
    }

    await app.db(TABLE_ACCOUNTS).insert(account)

    const accountCreated = await app.services.account
      .findByNameUserId(account.name, account.user_id)

    if (!accountCreated) {
      done.fail()
    }

    await request(app).delete(`${MAIN_ROUTE}/${accountCreated.id}`)
      .set('authorization', `bearer ${user1.token}`)
      .then(res => {
        expect(res.status).toBe(204)
        done()
      })
  })

  test('Não deve remover uma conta de outro usuário', async (done) => {
    const account = {
      name: faker.finance.accountName(),
      user_id: user1.id
    }

    await app.db(TABLE_ACCOUNTS).insert(account)

    const accountCreated = await app.services.account
      .findByNameUserId(account.name, account.user_id)

    if (!accountCreated) {
      done.fail()
    }

    await request(app).delete(`${MAIN_ROUTE}/${accountCreated.id}`)
      .set('authorization', `bearer ${user2.token}`)
      .then(res => {
        expect(res.status).toBe(403)
        expect(res.body.error).toBe('Este recurso não pertence a este usuário')
        done()
      })
  })
})