# Sistema de Locação de Veículos

Sistema completo para gerenciamento de locação de veículos, desenvolvido com Spring Boot e React.

## Estrutura do Projeto

O projeto está organizado em duas partes principais:

- **Backend**: API REST desenvolvida com Spring Boot
- **Frontend**: Interface de usuário desenvolvida com React e Material-UI

## Requisitos

- Docker e Docker Compose
- Java 17
- Node.js 18
- Maven
- npm

## Configuração

### Variáveis de Ambiente

O projeto utiliza arquivos de variáveis de ambiente para configurar diferentes ambientes:

- `.env`: Configurações padrão
- `.env.dev`: Configurações para ambiente de desenvolvimento
- `.env.prod`: Configurações para ambiente de produção

Antes de iniciar a aplicação, certifique-se de configurar corretamente as variáveis de ambiente nos arquivos correspondentes.

## Iniciando a Aplicação

### Ambiente de Desenvolvimento

#### Linux/macOS

```bash
# Dar permissão de execução ao script
chmod +x start-dev.sh

# Iniciar a aplicação
./start-dev.sh
```

#### Windows

```powershell
# Iniciar a aplicação
.\start-dev.ps1
```

### Ambiente de Produção

#### Linux/macOS

```bash
# Dar permissão de execução ao script
chmod +x start-prod.sh

# Iniciar a aplicação
./start-prod.sh
```

#### Windows

```powershell
# Iniciar a aplicação
.\start-prod.ps1
```

## Acessando os Serviços

Após iniciar a aplicação, os seguintes serviços estarão disponíveis:

- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

## Monitoramento

O sistema inclui monitoramento completo com:

- Prometheus para coleta de métricas
- Grafana para visualização de dashboards
- Alertmanager para notificações
- Node Exporter para métricas do sistema

## Desenvolvimento

### Backend

O backend é desenvolvido com Spring Boot e utiliza:

- Spring Security para autenticação e autorização
- Spring Data JPA para acesso a dados
- Spring Boot Actuator para monitoramento
- JWT para autenticação baseada em tokens

### Frontend

O frontend é desenvolvido com React e utiliza:

- Material-UI para componentes de interface
- React Router para navegação
- React Query para gerenciamento de estado e cache
- Formik e Yup para validação de formulários

## Testes

### Backend

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npm test
```

## Licença

Este projeto está licenciado sob a licença MIT. 