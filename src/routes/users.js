const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const findAll = async (req, res, next) => {
    try {
      await app.services.user.findAll()
        .then(result => res.status(200).send(result))
    } catch (err) {
      next(err)
    }
  };

  const create = async (req, res, next) => {
    try {
      await app.services.user.create(req.body);

      const users = await app.services.user.findByMail(req.body.mail);

      if (!users || users.length === 0) {
        throw new ValidationError('Usuário não criado')
      }

      return res.status(200).send(users[0])
    } catch (err) {
      next(err)
    }
  };

  return { findAll, create }
}