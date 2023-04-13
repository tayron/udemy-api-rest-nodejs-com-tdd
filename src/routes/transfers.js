const express = require('express')
const ValidationError = require('../erros/ValidationError')

module.exports = (app) => {
  const router = express.Router()

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

  router.post('/', async (req, res, next) => {
    try {
      const transferId = await app.services.transfer.create(req.body);
      const transfer = await app.services.transfer.findById(transferId);

      if (!transfer) {
        throw new ValidationError('Transferência não criada')
      }

      return res.status(200).send(transfer)
    } catch (err) {
      next(err)
    }
  })

  return router
}