module.exports = (app) => {
  const remove = async (req, res) => {
    const result = await app.services.account.remove(req.params.id);
    if (result.error) {
      return res.status(400).send(result)
    }

    return res.status(204).send()
  }

  const update = async (req, res) => {
    const result = await app.services.account.update(req.params.id, req.body);
    if (result.error) {
      return res.status(400).send(result)
    }

    const account = await app.services.account
      .findById(req.params.id);

    if (!account) {
      return res.status(400).send({ error: 'Conta não existe' })
    }

    return res.status(200).send(account)
  }

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

  return { remove, update, findById, findAll, create }
}