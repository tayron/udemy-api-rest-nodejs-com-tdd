const express = require('express')
const jwt = require('jwt-simple');
const ValidationError = require('../erros/ValidationError');
const bcrypt = require('bcrypt-nodejs')
const TOKEN_SECRET = 'Segredo'

module.exports = (app) => {
  const router = express.Router()

  router.post('/signin', async (req, res, next) => {
    try {
      const user = await app.services.user
        .getAllDataByMail(req.body.mail)

      if (!user || !bcrypt.compareSync(String(req.body.password), user.password)) {
        throw new ValidationError('Usuário ou senha inválido')
      }

      const token = jwt.encode({
        id: user.id,
        name: user.name,
        mail: user.mail
      }, TOKEN_SECRET)

      return res.status(200).send({ token })

    } catch (err) {
      next(err)
    }
  });

  router.post('/signup', async (req, res, next) => {
    try {
      await app.services.user.create(req.body);

      const user = await app.services.user.findByMail(req.body.mail);

      if (!user) {
        throw new ValidationError('Usuário não criado')
      }

      return res.status(201).send(user)
    } catch (err) {
      next(err)
    }
  })

  return router
}