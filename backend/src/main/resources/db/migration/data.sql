-- Arquivo: src/main/resources/data.sql

-- Inserir usuários iniciais
INSERT INTO users (name, email, password, role) 
VALUES ('Admin User', 'admin@carrent.com', '$2a$10$jtW.Q7RV7MGqAK.OjnrUwuZ5eVGqd7AJnf.mL1KQgaM9ePxJmvfxW', 'ADMIN');

-- Inserir veículos iniciais
INSERT INTO vehicles (brand, model, model_year, plate, daily_rate, available, category, description)
VALUES 
  ('Toyota', 'Corolla', 2022, 'ABC1234', 100.00, true, 'STANDARD', 'Carro sedan de médio porte, econômico e confortável'),
  ('Honda', 'Civic', 2021, 'DEF5678', 110.00, true, 'STANDARD', 'Sedan esportivo com ótimo acabamento interno'),
  ('Jeep', 'Renegade', 2022, 'GHI9012', 150.00, true, 'SUV', 'SUV compacto ideal para cidade e viagens'),
  ('Volkswagen', 'Golf', 2021, 'JKL3456', 130.00, true, 'STANDARD', 'Hatch premium com ótimo desempenho'),
  ('Ford', 'Ranger', 2021, 'MNO7890', 200.00, true, 'TRUCK', 'Picape robusta para trabalho e lazer');

-- Inserir clientes iniciais
INSERT INTO customers (name, email, phone, document, address)
VALUES 
  ('João Silva', 'joao.silva@email.com', '(11) 98765-4321', '123.456.789-00', 'Rua das Flores, 123'),
  ('Maria Santos', 'maria.santos@email.com', '(11) 91234-5678', '987.654.321-00', 'Avenida Principal, 456'),
  ('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99876-5432', '456.789.123-00', 'Rua dos Pinheiros, 789');