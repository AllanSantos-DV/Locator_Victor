# Backend - Sistema de Locação de Veículos

API REST desenvolvida com Spring Boot para gerenciamento completo de locação de veículos.

## Tecnologias Utilizadas

- **Spring Boot 3.2.3**: Framework principal para desenvolvimento da API
- **Spring Security**: Autenticação e autorização baseada em JWT
- **Spring Data JPA**: Acesso a dados e persistência
- **Spring Boot Actuator**: Monitoramento e métricas
- **MySQL**: Banco de dados relacional
- **Flyway**: Gerenciamento de migrações de banco de dados
- **MapStruct**: Mapeamento entre DTOs e entidades
- **Lombok**: Redução de código boilerplate
- **Springdoc OpenAPI**: Documentação da API com Swagger
- **Resilience4j**: Implementação de padrões de resiliência

## Arquitetura

O projeto segue uma arquitetura limpa baseada em DDD (Domain-Driven Design):

- **Domain**: Contém entidades, interfaces de repositórios e serviços de domínio
- **Application**: Implementa casos de uso e orquestra a lógica de negócio
- **Infrastructure**: Implementações concretas de repositórios e serviços
- **Presentation**: Camada de apresentação com controllers REST
- **Config**: Configurações globais da aplicação
- **Web**: Filtros, interceptors e outras configurações web

## Requisitos

- Java 17+
- Maven 3.8+
- Docker e Docker Compose (para ambiente de desenvolvimento)

## Configuração do Ambiente

O sistema utiliza arquivos .env para configuração:

- **.env.dev**: Configurações para ambiente de desenvolvimento
- **.env.example**: Exemplo de configuração (copie para .env.dev ou .env)

### Variáveis de Ambiente Principais

```
# Configurações do Banco de Dados
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=carrental
MYSQL_USERNAME=root
MYSQL_PASSWORD=root

# Configurações JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION_TIME=86400000
```

## Execução

### Desenvolvimento

```bash
# Linux/macOS
./start-dev.sh

# Windows
.\start-dev.ps1
```

### Testes

```bash
./mvnw test
```

### Build

```bash
./mvnw clean package
```

## Documentação da API

A documentação da API está disponível através do Swagger UI:

```
http://localhost:8080/swagger-ui.html
```

## Migrações de Banco de Dados

As migrações são gerenciadas pelo Flyway e executadas automaticamente na inicialização.

Para executar migrações manualmente:

```bash
./mvnw flyway:migrate -Dflyway.configFiles=.env.dev
```

## Monitoramento

O projeto inclui monitoramento com Spring Boot Actuator, com endpoints disponíveis em:

```
http://localhost:8080/actuator
```

Métricas são expostas no formato Prometheus para integração com sistemas de monitoramento.

## Gerenciamento de Usuários

O sistema implementa um gerenciamento de usuários com as seguintes características:

### Perfis de Usuário
- **USER**: Usuário normal com acesso limitado ao sistema
- **ADMIN**: Administrador com acesso completo, incluindo gerenciamento de usuários

### API de Gerenciamento de Usuários
- `GET /admin/users`: Retorna apenas usuários com perfil USER
- `GET /admin/users/all`: Retorna todos os usuários, incluindo administradores
- `GET /admin/users/{id}`: Detalha um usuário específico
- `POST /admin/users`: Cria um novo usuário
- `PUT /admin/users/{id}`: Atualiza um usuário existente (não permitido para ADMINs)
- `DELETE /admin/users/{id}`: Remove um usuário existente (não permitido para ADMINs)
- `POST /admin/users/{id}/notify`: Envia uma notificação para um usuário

### Restrições de Segurança
- Somente administradores podem acessar o módulo de gerenciamento de usuários
- Usuários com perfil ADMIN não podem ser editados ou excluídos
- As operações sensíveis são filtradas diretamente no banco de dados para performance 