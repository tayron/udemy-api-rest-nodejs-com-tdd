# API REST em Node.JS aplicando testes (TDD) desde o princípio

Link do curso: https://www.udemy.com/course/api-rest-nodejs-com-testes


## O que será estudado:
* Evoluir a aplicação com a segurança dos testes
* Desenvolver uma API Rest utilizando NodeJS
* Criar testes para API Rest utilizando o Jest
* Autenticação e geração de Token JWT
* Criar banco de dados através do knex
* Trabalhar com migração de tabelas
* Diversas estratégias de roteamento do express
* Estratégias para gerenciamento de massa de dados
* Gerenciar logs na aplicação


## Instalando Eslint
```sh
npm install eslint --save-dev
```

### Configurando Eslint
```sh
node_modules/.bin/eslint --init
```

### Executando Eslint
```sh
node_modules/.bin/eslint inde.js
```

### Executando Eslint e pedindo para corrigir
```sh
node_modules/.bin/eslint inde.js --fix
```

## Instalando Jest
```sh
npm i -D jest@29.5.0 -E
```
**Obs.:** A flag -E é para garantir que a versão do jest não seja alterada no futuro

## Instalando Jest
```sh
npm i -D supertest@3.3.0 -E
```

## Instalando Express
```sh
npm i -S -E express@4.16.4
```

## Instalando Body Parser
```sh
npm i -S -E body-parser@1.18.3
```

## Instalando Consign
Carrega arquivos javascript dinamicamente
```sh
npm i -S -E consign@0.1.6
```


## Instalando knex
Query builder para banco de dados, convertendo objetos em querys 
```sh
npm i -S -E knex@0.15.2
```

## Instalando moment 
Biblioteca para trabalhar com operações em data, como subtrair, adicionar dias, mês, etc.
```sh
npm i -S -E moment@2.22.2
```

## Instalando husky
Biblioteca para que ao rodar o commit seja executado os testes unitários antes
```sh
npm i -S -E husky@1.2.0
```

## Instalando uuidv4 e winston
Biblioteca para logar os eventos da aplicação
```sh
npm i -S -E uuidv4@2.0.0 winston@3.1.0
```

## Instalando PM2 - Advaced, production process manager for NodeJS
Usando a ferramenta para manter sempre o servidor em pé com nodeJS
```sh
npm i pm2 -g
pm2 start npm --start 
```

Visualizando processo
```sh
pm2 status
```
Restartando servidor
```sh
pm2 restart 0
```

Parando processo
```sh
pm2 stop 0
```

Desinstalando a ferramenta pm2
```sh
npm uninstall pm2 -g
```

### Criando arquivo de migração usando knex
```sh
node_modules/.bin/knex migrate:make create_users --env test
node_modules/.bin/knex migrate:make create_table_accounts --env test
node_modules/.bin/knex migrate:make create_table_transactions --env test
node_modules/.bin/knex migrate:make create_table_transfers --env test
```

### Executando migração usando knex
```sh
node_modules/.bin/knex migrate:latest --env test
```

### Executando rollback usando knex
```sh
node_modules/.bin/knex migrate:rollback --env test
```

### Executando criação de arquivos seed usando knex
```sh
node_modules/.bin/knex seed:make transfer --env test
node_modules/.bin/knex seed:make balance --env test
```

### Executando criação de seed usando knex
```sh
node_modules/.bin/knex seed:run --env test
```

## Instalando knex-logger
```sh
npm i -S -E knex-logger
```

## Instalando mysql
```sh
npm i -S -E mysql
```

## Instalando bcrypt para geração de hash de senha
```sh
npm i -S -E bcrypt-nodejs@0.0.3
```

## Instalando faker para geração de dados faker usando nos testes
```sh
npm i -S -E faker-br@0.4.1
```


## Instalando jwt para geração de token
```sh
npm i -S -E jwt-simple@0.5.5
```

## Instalando passport
```sh
npm i -S -E passport@0.4.0
npm i -S -E passport-jwt@4.0.0
```

## Instalando dependencia para tratar cors
```sh
npm i -S -E cors@2.8.5
```
## Versionamento de biblioteca

**Exemplo: v 1.2.3**
1. major
2. ^ minor
3. ~ patch