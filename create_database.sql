-- Script para criar o banco de dados
CREATE DATABASE IF NOT EXISTS victor;

-- Garantir que o usuário tenha permissões completas no banco
GRANT ALL PRIVILEGES ON victor.* TO 'userdb'@'%';
FLUSH PRIVILEGES; 