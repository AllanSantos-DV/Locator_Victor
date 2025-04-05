# Carrega as variáveis de ambiente do arquivo .env.prod
Get-Content .env.prod | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

# Para todos os containers em execução
docker-compose -f docker-compose.prod.yml down

# Inicia os containers em modo de produção
docker-compose -f docker-compose.prod.yml up --build 