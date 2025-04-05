-- Inserir usuário padrão
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

-- Inserir usuário padrão com senha 'admin@123' (bcrypt)
INSERT INTO users (email, name, password, role)
VALUES ('admin@example.com', 'Admin User', '$2a$10$3VBWRqQv3uENzKvAT4KQrOBzVMQOvWN3te5fITH1N.rOzuBEjcgHa', 'ADMIN')
ON DUPLICATE KEY UPDATE role = 'ADMIN'; 