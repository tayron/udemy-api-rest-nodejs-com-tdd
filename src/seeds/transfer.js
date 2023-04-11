const faker = require('faker-br');

const USER_PASSWORD = '$2a$10$39cN.qZ8MK7ElaMJGfEiHe3bJg//Vq7xV2viQKgg79a7Wvsc73tES'
const SAIDA = 'SAIDA'
const ENTRADA = 'ENTRADA'

exports.seed = async (knex) => {

  await knex('transactions').del();
  await knex('transfers').del();
  await knex('accounts').del();
  await knex('users').del();

  await knex('users').insert([
    {
      id: 10000,
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: USER_PASSWORD
    },
    {
      id: 10001,
      name: faker.name.firstName(),
      mail: faker.internet.email(),
      password: USER_PASSWORD
    }
  ]);

  await knex('accounts').insert([
    {
      id: 10000,
      name: faker.finance.accountName(),
      user_id: 10000
    },
    {
      id: 10001,
      name: faker.finance.accountName(),
      user_id: 10000
    },
    {
      id: 10002,
      name: faker.finance.accountName(),
      user_id: 10001
    },
    {
      id: 10003,
      name: faker.finance.accountName(),
      user_id: 10001
    },
  ]);

  await knex('transfers').insert([
    {
      id: 10000,
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      ammount: 150.35,
      origin_account_id: 10000,
      destination_account_id: 10001,
      user_id: 10000
    },
    {
      id: 10001,
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      ammount: 7850.15,
      origin_account_id: 10002,
      destination_account_id: 10003,
      user_id: 10001
    },
  ]);

  await knex('transactions').insert([
    {
      id: 10000,
      description: `Transferencia da conta de origem 10000`,
      date: new Date(),
      ammount: 150.35,
      type: ENTRADA,
      account_id: 10001,
      transfer_id: 10000
    },
    {
      id: 10001,
      description: `Transferencia para conta de destino 10001`,
      date: new Date(),
      ammount: -150.35,
      type: SAIDA,
      account_id: 10000,
      transfer_id: 10000
    },
    {
      id: 10002,
      description: `Transferencia da conta de origem 10002`,
      date: new Date(),
      ammount: 7850.15,
      type: ENTRADA,
      account_id: 10003,
      transfer_id: 10001
    },
    {
      id: 10003,
      description: `Transferencia para conta de destino 10003`,
      date: new Date(),
      ammount: -7850.15,
      type: SAIDA,
      account_id: 10002,
      transfer_id: 10001
    },
  ]);
};
