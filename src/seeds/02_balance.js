const faker = require('faker-br');

const USER_PASSWORD = '$2a$10$39cN.qZ8MK7ElaMJGfEiHe3bJg//Vq7xV2viQKgg79a7Wvsc73tES'

exports.seed = async (knex) => {

  await knex('users').insert([
    {
      id: 10100,
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: USER_PASSWORD
    },
    {
      id: 10101,
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: USER_PASSWORD
    }
  ]);

  await knex('accounts').insert([
    {
      id: 10100,
      name: faker.finance.accountName(),
      user_id: 10100
    },
    {
      id: 10101,
      name: faker.finance.accountName(),
      user_id: 10100
    },
    {
      id: 10102,
      name: faker.finance.accountName(),
      user_id: 10101
    },
    {
      id: 10103,
      name: faker.finance.accountName(),
      user_id: 10101
    },
  ]);
};
