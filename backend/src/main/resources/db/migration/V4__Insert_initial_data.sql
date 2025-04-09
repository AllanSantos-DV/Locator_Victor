-- Inserir usuário administrador
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@carrent.com', '$2a$10$YEwb7u2ub7YtxeP9dOvTLeVd0kfvO9kz3z6bh.3IW/0GgYPX/T3TG', 'ADMIN');

-- Inserir veículos iniciais
INSERT INTO vehicles (brand, model, model_year, plate, category, daily_rate, description, available, status)
VALUES 
    ('Toyota', 'Corolla', 2023, 'ABC1234', 'STANDARD', 150.00, 'Sedan executivo completo', 1, 'AVAILABLE'),
    ('Honda', 'Civic', 2023, 'DEF5678', 'STANDARD', 160.00, 'Sedan esportivo completo', 1, 'AVAILABLE'),
    ('Volkswagen', 'Golf', 2023, 'GHI9012', 'STANDARD', 140.00, 'Hatch premium completo', 1, 'AVAILABLE'); 