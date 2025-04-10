# Sistema de Locação de Veículos (CarRent)

Sistema completo para gerenciamento de locação de veículos, desenvolvido com Spring Boot e React.

## Descrição do Projeto

O CarRent é uma solução de software completa para empresas de locação de veículos, oferecendo funcionalidades para:

- Gerenciamento de veículos (cadastro, manutenção, disponibilidade)
- Cadastro e gestão de clientes
- Processo de reserva e locação
- Faturamento e pagamentos
- Relatórios e estatísticas
- Dashboard com indicadores de negócio

## Arquitetura do Sistema

O projeto segue uma arquitetura moderna de microsserviços, dividida em:

- **Backend**: API REST desenvolvida com Spring Boot, seguindo princípios de Clean Architecture e DDD
- **Frontend**: Interface de usuário desenvolvida com React e Material-UI
- **Banco de Dados**: MySQL para persistência de dados
- **Monitoramento**: Stack com Prometheus, Grafana e Alertmanager

Para mais detalhes sobre cada componente:
- [Documentação do Backend](./backend/README.md)
- [Documentação do Frontend](./frontend/README.md)

## Requisitos de Sistema

- Docker e Docker Compose
- Java 17
- Node.js 18
- Maven 3.8+
- npm ou yarn

## Configuração do Ambiente

O projeto utiliza arquivos de variáveis de ambiente para configurar o ambiente de desenvolvimento:

- `.env`: Configurações padrão
- `.env.dev`: Configurações para ambiente de desenvolvimento

Antes de iniciar a aplicação, certifique-se de configurar corretamente as variáveis de ambiente nos arquivos correspondentes.

## Iniciando a Aplicação

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

## Acessando os Serviços

Após iniciar a aplicação, os seguintes serviços estarão disponíveis:

- **Backend API**: http://localhost:8080
  - Swagger UI: http://localhost:8080/swagger-ui.html
  - API Docs: http://localhost:8080/v3/api-docs
- **Frontend**: http://localhost:3000
- **Grafana**: http://localhost:3001
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

## Desenvolvimento

### Fluxo de Trabalho Git

Este projeto segue o Gitflow como fluxo de trabalho:

- `main`: Versão principal em desenvolvimento
- `feature/*`: Novas funcionalidades
- `bugfix/*`: Correções de bugs

### Padrões de Código

- Backend: [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Frontend: [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)

## Estrutura de Diretórios

```
├── backend/               # Código do backend (Spring Boot)
│   ├── src/               # Código-fonte
│   ├── pom.xml            # Dependências e configuração Maven
│   └── README.md          # Documentação do backend
├── frontend/              # Código do frontend (React)
│   ├── src/               # Código-fonte
│   ├── package.json       # Dependências e scripts
│   └── README.md          # Documentação do frontend
├── docker-compose.yml     # Configuração Docker Compose
├── README.md              # Este arquivo
└── start-dev.sh           # Script de inicialização
```

## Monitoramento e Observabilidade

O sistema inclui monitoramento completo com:

- **Prometheus**: Coleta e armazenamento de métricas
- **Grafana**: Visualização de dashboards 
- **Alertmanager**: Configuração e envio de alertas
- **Spring Boot Actuator**: Exposição de métricas da aplicação

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

## Contribuição

Para contribuir com o projeto:

1. Crie um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adicionando nova feature'`)
4. Envie para o branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT. 