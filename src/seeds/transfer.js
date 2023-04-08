const faker = require('faker-br');

const USER_PASSWORD = '$2a$10$39cN.qZ8MK7ElaMJGfEiHe3bJg//Vq7xV2viQKgg79a7Wvsc73tES'

exports.seed = async (knex) => {

  await knex('transactions').del();
  await knex('transfers').del();
  await knex('accounts').del();
  await knex('users').del();

  return knex('users').insert([
    {
      id: 1,
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: USER_PASSWORD
    },
    {
      id: 2,
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: USER_PASSWORD
    }
  ]);
};
