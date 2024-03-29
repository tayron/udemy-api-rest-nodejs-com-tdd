const express = require('express')
const ValidationError = require('../erros/ValidationError')
const RecursoIndevidoError = require('../erros/RecursoIndevidoError')

module.exports = (app) => {
  const router = express.Router()

  // miidleware que vai ser enviado quando id for enviado via get
  router.param('id', async (req, res, next) => {
    await app.services.account.findById(req.params.id)
      .then(result => {
        if (result.user_id !== req.user.id) {
          throw new RecursoIndevidoError()
        }
        next()
      }).catch(err => next(err))
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.account.remove(req.params.id)
      return res.status(204).send()
    } catch (err) {
      next(err)
    }
  })

  router.patch('/:id', async (req, res, next) => {
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
  })

  router.get('/:id', async (req, res, next) => {
    try {
      await app.services.account.findById(req.params.id)
        .then(result => {
          return res.status(200).send(result)
        })
    } catch (err) {
      next(err)
    }
  })

  router.get('/', async (req, res, next) => {
    try {
      await app.services.account.findByUserId(req.user.id)
        .then(result => res.status(200).send(result))
    } catch (err) {
      return next(err)
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      req.body.user_id = req.user.id
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
  });

  return router
}