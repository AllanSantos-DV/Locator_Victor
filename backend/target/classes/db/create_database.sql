-- Script para criar o banco de dados
CREATE DATABASE IF NOT EXISTS victor;

-- Para garantir que o usuário tenha permissões no banco
GRANT ALL PRIVILEGES ON victor.* TO 'userdb'@'%';
FLUSH PRIVILEGES; 