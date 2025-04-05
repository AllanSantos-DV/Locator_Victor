-- Adicionar foreign keys para a tabela rentals
ALTER TABLE rentals
ADD CONSTRAINT fk_rentals_customer
FOREIGN KEY (customer_id) REFERENCES customers(id);

ALTER TABLE rentals
ADD CONSTRAINT fk_rentals_vehicle
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id); 