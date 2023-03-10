module.exports = (app) => {
  const findAll = (req, res) => {
    app.services.account.findAll()
      .then(result => res.status(200).send(result))
  };

  const create = async (req, res) => {
    const result = await app.services.account.create(req.body);
    if (result.error) {
      return res.status(400).send(result)
    }

    const accounts = await app.services.account
      .findByNameUserId(req.body.name, req.body.user_id);

    const account = accounts.length > 0 ? accounts[0] : null

    if (!account) {
      return res.status(400).send({ error: 'Conta não criada' })
    }

    return res.status(200).send(account)
  }

  return { findAll, create }
}