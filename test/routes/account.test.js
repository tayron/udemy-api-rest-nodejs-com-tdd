const request = require('supertest')
const jwt = require('jwt-simple');
const app = require('../../src/app');

const TOKEN_SECRET = 'Segredo'
const MAIN_ROUTE = '/v1/accounts'
let user1
let user2

describe.only('Account', () => {
  beforeEach(async () => {
    user1 = await createUser()
    user2 = await createUser()
  })

  async function createUser() {
    const mail = `${Date.now()}@mail.com`
    await app.services.user.create({
      name: 'User #1',
      mail: mail,
      password: '123456'
    })

    user = await app.services.user.findByMail(mail)
    user.token = token = jwt.encode(user, TOKEN_SECRET)

    return user;
  }

  test('Deve inserir uma conta com sucesso', () => {
    const account = { name: 'ACC1' }

    return request(app).post(MAIN_ROUTE)
      .set('authorization', `bearer ${user1.token}`)
      .send(account)
      .then(result => {
        expect(result.status).toBe(200)
        expect(result.body.name).toBe('ACC1')
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

  test.skip('Não deve inserir uma conta de nome duplicado para o mesmo usuário', () => { })

  test('Deve listar apenas as contas do usuário', async () => {
    await app.db('accounts').insert([
      { name: 'Acc user #1', user_id: user1.id },
      { name: 'Acc user #2', user_id: user2.id }
    ])

    const req = await request(app).get(MAIN_ROUTE)
      .set('authorization', `bearer ${user1.token}`)

    expect(req.status).toBe(200)
    expect(req.body.length).toBe(1)
    expect(req.body[0].name).toBe('Acc user #1')
  })

  test('Deve retornar uma conta por id', async (done) => {
    const account = {
      name: 'Acc by id',
      user_id: user1.id
    }

    await app.db('accounts').insert(account)

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

  test.skip('Não deve retornar uma conta de outro usuário', () => { })

  test('Deve alterar uma conta', async (done) => {
    const account = {
      name: 'Acc by put',
      user_id: user1.id
    }

    await app.db('accounts').insert(account)

    const accountCreated = await app.services.account
      .findByNameUserId(account.name, account.user_id)

    if (!accountCreated) {
      done.fail()
    }

    const newName = 'Acc by put updated'

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

  test.skip('Não deve alterar uma conta de outro usuário', () => { })

  test('Deve remover uma conta', async (done) => {
    const account = {
      name: 'Acc by delete',
      user_id: user1.id
    }

    await app.db('accounts').insert(account)

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

  test.skip('Não deve remover uma conta de outro usuário', () => { })
})