const bodyParser = require('body-parser');
// const knexLogger = require('knex-logger')

module.exports = (app) => {
  app.use(bodyParser.json());

  // Tem que desabilitar modo verboso do jest
  // app.use(knexLogger(app.db))
}
