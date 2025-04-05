#!/bin/bash

# Carrega as variáveis de ambiente do arquivo .env.prod
export $(grep -v '^#' .env.prod | xargs)

# Para todos os containers em execução
docker-compose -f docker-compose.prod.yml down

# Inicia os containers em modo de produção
docker-compose -f docker-compose.prod.yml up --build 