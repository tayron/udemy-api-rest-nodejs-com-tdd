const express = require('express')
const ValidationError = require('../erros/ValidationError')
const RecursoIndevidoError = require('../erros/RecursoIndevidoError')

module.exports = (app) => {
  const router = express.Router()

  // miidleware que vai ser enviado quando id for enviado via get
  router.param('id', async (req, res, next) => {
    await app.services.account.findByUserId(req.user.id)
      .then(result => {
        if (result[0].user_id !== req.user.id) {
          throw new RecursoIndevidoError()
        }
        next()
      }).catch(err => next(err))
  })

  router.get('/', async (req, res, next) => {
    try {
      const accountList = await app.services.account.findByUserId(req.user.id)
      if (!accountList) {
        throw new ValidationError("Transação inexistente")
      }

      for (var i = 0; i <= accountList.length - 1; i++) {
        const account = accountList[i]
        const transactionsList = await app.services.transaction.findByAccountId(account.id)
        accountList[i].transactions = transactionsList
      }

      return res.status(200).send(accountList)
    } catch (err) {
      return next(err)
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      await app.services.transaction.create(req.body);

      const transaction = await app.services.transaction
        .findByDescriptionAccountId(req.body.description, req.body.account_id);

      if (!transaction) {
        throw new ValidationError('Transação não criada')
      }

      return res.status(200).send(transaction)
    } catch (err) {
      next(err)
    }
  })

  router.get('/:id', async (req, res, next) => {
    try {
      await app.services.transaction.findById(req.params.id)
        .then(result => {
          return res.status(200).send(result)
        })
    } catch (err) {
      next(err)
    }
  })

  router.patch('/:id', async (req, res, next) => {
    try {
      await app.services.transaction.update(req.params.id, req.body);

      const transaction = await app.services.transaction
        .findById(req.params.id);

      if (!transaction) {
        throw new ValidationError('Conta não existe')
      }

      return res.status(200).send(transaction)
    } catch (err) {
      next(err)
    }
  })

  return router
}