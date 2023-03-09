const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexfile = require('../knexfile');
const knexLogger = require('knex-logger')

// TODO criar chaveamento dinamico
app.db = knex(knexfile.test)

// Tem que desabilitar modo verboso do jest
app.use(knexLogger(app.db))

consign({ cwd: 'src', verbose: false })
  .include('./config/middlewares.js')
  .then('./services')
  .then('./routes')
  .then('./config/routes.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send()
});


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

