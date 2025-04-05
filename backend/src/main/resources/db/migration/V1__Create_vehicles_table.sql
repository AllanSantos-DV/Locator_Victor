CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    model_year INT NOT NULL,
    plate VARCHAR(10) NOT NULL,
    category VARCHAR(20) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    description VARCHAR(1000),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_year CHECK (model_year >= 1900 AND model_year <= 2100),
    CONSTRAINT chk_daily_rate CHECK (daily_rate > 0)
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_available ON vehicles(available);
CREATE INDEX idx_vehicles_category ON vehicles(category); 