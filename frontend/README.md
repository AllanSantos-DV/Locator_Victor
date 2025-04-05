# Car Rental Frontend

Frontend para o sistema de aluguel de carros.

## Configuração de ambiente

O frontend está configurado para se comunicar com o backend através de uma API REST. O backend possui o contexto `/api` configurado.

### Variáveis de ambiente

O frontend usa as seguintes variáveis de ambiente para configurar o acesso ao backend:

| Variável | Descrição | Valor padrão |
|----------|-----------|--------------|
| REACT_APP_API_URL | URL base da API, incluindo o contexto `/api` | http://localhost:8080/api |
| REACT_APP_API_TIMEOUT | Timeout para requisições em milissegundos | 30000 |
| REACT_APP_TOKEN_KEY | Chave para armazenar o token de autenticação no localStorage | carrent_token |
| REACT_APP_REFRESH_TOKEN_KEY | Chave para armazenar o token de refresh no localStorage | carrent_refresh_token |

### Arquivos de configuração

O projeto utiliza diferentes arquivos de configuração para diferentes ambientes:

- `.env` - Configurações base, usadas como fallback
- `.env.development` - Configurações para ambiente de desenvolvimento local
- `.env.production` - Configurações para ambiente de produção

### Scripts disponíveis

Para facilitar a execução em diferentes ambientes, os seguintes scripts estão disponíveis:

```bash
# Inicia o app em modo desenvolvimento com as configurações padrão
npm start

# Inicia o app em modo desenvolvimento com as configurações de desenvolvimento
npm run start:dev

# Inicia o app em modo desenvolvimento com as configurações de produção
npm run start:prod

# Compila o app para produção com as configurações padrão
npm run build

# Compila o app para produção com as configurações de desenvolvimento
npm run build:dev

# Compila o app para produção com as configurações de produção
npm run build:prod
```

## Docker

Para executar o frontend em um ambiente Docker, é possível sobrescrever as variáveis de ambiente no arquivo `docker-compose.override.yml`. Um exemplo está disponível em `docker-compose.override.example.yml`.

## Comunicação com a API

O frontend se comunica com o backend através de um cliente HTTP (axios) configurado para acessar a API no contexto correto. A configuração é centralizada em `src/utils/config.ts` e utilizada em `src/services/api.ts`. 