-- Script para reverter todas as alterações (usado apenas para desenvolvimento)

-- Remover foreign keys
ALTER TABLE rentals DROP FOREIGN KEY fk_rentals_vehicle;
ALTER TABLE rentals DROP FOREIGN KEY fk_rentals_customer;

-- Remover constraints de unicidade
ALTER TABLE vehicles DROP INDEX uk_vehicles_plate;
ALTER TABLE customers DROP INDEX uk_customers_email;
ALTER TABLE customers DROP INDEX uk_customers_document;

-- Remover tabelas
DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS vehicles; 