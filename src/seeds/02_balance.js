const faker = require('faker-br')
const moment = require('moment')

const USER_PASSWORD = '$2a$10$39cN.qZ8MK7ElaMJGfEiHe3bJg//Vq7xV2viQKgg79a7Wvsc73tES'

const SAIDA = 'SAIDA'
const ENTRADA = 'ENTRADA'

const TRANSACAO_CONCLUIDA = true
const TRANSACAO_PENDENTE = false

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
    },
    {
      id: 10102,
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
    {
      id: 10104,
      name: faker.finance.accountName(),
      user_id: 10102
    },
    {
      id: 10105,
      name: faker.finance.accountName(),
      user_id: 10102
    },
  ]);

  await knex('transfers').insert([
    {
      id: 10100,
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      amount: 512,
      origin_account_id: 10102,
      destination_account_id: 10003,
      user_id: 10101
    },
    {
      id: 10101,
      description: `Transfer: ${faker.random.number()}`,
      date: new Date(),
      amount: 256,
      origin_account_id: 10105,
      destination_account_id: 10104,
      user_id: 10102
    },
  ]);

  await knex('transactions').insert([
    // TRANSAÇÃO POSITIVA / SALDO 2
    {
      description: `Transferencia da conta de origem 10104`,
      date: new Date(),
      amount: 2,
      type: ENTRADA,
      account_id: 10104,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSAÇÃO COM USUÁRIO ERRADO / SALDO 2
    {
      description: `Transferencia para conta de destino 10102`,
      date: new Date(),
      amount: 4,
      type: ENTRADA,
      account_id: 10102,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSAÇÃO PARA OUTRA CONTA / SALDO 2 / SALDO 8
    {
      description: `Transferencia para conta de destino 10105`,
      date: new Date(),
      amount: 8,
      type: ENTRADA,
      account_id: 10105,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSAÇÃO PENDENTE / SALDO 2 / SALDO 8
    {
      description: `Transferencia para conta de destino 10104`,
      date: new Date(),
      amount: 16,
      type: ENTRADA,
      account_id: 10104,
      status: TRANSACAO_PENDENTE
    },

    // TRANSAÇÃO PASSADA / SALDO 34 / SALDO 8
    {
      description: `Transferencia para conta de destino 10104`,
      date: moment().subtract({ days: 5 }).toString(),
      amount: 32,
      type: ENTRADA,
      account_id: 10104,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSAÇÃO FUTURA / SALDO 34 / SALDO 8
    {
      description: `Transferencia para conta de destino 10104`,
      date: moment().add({ days: 5 }).toString(),
      amount: 64,
      type: ENTRADA,
      account_id: 10104,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSAÇÃO NEGATIVA / SALDO -94 / SALDO 8
    {
      description: `Transferencia para conta de destino 10104`,
      date: new Date(),
      amount: -128,
      type: SAIDA,
      account_id: 10104,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSFERENCIA / SALDO -94 / SALDO 8
    {
      description: `Transferencia para conta de destino 10104`,
      date: new Date(),
      amount: 256,
      type: ENTRADA,
      account_id: 10104,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSFERENCIA / SALDO 162 / SALDO -248
    {
      description: `Transferencia da conta de origem 10105`,
      date: new Date(),
      amount: -256,
      type: SAIDA,
      account_id: 10105,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSFERENCIA / SALDO -94 / SALDO 8
    {
      description: `Transferencia para conta de destino 10103`,
      date: new Date(),
      amount: 512,
      type: ENTRADA,
      account_id: 10103,
      status: TRANSACAO_CONCLUIDA
    },

    // TRANSFERENCIA / SALDO 162 / SALDO -248
    {
      description: `Transferencia da conta de origem 10102`,
      date: new Date(),
      amount: -512,
      type: SAIDA,
      account_id: 10102,
      status: TRANSACAO_CONCLUIDA
    },
  ]);

};
