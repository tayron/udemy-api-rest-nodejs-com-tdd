
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

    app.services.user.selectByMail(req.body.mail)
      .then(result => {
        const users = JSON.parse(JSON.stringify(result))
        return res.status(200).send(users[0])
      })
  };

  return { findAll, create }
}