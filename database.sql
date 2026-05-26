CREATE DATABASE IF NOT EXISTS es_salju_app;
USE es_salju_app;

-- 1. Table Users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'kasir', 'staff') NOT NULL DEFAULT 'kasir',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table Products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image TEXT
);

-- 3. Table Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    purchase_link TEXT,
    personal_review TEXT
);

-- 4. Table Finance
CREATE TABLE IF NOT EXISTS finance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('pemasukan', 'pengeluaran') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table Ingredient Rules (For Stock Deduction)
CREATE TABLE IF NOT EXISTS ingredient_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_category VARCHAR(50) NOT NULL,
    inventory_id INT NOT NULL,
    amount DECIMAL(10,4) NOT NULL,
    FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
);

-- 6. Table Orders (Queue & History)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    topping_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('antrian', 'paid', 'selesai', 'refund') NOT NULL DEFAULT 'antrian',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    toppings JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- SEED DATA --
-- Users
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@essalju.com', 'admin123', 'admin'),
('kasir', 'kasir@essalju.com', 'kasir123', 'kasir')
ON DUPLICATE KEY UPDATE id=id;

-- Products
INSERT INTO products (name, category, price, image) VALUES
('Es Salju Buah Sunkist', 'Es Salju Buah', 15000, '🍊'),
('Es Salju Buah Sirsak', 'Es Salju Buah', 15000, 'https://images.unsplash.com/photo-1596701062351-df5f8af5576a?auto=format&fit=crop&q=80&w=300'),
('Es Salju Buah Mangga', 'Es Salju Buah', 15000, 'https://images.unsplash.com/photo-1553119119-ac73c0290bb1?auto=format&fit=crop&q=80&w=300'),
('Es Salju Buah Nenas', 'Es Salju Buah', 15000, '🍍'),
('Es Salju Buah Delima', 'Es Salju Buah', 15000, '🍎'),
('Es Salju Buah Anggur', 'Es Salju Buah', 15000, '🍇'),
('Bingsoo Vanila', 'Es Salju Susu / Bingsoo', 15000, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=300'),
('Bingsoo Coklat', 'Es Salju Susu / Bingsoo', 15000, '🍫'),
('Bingsoo Stroberi', 'Es Salju Susu / Bingsoo', 15000, '🍓'),
('Es Salju Kietna', 'Kietna', 15000, '🍊'),
('Minuman Kietna Nanas', 'Kietna', 15000, '🍹'),
('Minuman Kietna Somboi', 'Minuman', 10000, '🥤');

-- Inventory
INSERT INTO inventory (id, name, stock, unit, min_stock, price, purchase_link, personal_review) VALUES
(1, 'Mangkok Bingsoo', 100, 'Pcs', 20, 1500, 'https://shopee.co.id/search?keyword=mangkok+bingsoo', 'Mangkok tebal premium, menjaga es tidak cepat meleleh. Pelanggan suka ukurannya.'),
(2, 'Sendok Plastik', 150, 'Pcs', 30, 500, 'https://shopee.co.id/search?keyword=sendok+plastik+bebek', 'Bahan kaku, tidak gampang patah untuk menyendok es serut padat.'),
(3, 'Susu Kental Manis', 50, 'Kaleng', 10, 12000, 'https://tokopedia.com/search?q=susu+kental+manis+carnation', 'Susu kental manis Carnation paling gurih untuk bingsoo.'),
(4, 'Susu Segar/UHT', 40, 'Liter', 8, 18000, 'https://tokopedia.com/search?q=greenfields+uht+full+cream+1l', 'Susu Greenfield UHT menghasilkan salju es krim yang lembut.'),
(5, 'Bubuk Perasa (Coklat, Vanila, Stroberi)', 10, 'Kg', 2, 60000, '', 'Gunakan merk premium agar rasa buahnya terasa alami, tidak serik di tenggorokan.'),
(6, 'Buah Segar & Sirup (Sunkist, Sirsak, Mangga, Nanas, Delima, Anggur)', 25, 'Kg/Botol', 5, 45000, '', 'Beli langsung dari Pasar Buah Nangka untuk harga grosir dan kualitas segar harian.'),
(7, 'Jeruk Kietna & Somboi Kering', 15, 'Kg', 3, 50000, '', 'Suplier Medan. Jeruk kietna harum dan matang pohon, somboi kering asin sedang.'),
(8, 'Es Batu / Ice Block', 30, 'Pack', 5, 10000, '', 'Es kristal higienis dari depo es lokal terdekat.'),
(9, 'Kantong Plastik / Takeaway Bag', 200, 'Pcs', 40, 400, 'https://shopee.co.id/search?keyword=plastik+tali+gelas+takeaway', 'Plastik berlogo khusus, muat 1-2 cup dengan sekat kokoh.')
ON DUPLICATE KEY UPDATE id=id;

-- Finance
INSERT INTO finance (type, amount, description, date) VALUES
('pengeluaran', 150000, 'Restock awal bahan baku (SKM & Susu Segar)', CURDATE() - INTERVAL 5 DAY),
('pemasukan', 45000, 'Penjualan POS #TRX-001 (3 x Es Salju Mangga)', CURDATE() - INTERVAL 4 DAY),
('pemasukan', 25000, 'Penjualan POS #TRX-002 (1 x Bingsoo Vanila + 1 x Minuman Kietna Somboi)', CURDATE() - INTERVAL 4 DAY),
('pengeluaran', 75000, 'Bayar Listrik Toko Harian', CURDATE() - INTERVAL 3 DAY),
('pemasukan', 60000, 'Penjualan POS #TRX-003 (4 x Es Salju Kietna)', CURDATE() - INTERVAL 3 DAY);

-- Ingredient Rules
INSERT INTO ingredient_rules (product_category, inventory_id, amount) VALUES
('Es Salju Buah', 1, 1),
('Es Salju Buah', 2, 1),
('Es Salju Buah', 3, 0.05),
('Es Salju Buah', 6, 0.08),
('Es Salju Buah', 8, 0.1),

('Es Salju Susu / Bingsoo', 1, 1),
('Es Salju Susu / Bingsoo', 2, 1),
('Es Salju Susu / Bingsoo', 3, 0.05),
('Es Salju Susu / Bingsoo', 4, 0.15),
('Es Salju Susu / Bingsoo', 5, 0.04),
('Es Salju Susu / Bingsoo', 8, 0.1),

('Kietna', 2, 1),
('Kietna', 7, 0.05),
('Kietna', 8, 0.1),
('Kietna', 9, 1),

('Minuman', 2, 1),
('Minuman', 7, 0.03),
('Minuman', 8, 0.1),
('Minuman', 9, 1);
-- ORDERS & ORDER_ITEMS DUMMY DATA
INSERT INTO orders (label, topping_price, subtotal, total, status, created_at) VALUES
  ('Order #1', 2000, 50000, 52000, 'paid', NOW()),
  ('Order #2', 0, 30000, 30000, 'antrian', NOW());

INSERT INTO order_items (order_id, product_id, quantity, toppings) VALUES
  (1, 1, 2, NULL),
  (1, 3, 1, NULL),
  (2, 2, 1, NULL);
