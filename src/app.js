const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');

// TODO criar chaveamento dinamico
app.db = knex(knexfile.test)

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send()
});

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'ValidationError')
    res.status(400).json({ error: message })

  else if (name === 'RecursoIndevidoError')
    res.status(403).json({ error: message })

  else {
    console.error(message)
    res.status(500).json({ name, message, stack })
  }

  next(err)
})


/*
app.db.on('query', (query) => {
  console.log(`SQL: ${query.sql}, bindings: ${query.bindings ? query.bindings.join(', ') : ''}`)
})

app.db.on('query-response', (response) => {
  console.log(JSON.stringify(response))
})

app.db.on('error', (response) => {
  console.error(JSON.stringify(response))
})
*/
module.exports = app;

