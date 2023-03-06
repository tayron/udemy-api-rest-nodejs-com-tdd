
module.exports = () => {
  const findAll = (req, res) => {
    const users = [
      {
        name: 'Jhon Doe',
        mail: 'jhon@mail.com'
      }
    ]
    res.status(200).send(users)
  };

  const create = (req, res) => {
    res.status(201).json(req.body)
  };

  return { findAll, create }
}