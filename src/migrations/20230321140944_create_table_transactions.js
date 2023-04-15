
exports.up = (knex) => {
  return knex.schema.createTable('transactions', (t) => {
    t.increments('id').primary();
    t.string('description').notNull();
    t.enu('type', ['ENTRADA', 'SAIDA']).notNull();
    t.date('date').notNull();
    t.decimal('amount', 15, 2).notNull();
    t.boolean('status').notNull().default(false);
    t.integer('account_id')
      .unsigned()
      .references('id')
      .inTable('accounts')
      .notNull()
  })
};

exports.down = (knex) => {
  return knex.schema.dropTable('transactions');
};
