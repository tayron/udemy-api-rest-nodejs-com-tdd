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

      const user = await app.services.user.findByMail(req.body.mail);

      if (!user) {
        throw new ValidationError('Usuário não criado')
      }

      return res.status(200).send(user)
    } catch (err) {
      next(err)
    }
  };

  return { findAll, create }
}