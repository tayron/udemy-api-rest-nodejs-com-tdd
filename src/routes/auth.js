const jwt = require('jwt-simple');
const ValidationError = require('../erros/ValidationError');
const bcrypt = require('bcrypt-nodejs')
const TOKEN_SECRET = 'Segredo'

module.exports = (app) => {
  const signin = async (req, res, next) => {
    try {
      const user = await app.services.user
        .getPasswordByMail(req.body.mail)

      if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
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
  };

  return { signin }
}