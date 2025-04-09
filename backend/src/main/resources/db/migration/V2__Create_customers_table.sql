CREATE TABLE IF NOT EXISTS customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    document VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address VARCHAR(200) NOT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    CONSTRAINT UK_it18e80awkffujkd8vnr5v1u5 UNIQUE (document),
    CONSTRAINT UK_rfbvkrffamfql7cjmen8v976v UNIQUE (email)
);

CREATE INDEX idx_customers_document ON customers(document);
CREATE INDEX idx_customers_email ON customers(email); 