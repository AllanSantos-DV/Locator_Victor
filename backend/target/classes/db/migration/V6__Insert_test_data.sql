-- Inserir dados de teste para veículos
INSERT INTO vehicles (brand, model, model_year, plate, category, daily_rate, description, available)
VALUES
    ('Toyota', 'Corolla', 2022, 'ABC1D23', 'STANDARD', 150.00, 'Sedan 4 portas com ar condicionado e direção hidráulica', 1),
    ('Honda', 'Civic', 2021, 'DEF4G56', 'STANDARD', 160.00, 'Sedan 4 portas com câmbio automático', 1),
    ('Fiat', 'Uno', 2020, 'GHI7J89', 'ECONOMY', 90.00, 'Compacto econômico', 1),
    ('Volkswagen', 'Gol', 2019, 'JKL1M23', 'ECONOMY', 95.00, 'Hatch compacto', 1),
    ('Hyundai', 'Tucson', 2023, 'NOP4Q56', 'SUV', 220.00, 'SUV com 5 lugares e porta-malas espaçoso', 1);

-- Inserir dados de teste para clientes
INSERT INTO customers (name, email, document, phone, address)
VALUES
    ('João Silva', 'joao.silva@exemplo.com', '12345678900', '(11) 98765-4321', 'Rua das Flores, 123, São Paulo, SP'),
    ('Maria Oliveira', 'maria.oliveira@exemplo.com', '98765432100', '(21) 99876-5432', 'Av. Atlântica, 456, Rio de Janeiro, RJ'),
    ('Pedro Santos', 'pedro.santos@exemplo.com', '45678912300', '(31) 97654-3210', 'Rua das Palmeiras, 789, Belo Horizonte, MG');

-- Inserir dados de teste para locações
INSERT INTO rentals (customer_id, vehicle_id, start_date, end_date, actual_return_date, total_amount, status, notes)
VALUES
    (1, 1, '2023-05-10', '2023-05-15', '2023-05-15', 750.00, 'COMPLETED', 'Locação concluída sem incidentes'),
    (2, 3, '2023-06-20', '2023-06-25', '2023-06-25', 450.00, 'COMPLETED', 'Cliente satisfeito com o veículo'),
    (3, 2, '2023-07-05', '2023-07-10', NULL, 800.00, 'PENDING', 'Aguardando retirada do veículo'),
    (1, 4, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 5 DAY), NULL, 475.00, 'IN_PROGRESS', 'Cliente retirou o veículo hoje'); 