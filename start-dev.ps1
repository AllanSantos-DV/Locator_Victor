# Carrega as variáveis de ambiente do arquivo .env.dev
Get-Content .env.dev | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

# Para todos os containers em execução
docker-compose -f docker-compose.dev.yml down

# Inicia os containers em modo de desenvolvimento
docker-compose -f docker-compose.dev.yml up --build 