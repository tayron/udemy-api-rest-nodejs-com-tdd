
exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('transfers', (t) => {
      t.increments('id').primary();
      t.string('description').notNull();
      t.date('date').notNull();
      t.decimal('ammount', 15, 2).notNull();
      t.integer('origin_account_id')
        .unsigned()
        .references('id')
        .inTable('accounts')
        .notNull()
      t.integer('destination_account_id')
        .unsigned()
        .references('id')
        .inTable('accounts')
        .notNull()
      t.integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .notNull()
    }),
    knex.schema.table('transactions', (t) => {
      t.integer('transfer_id')
        .unsigned()
        .references('id')
        .inTable('transfers')
    })
  ])
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.table('transactions', async (t) => {
      await t.dropForeign('transfer_id')
      await t.dropColumn('transfer_id')
    }),

    knex.schema.dropTable('transfers')
  ])
};
