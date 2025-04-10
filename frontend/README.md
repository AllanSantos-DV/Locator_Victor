# Frontend - Sistema de Locação de Veículos

Interface de usuário desenvolvida com React e Material-UI para o sistema de gerenciamento de locação de veículos.

## Tecnologias Utilizadas

- **React 18**: Biblioteca JavaScript para construção de interfaces
- **TypeScript**: Linguagem tipada que compila para JavaScript
- **Material-UI (MUI) 5**: Framework de componentes de UI seguindo o Material Design
- **React Router Dom 6**: Navegação e roteamento
- **React Query (TanStack Query)**: Gerenciamento de estado e cache para requisições
- **Axios**: Cliente HTTP para comunicação com a API
- **Formik**: Gerenciamento de formulários
- **Yup**: Validação de esquemas para formulários
- **Notistack**: Sistema de notificações (toasts)
- **Jest & Testing Library**: Testes automatizados

## Estrutura do Projeto

- **src/assets**: Recursos estáticos como imagens e ícones
- **src/components**: Componentes reutilizáveis
- **src/contexts**: Contextos React para estado global
- **src/hooks**: Custom hooks reutilizáveis
- **src/layouts**: Layouts para as diferentes seções da aplicação
- **src/pages**: Componentes de página
- **src/services**: Serviços para comunicação com a API
- **src/types**: Definições de tipos TypeScript
- **src/utils**: Funções utilitárias
- **src/__tests__**: Testes automatizados

## Requisitos

- Node.js 18+
- npm ou yarn

## Configuração do Ambiente

O sistema utiliza arquivos .env para configuração:

- **.env**: Configurações padrão
- **.env.dev**: Configurações para ambiente de desenvolvimento
- **.env.development.local**: Configurações locais (não versionadas)

### Variáveis de Ambiente Principais

```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
REACT_APP_VERSION=$npm_package_version
```

## Execução

### Instalação de Dependências

```bash
npm install
# ou
yarn install
```

### Desenvolvimento

```bash
npm start
# ou
yarn start
```

### Build

```bash
npm run build
# ou
yarn build
```

### Testes

```bash
# Executa os testes
npm test
# ou
yarn test

# Executa os testes com cobertura
npm run test:coverage
# ou
yarn test:coverage
```

## Análise de Bundle

Para analisar o tamanho do bundle gerado:

```bash
npm run analyze
# ou
yarn analyze
```

## Convenções e Boas Práticas

1. **Nomenclatura**:
   - Componentes: PascalCase
   - Funções e variáveis: camelCase
   - Constantes: UPPER_SNAKE_CASE

2. **Estilização**:
   - Utilizar o sistema de estilização do Material-UI (styled)
   - Seguir o tema definido em `src/theme.ts`

3. **Gerenciamento de Estado**:
   - Utilizar React Query para estado de servidor
   - Utilizar React Context para estado global compartilhado
   - Utilizar useState/useReducer para estado local

4. **Organização de Código**:
   - Seguir princípios SOLID sempre que possível
   - Componentizar funcionalidades reutilizáveis
   - Separar lógica de negócio de componentes de UI

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

### Scripts disponíveis

Para facilitar a execução em ambiente de desenvolvimento, os seguintes scripts estão disponíveis:

```bash
# Inicia o app em modo desenvolvimento com as configurações padrão
npm start

# Inicia o app em modo desenvolvimento com as configurações de desenvolvimento
npm run start:dev

# Compila o app com as configurações padrão
npm run build

# Compila o app com as configurações de desenvolvimento
npm run build:dev
```

## Docker

Para executar o frontend em um ambiente Docker, é possível sobrescrever as variáveis de ambiente no arquivo `docker-compose.override.yml`. Um exemplo está disponível em `docker-compose.override.example.yml`.

## Comunicação com a API

O frontend se comunica com o backend através de um cliente HTTP (axios) configurado para acessar a API no contexto correto. A configuração é centralizada em `src/utils/config.ts` e utilizada em `src/services/api.ts`. 