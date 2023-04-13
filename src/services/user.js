const bcrypt = require('bcrypt-nodejs')
const ValidationError = require('../erros/ValidationError')

const TABLE_NAME = 'users'

module.exports = (app) => {
  const createPasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  }

  const findAll = async () => {
    return app.db(TABLE_NAME).select(['id', 'name', 'mail']);
  }

  const create = async (user) => {
    if (!user.name) throw new ValidationError('Nome é obrigatório')
    if (!user.mail) throw new ValidationError('Email é obrigatório')
    if (!user.password) throw new ValidationError('Senha é obrigatória')

    const userCreated = await findByMail(user.mail)
    if (userCreated)
      throw new ValidationError('Já existe um usuário com este email')

    user.password = createPasswordHash(user.password)
    return app.db(TABLE_NAME).insert(user);
  }

  const findByMail = async (mail) => {
    const user = await app.db(TABLE_NAME)
      .select(['id', 'name', 'mail'])
      .where('mail', mail)
      .first();

    return user ? JSON.parse(JSON.stringify(user)) : null
  }

  const getAllDataByMail = async (mail) => {
    const user = await app.db(TABLE_NAME)
      .select(['id', 'name', 'mail', 'password'])
      .where('mail', mail)
      .first();

    return user ? JSON.parse(JSON.stringify(user)) : null
  }

  const findById = async (id) => {
    const user = await app.db(TABLE_NAME)
      .select()
      .where('id', id)
      .first();

    return user ? JSON.parse(JSON.stringify(user)) : null
  }

  return { findAll, create, findByMail, findById, getAllDataByMail }
}