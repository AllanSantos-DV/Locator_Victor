-- Fix user data to match the User entity
-- Inserir um usuário administrador que corresponde à estrutura da entidade User.java
INSERT INTO users (email, name, password, role)
VALUES ('admin@carrent.com', 'Administrador', '$2a$10$3VBWRqQv3uENzKvAT4KQrOBzVMQOvWN3te5fITH1N.rOzuBEjcgHa', 'ADMIN')
ON DUPLICATE KEY UPDATE role = 'ADMIN'; 