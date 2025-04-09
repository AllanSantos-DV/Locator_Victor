CREATE TABLE IF NOT EXISTS rentals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    start_date DATETIME(6) NOT NULL,
    end_date DATETIME(6) NOT NULL,
    actual_return_date DATETIME(6),
    total_amount DECIMAL(38,2) NOT NULL,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL,
    notes VARCHAR(1000),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    CONSTRAINT FKcxn0lr4sjtxi7u4nxshbaj83u FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT FKntcru14g0fxwkgeqae4t83h4i FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
);

CREATE INDEX idx_rentals_customer ON rentals(customer_id);
CREATE INDEX idx_rentals_vehicle ON rentals(vehicle_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_dates ON rentals(start_date, end_date); 