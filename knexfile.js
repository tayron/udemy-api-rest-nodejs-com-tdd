module.exports = {
  test: {
    client: 'mysql',
    // version: '',
    connection: {
      host: 'localhost',
      user: 'root',
      password: 'yakTLS&70c52',
      database: 'projeto'
    },
    migrations: {
      directory: 'src/migrations'
    }
  }
}