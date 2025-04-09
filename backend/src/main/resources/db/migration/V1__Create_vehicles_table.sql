CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    model_year INT NOT NULL,
    plate VARCHAR(255) NOT NULL,
    category ENUM('ECONOMY', 'STANDARD', 'LUXURY', 'SUV', 'TRUCK') NOT NULL,
    daily_rate DECIMAL(38,2) NOT NULL,
    description VARCHAR(1000),
    available BIT NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    status VARCHAR(20) DEFAULT 'AVAILABLE' NOT NULL,
    CONSTRAINT UK_lle7kf4cbmwh6twthj1tik9us UNIQUE (plate)
);

CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_available ON vehicles(available);
CREATE INDEX idx_vehicles_category ON vehicles(category); 