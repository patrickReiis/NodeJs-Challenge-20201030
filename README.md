Este projeto é um tech challenge que irá me fazer avançar no processo seletivo (caso eu passe) de uma determinada empresa 
para conseguir uma vaga como programador node.

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

## Compilando typescript para javascript
```
$ npm run build
```

## Rode o projeto
```
$ npm run start
```
