#!/bin/bash

# Carrega as variáveis de ambiente do arquivo .env.dev
export $(grep -v '^#' .env.dev | xargs)

# Para todos os containers em execução
docker-compose -f docker-compose.dev.yml down

# Inicia os containers em modo de desenvolvimento
docker-compose -f docker-compose.dev.yml up --build 