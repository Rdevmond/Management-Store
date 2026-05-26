-- ==============================
--  SEED DATA (REALISTIC)
-- ==============================

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
  ('Bingsoo Vanila', 'Es Salju Susu', 15000, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=300'),
  ('Bingsoo Coklat', 'Es Salju Susu', 15000, '🍫'),
  ('Bingsoo Stroberi', 'Es Salju Susu', 15000, '🍓'),
  ('Es Salju Kietna', 'Kietna', 15000, '🍊'),
  ('Minuman Kietna Nanas', 'Kietna', 15000, '🍹'),
  ('Minuman Kietna Somboi', 'Minuman', 10000, '🥤')
  ON DUPLICATE KEY UPDATE id=id;

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

-- Finance (mix of past and today entries)
INSERT INTO finance (type, amount, description, date) VALUES
  ('pengeluaran', 150000, 'Restock awal bahan baku (SKM & Susu Segar)', CURDATE() - INTERVAL 5 DAY),
  ('pemasukan', 45000, 'Penjualan Kasir: 3x Es Salju Mangga', CURDATE() - INTERVAL 4 DAY),
  ('pemasukan', 25000, 'Penjualan Kasir: 1x Bingsoo Vanila, 1x Minuman Kietna Somboi', CURDATE() - INTERVAL 4 DAY),
  ('pengeluaran', 75000, 'Pembayaran Listrik & Kebersihan', CURDATE() - INTERVAL 3 DAY),
  ('pemasukan', 60000, 'Penjualan Kasir: 4x Es Salju Kietna', CURDATE() - INTERVAL 3 DAY),
  ('pemasukan', 120000, 'Penjualan Kasir: 4x Bingsoo Vanila, 2x Es Salju Buah Sunkist', CURDATE());

-- Ingredient Rules (Mapped per product_id)
INSERT INTO ingredient_rules (product_id, inventory_id, amount) VALUES
  -- Es Salju Buah Sunkist (1)
  (1, 1, 1), (1, 2, 1), (1, 3, 0.05), (1, 6, 0.08), (1, 8, 0.1),
  -- Es Salju Buah Sirsak (2)
  (2, 1, 1), (2, 2, 1), (2, 3, 0.05), (2, 6, 0.08), (2, 8, 0.1),
  -- Es Salju Buah Mangga (3)
  (3, 1, 1), (3, 2, 1), (3, 3, 0.05), (3, 6, 0.08), (3, 8, 0.1),
  -- Es Salju Buah Nenas (4)
  (4, 1, 1), (4, 2, 1), (4, 3, 0.05), (4, 6, 0.08), (4, 8, 0.1),
  -- Es Salju Buah Delima (5)
  (5, 1, 1), (5, 2, 1), (5, 3, 0.05), (5, 6, 0.08), (5, 8, 0.1),
  -- Es Salju Buah Anggur (6)
  (6, 1, 1), (6, 2, 1), (6, 3, 0.05), (6, 6, 0.08), (6, 8, 0.1),
  
  -- Bingsoo Vanila (7)
  (7, 1, 1), (7, 2, 1), (7, 3, 0.05), (7, 4, 0.15), (7, 5, 0.04), (7, 8, 0.1),
  -- Bingsoo Coklat (8)
  (8, 1, 1), (8, 2, 1), (8, 3, 0.05), (8, 4, 0.15), (8, 5, 0.04), (8, 8, 0.1),
  -- Bingsoo Stroberi (9)
  (9, 1, 1), (9, 2, 1), (9, 3, 0.05), (9, 4, 0.15), (9, 5, 0.04), (9, 8, 0.1),
  
  -- Es Salju Kietna (10)
  (10, 2, 1), (10, 7, 0.05), (10, 8, 0.1), (10, 9, 1),
  -- Minuman Kietna Nanas (11)
  (11, 2, 1), (11, 7, 0.05), (11, 8, 0.1), (11, 9, 1),
  -- Minuman Kietna Somboi (12)
  (12, 2, 1), (12, 7, 0.03), (12, 8, 0.1), (12, 9, 1);

-- Orders & Order Items
INSERT INTO orders (label, topping_price, subtotal, total, status, created_at) VALUES
  ('Order #1', 2000, 50000, 52000, 'paid', NOW()),
  ('Order #2', 0, 30000, 30000, 'antrian', NOW()),
  ('Order #3', 1500, 40000, 41500, 'paid', NOW());

INSERT INTO order_items (order_id, product_id, quantity, toppings) VALUES
  (1, 1, 2, NULL),
  (1, 3, 1, NULL),
  (2, 2, 1, NULL),
  (3, 5, 3, NULL),
  (3, 9, 1, NULL);
