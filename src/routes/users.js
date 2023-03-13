const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const findAll = (req, res) => {
    app.services.user.findAll()
      .then(result => res.status(200).send(result))
  };

  const create = async (req, res) => {
    try {
      await app.services.user.create(req.body);

      const users = await app.services.user.findByMail(req.body.mail);

      if (!users || users.length === 0) {
        throw new ValidationError('Usuário não criado')
      }

      return res.status(200).send(users[0])
    } catch (err) {
      return res.status(400).send({
        error: err.message
      })
    }
  };

  return { findAll, create }
}