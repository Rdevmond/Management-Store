CREATE DATABASE IF NOT EXISTS es_salju_app;
USE es_salju_app;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'kasir', 'staff') NOT NULL DEFAULT 'kasir',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image TEXT
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    purchase_link TEXT,
    personal_review TEXT,
    image LONGTEXT
);

-- Finance table
CREATE TABLE IF NOT EXISTS finance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('pemasukan', 'pengeluaran') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ingredient rules table (BOM per product)
CREATE TABLE IF NOT EXISTS ingredient_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    inventory_id INT NOT NULL,
    amount DECIMAL(10,4) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- Orders table (queue & history)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    topping_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('antrian', 'paid', 'selesai', 'refund') NOT NULL DEFAULT 'antrian',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    toppings JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
