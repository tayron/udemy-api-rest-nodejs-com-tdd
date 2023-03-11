module.exports = (app) => {
  const findById = (req, res) => {
    app.services.account.findById(req.params.id)
      .then(result => res.status(200).send(result))
  }

  const findAll = (req, res) => {
    app.services.account.findAll()
      .then(result => res.status(200).send(result))
  };

  const create = async (req, res) => {
    const result = await app.services.account.create(req.body);
    if (result.error) {
      return res.status(400).send(result)
    }

    const account = await app.services.account
      .findByNameUserId(req.body.name, req.body.user_id);

    if (!account) {
      return res.status(400).send({ error: 'Conta não criada' })
    }

    return res.status(200).send(account)
  }

  return { findById, findAll, create }
}