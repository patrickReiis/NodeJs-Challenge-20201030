# Como rodar o projeto:

## Criar database
```
$ psql postgres

postgres=# CREATE DATABASE food_challenge;
postgres=# \q
```

## Setup .env
Dentro da pasta root, crie um arquivo .env

O arquivo .env utiliza a seguinte estrutura:
```
DB_USERNAME=
DB_PASSWORD=
```

## Instale as dependências
```
$ npm install
```

## Compilando .ts para .js
```
$ npm run build
```

## Rode o projeto
```
$ npm run start
```
