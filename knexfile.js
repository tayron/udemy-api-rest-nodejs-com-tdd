module.exports = {
  test: {
    client: 'mysql',
    version: '5.6',
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