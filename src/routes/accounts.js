const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const remove = async (req, res, next) => {
    try {
      await app.services.account.remove(req.params.id)
      return res.status(204).send()
    } catch (err) {
      next(err)
    }
  }

  const update = async (req, res, next) => {
    try {
      await app.services.account.update(req.params.id, req.body);

      const account = await app.services.account
        .findById(req.params.id);

      if (!account) {
        throw new ValidationError('Conta não existe')
      }

      return res.status(200).send(account)
    } catch (err) {
      next(err)
    }
  }

  const findById = async (req, res, next) => {
    try {
      await app.services.account.findById(req.params.id)
        .then(result => res.status(200).send(result))
    } catch (err) {
      next(err)
    }
  }

  const findAll = async (req, res, next) => {
    try {
      await app.services.account.findAll()
        .then(result => res.status(200).send(result))
    } catch (err) {
      return next(err)
    }
  };

  const create = async (req, res, next) => {
    try {
      await app.services.account.create(req.body);

      const account = await app.services.account
        .findByNameUserId(req.body.name, req.body.user_id);

      if (!account) {
        throw new ValidationError('Conta não criada')
      }

      return res.status(200).send(account)
    } catch (err) {
      next(err)
    }
  }

  return { remove, update, findById, findAll, create }
}