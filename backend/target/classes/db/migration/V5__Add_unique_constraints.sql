-- Adicionar restrições únicas para as tabelas

-- Verificar e adicionar constraint para placa de veículo
SET @constraint_exists = (SELECT COUNT(*)
                           FROM information_schema.TABLE_CONSTRAINTS 
                           WHERE CONSTRAINT_SCHEMA = DATABASE() 
                             AND TABLE_NAME = 'vehicles' 
                             AND CONSTRAINT_NAME = 'uk_vehicles_plate');

SET @query = IF(@constraint_exists = 0, 'ALTER TABLE vehicles ADD CONSTRAINT uk_vehicles_plate UNIQUE (plate)', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar constraints para clientes
SET @email_constraint_exists = (SELECT COUNT(*)
                               FROM information_schema.TABLE_CONSTRAINTS 
                               WHERE CONSTRAINT_SCHEMA = DATABASE() 
                                 AND TABLE_NAME = 'customers' 
                                 AND CONSTRAINT_NAME = 'uk_customers_email');

SET @query = IF(@email_constraint_exists = 0, 'ALTER TABLE customers ADD CONSTRAINT uk_customers_email UNIQUE (email)', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @document_constraint_exists = (SELECT COUNT(*)
                                  FROM information_schema.TABLE_CONSTRAINTS 
                                  WHERE CONSTRAINT_SCHEMA = DATABASE() 
                                    AND TABLE_NAME = 'customers' 
                                    AND CONSTRAINT_NAME = 'uk_customers_document');

SET @query = IF(@document_constraint_exists = 0, 'ALTER TABLE customers ADD CONSTRAINT uk_customers_document UNIQUE (document)', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt; 