const bcrypt = require('bcrypt-nodejs')
const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const createPasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salt)
  }

  const findAll = async () => {
    return app.db('users').select(['id', 'name', 'mail']);
  }

  const create = async (user) => {
    if (!user.name) throw new ValidationError('Nome é obrigatório')
    if (!user.mail) throw new ValidationError('Email é obrigatório')
    if (!user.password) throw new ValidationError('Senha é obrigatória')

    const userCreated = await findByMail(user.mail)
    if (userCreated.length > 0)
      throw new ValidationError('Já existe um usuário com este email')

    user.password = createPasswordHash(user.password)
    return app.db('users').insert(user);
  }

  const findByMail = async (mail) => {
    const users = await app.db('users')
      .select(['id', 'name', 'mail'])
      .where('mail', mail);

    return JSON.parse(JSON.stringify(users))
  }

  const findById = async (id) => {
    const users = await app.db('users')
      .select()
      .where('id', id)
      .first();

    return JSON.parse(JSON.stringify(users))
  }

  return { findAll, create, findByMail, findById }
}