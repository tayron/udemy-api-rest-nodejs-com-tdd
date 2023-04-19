const express = require('express')
const ValidationError = require('../erros/ValidationError')
const RecursoIndevidoError = require('../erros/RecursoIndevidoError')
const ENTRADA = 'ENTRADA'
const SAIDA = 'SAIDA'
const TRANSACAO_CONCLUIDA = true

module.exports = (app) => {
  const router = express.Router()

  router.param('id', async (req, res, next) => {

    try {
      const transfer = await app.services.transfer.findById(req.params.id)
      if (transfer.user_id != req.user.id) {
        throw new RecursoIndevidoError('Este recurso não pertence a este usuário')
      }

      next()
    } catch (err) {
      next(err)
    }
  })

  const validate = async (req, res, next) => {
    try {
      await app.services.transfer.validateData({ ...req.body, user_id: req.user.id })
      next()
    } catch (err) {
      next(err)
    }
  }

  router.get('/', async (req, res, next) => {
    try {
      const transferList = await app.services.transfer.findByUserId(req.user.id)
      if (!transferList) {
        throw new ValidationError("Transferência inexistente")
      }

      for (var i = 0; i <= transferList.length - 1; i++) {
        const transfer = transferList[i]
        const transactionsList = await app.services.transaction.findByTransferId(transfer.id)
        transferList[i].transactions = transactionsList
      }

      return res.status(200).send(transferList)
    } catch (err) {
      return next(err)
    }
  });

  router.post('/', validate, async (req, res, next) => {
    try {
      const transferId = await app.services.transfer.create({ ...req.body, user_id: req.user.id });
      const transfer = await app.services.transfer.findById(transferId);

      if (!transfer) {
        throw new ValidationError('Transferência não criada')
      }

      await createTransaction(transfer)

      return res.status(200).send(transfer)
    } catch (err) {
      next(err)
    }
  })

  router.put('/:id', validate, async (req, res, next) => {
    try {
      const transferId = req.params.id
      await app.services.transfer.update(transferId, { ...req.body, user_id: req.user.id });

      const transfer = await app.services.transfer
        .findById(transferId);

      if (!transfer) {
        throw new ValidationError('Transferencia não existe')
      }

      await app.services.transaction.removeByTransferID(transferId)
      await createTransaction(transfer)

      return res.status(200).send(transfer)
    } catch (err) {
      next(err)
    }
  })

  async function createTransaction(transfer) {
    transfer.transactions = []

    transfer.transactions[0] = {
      description: `Transferécia para ${transfer.destination_account_id}`,
      date: transfer.date,
      amount: transfer.amount,
      type: SAIDA,
      account_id: transfer.origin_account_id,
      transfer_id: transfer.id,
      status: TRANSACAO_CONCLUIDA
    }

    transfer.transactions[1] = {
      description: `Transferécia de ${transfer.origin_account_id}`,
      date: transfer.date,
      amount: transfer.amount,
      type: ENTRADA,
      account_id: transfer.destination_account_id,
      transfer_id: transfer.id,
      status: TRANSACAO_CONCLUIDA
    }

    transfer.transactions[0].id = await app.services.transaction
      .create(transfer.transactions[0])

    transfer.transactions[1].id = await app.services.transaction
      .create(transfer.transactions[1])
  }

  router.get('/:id', async (req, res, next) => {
    try {
      await app.services.transfer.findById(req.params.id)
        .then(result => {
          return res.status(200).send(result)
        })
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await app.services.transaction.removeByTransferID(req.params.id)
      await app.services.transfer.remove(req.params.id)
      return res.status(204).send()
    } catch (err) {
      next(err)
    }
  })

  return router
}