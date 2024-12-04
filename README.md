# Execução 

## mockbackend

```bash
cd ./mockbackend
yarn install # Teoricamente é só uma vez, ou quando mudar dependências 
yarn start
```

## frontend

O frontend está usando [yarn](https://yarnpkg.com/) para gestão de dependências.

**Observar que vai procurar o backend no localhost:3000**. Isso está configurado nos scripts do `package.json`

Criar arquivo `.env` na raiz da pasta `./frontend` com o seguinte conteudo.

```bash
export VITE_BASE_URL="http://localhost:3000/api"
```

```bash
cd ./frontend
yarn install # Teoricamente é só uma vez, ou quando mudar dependências
yarn start
```

Acessar o endereço `https://localhost:5173/` no navegador.

## backend

**Serve por padrão no localhost:3000**

Precisa das seguintes envs configuradas

`LEGACY_DATABASE_URL` uma URL para conexão do banco de dados no formato:
 `mssql://USUARIO:SENHA@HOST/DATABASE`

```bash
cargo run
```

##      LOGIN
## CNPJ: 82.007.279/0001-08
## Usuario: Teste
## Senha: 123 
