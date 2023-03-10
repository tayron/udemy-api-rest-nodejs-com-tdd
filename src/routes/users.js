
module.exports = (app) => {
  const findAll = (req, res) => {
    app.services.user.findAll()
      .then(result => res.status(200).send(result))
  };

  const create = async (req, res) => {
    const result = await app.services.user.create(req.body);
    if (result.error) {
      return res.status(400).send(result)
    }

    const users = await app.services.user.findByMail(req.body.mail);
    const user = users.length > 0 ? users[0] : null

    if (!user) {
      return res.status(400).send({ error: 'Usuário não criado' })
    }

    return res.status(200).send(user)
  };

  return { findAll, create }
}