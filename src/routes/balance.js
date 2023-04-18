const express = require('express')

module.exports = (app) => {
  const router = express.Router()

  router.get('/', async (req, res, next) => {
    try {
      const accountBalance = await app.services.balance.getBalanceByUserId(req.user.id)
      return res.status(200).send(accountBalance)
    } catch (err) {
      return next(err)
    }
  });

  return router
}