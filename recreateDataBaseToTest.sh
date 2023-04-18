#!/bin/bash

node_modules/.bin/knex migrate:rollback --env test
node_modules/.bin/knex migrate:latest --env test
node_modules/.bin/knex seed:run --env test