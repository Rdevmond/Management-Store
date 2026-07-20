-- Supabase (PostgreSQL) Seed Data

INSERT INTO users (username, email, password, role) VALUES
  ('pemilik', 'admin@essalju.com', 'pemilik123', 'pemilik'),
  ('kasir', 'kasir@essalju.com', 'kasir123', 'kasir')
ON CONFLICT (username) DO NOTHING;

INSERT INTO products (name, category, price, image) VALUES
  ('Es Salju Buah Sunkist', 'Es Salju Buah', 15000, '/images/bingso_sunkist.png'),
  ('Es Salju Buah Sirsak', 'Es Salju Buah', 15000, '/images/bingso_sirsak.png'),
  ('Es Salju Buah Mangga', 'Es Salju Buah', 15000, '/images/bingso_mangga.png'),
  ('Es Salju Buah Nenas', 'Es Salju Buah', 15000, '/images/bingso_nenas.png'),
  ('Es Salju Buah Delima', 'Es Salju Buah', 15000, '/images/bingso_delima.png'),
  ('Es Salju Buah Anggur', 'Es Salju Buah', 15000, '/images/bingso_anggur.png'),
  ('Bingsoo Vanila', 'Es Salju Susu', 15000, '/images/bingso_vanila.png'),
  ('Bingsoo Coklat', 'Es Salju Susu', 15000, '/images/bingso_coklat.png'),
  ('Bingsoo Stroberi', 'Es Salju Susu', 15000, '/images/bingso_stroberi.png'),
  ('Es Salju Kietna', 'Kietna', 15000, '/images/bingso_kietna.png'),
  ('Minuman Kietna Nanas', 'Kietna', 15000, '/images/minuman_kietna_nanas.png'),
  ('Minuman Kietna Somboi', 'Minuman', 10000, '/images/minuman_somboi.png')
ON CONFLICT (name) DO NOTHING;

INSERT INTO inventory (id, name, stock, unit, min_stock, price, purchase_link, personal_review) VALUES
  (1,  'Mangkok Bingsoo',         30,  'Pcs',    10, 1500,  'https://shopee.co.id/search?keyword=mangkok+bingsoo',            'Mangkok tebal premium, menjaga es tidak cepat meleleh.'),
  (2,  'Sendok Plastik',          50,  'Pcs',    20, 500,   'https://shopee.co.id/search?keyword=sendok+plastik+bebek',       'Bahan kaku, tidak gampang patah untuk menyendok es serut padat.'),
  (3,  'Susu Kental Manis (SKM)', 10,  'Kaleng',  3, 12000, 'https://tokopedia.com/search?q=susu+kental+manis+carnation',    'Susu kental manis Carnation paling gurih untuk bingsoo.'),
  (4,  'Susu Segar/UHT',          12,  'Liter',   3, 18000, 'https://tokopedia.com/search?q=greenfields+uht+full+cream+1l',  'Susu Greenfield UHT menghasilkan salju es krim lembut.'),
  (5,  'Bubuk Vanila',            1,   'Kg',      0.5, 55000, '', 'Gunakan merk premium agar aroma vanila kuat dan alami.'),
  (6,  'Bubuk Coklat',            1,   'Kg',      0.5, 60000, '', 'Merk premium untuk rasa coklat yang pekat, tidak pahit.'),
  (7,  'Bubuk Stroberi',          1,   'Kg',      0.5, 55000, '', 'Pilih warna cerah natural, bukan pewarna buatan berlebih.'),
  (8,  'Jus/Sirup Sunkist',       4,   'Botol',   1,  25000, '', 'Sirup jeruk sunkist segar untuk topping es buah.'),
  (9,  'Jus/Sirup Sirsak',        4,   'Botol',   1,  25000, '', 'Sirsak sangat cocok dipadukan dengan salju susu.'),
  (10, 'Jus/Sirup Mangga',        4,   'Botol',   1,  25000, '', 'Mangga harum dan manis, favorit pelanggan.'),
  (11, 'Jus/Sirup Nenas',         3,   'Botol',   1,  22000, '', 'Nenas memberikan rasa asam manis yang segar.'),
  (12, 'Jus/Sirup Delima',        3,   'Botol',   1,  28000, '', 'Delima memberikan warna merah cantik dan rasa unik.'),
  (13, 'Jus/Sirup Anggur',        3,   'Botol',   1,  26000, '', 'Anggur ungu memberikan rasa manis sedikit asam.'),
  (14, 'Jeruk Kietna',            2,   'Kg',      1,  50000, '', 'Suplier Medan. Jeruk kietna harum dan matang pohon.'),
  (15, 'Somboi Kering',           1,   'Kg',      0.5, 45000, '', 'Somboi kering asin sedang, aroma khas Sumatera.'),
  (16, 'Es Batu / Ice Block',     5,   'Pack',    2,  10000, '', 'Es kristal higienis dari depo es lokal terdekat.'),
  (17, 'Kantong Plastik',         50,  'Pcs',     20, 400,  'https://shopee.co.id/search?keyword=plastik+tali+gelas+takeaway', 'Plastik muat 1-2 cup dengan sekat kokoh.')
ON CONFLICT (id) DO NOTHING;

-- Dalam PostgreSQL, memasukkan ID secara manual ke kolom SERIAL akan membuat sequence "tertinggal".
-- Baris ini memperbaiki urutan ID inventory agar fitur "Tambah Inventory" tidak error.
SELECT setval('inventory_id_seq', (SELECT MAX(id) FROM inventory));

INSERT INTO finance (type, amount, description, date) VALUES
  ('pengeluaran', 150000, 'Restock awal bahan baku (SKM & Susu Segar)',          CURRENT_DATE - INTERVAL '5 days'),
  ('pemasukan',   45000,  'Penjualan Kasir: 3x Es Salju Mangga',                 CURRENT_DATE - INTERVAL '4 days'),
  ('pemasukan',   25000,  'Penjualan Kasir: 1x Bingsoo Vanila, 1x Kietna Somboi', CURRENT_DATE - INTERVAL '4 days'),
  ('pengeluaran', 75000,  'Pembayaran Listrik & Kebersihan',                     CURRENT_DATE - INTERVAL '3 days'),
  ('pemasukan',   60000,  'Penjualan Kasir: 4x Es Salju Kietna',                 CURRENT_DATE - INTERVAL '3 days'),
  ('pemasukan',   120000, 'Penjualan Kasir: 4x Bingsoo Vanila, 2x Es Salju Buah Sunkist', CURRENT_DATE);

INSERT INTO ingredient_rules (product_id, inventory_id, amount) VALUES
  (1, 1, 1), (1, 2, 1), (1, 3, 0.05), (1, 8,  0.08), (1, 16, 0.1),
  (2, 1, 1), (2, 2, 1), (2, 3, 0.05), (2, 9,  0.08), (2, 16, 0.1),
  (3, 1, 1), (3, 2, 1), (3, 3, 0.05), (3, 10, 0.08), (3, 16, 0.1),
  (4, 1, 1), (4, 2, 1), (4, 3, 0.05), (4, 11, 0.08), (4, 16, 0.1),
  (5, 1, 1), (5, 2, 1), (5, 3, 0.05), (5, 12, 0.08), (5, 16, 0.1),
  (6, 1, 1), (6, 2, 1), (6, 3, 0.05), (6, 13, 0.08), (6, 16, 0.1),
  (7, 1, 1), (7, 2, 1), (7, 3, 0.05), (7, 4, 0.15), (7, 5, 0.04), (7, 16, 0.1),
  (8, 1, 1), (8, 2, 1), (8, 3, 0.05), (8, 4, 0.15), (8, 6, 0.04), (8, 16, 0.1),
  (9, 1, 1), (9, 2, 1), (9, 3, 0.05), (9, 4, 0.15), (9, 7, 0.04), (9, 16, 0.1),
  (10, 2, 1), (10, 14, 0.05), (10, 16, 0.1), (10, 17, 1),
  (11, 2, 1), (11, 14, 0.05), (11, 11, 0.05), (11, 16, 0.1), (11, 17, 1),
  (12, 2, 1), (12, 15, 0.03), (12, 16, 0.1), (12, 17, 1);

INSERT INTO orders (label, topping_price, subtotal, total, status, created_at) VALUES
  ('Pesanan #1', 0, 45000, 45000, 'paid',    NOW()),
  ('Pesanan #2', 0, 15000, 15000, 'antrian', NOW()),
  ('Pesanan #3', 0, 60000, 60000, 'paid',    NOW());

INSERT INTO order_items (order_id, product_id, quantity, toppings) VALUES
  (1, 1, 2, NULL),
  (1, 3, 1, NULL),
  (2, 2, 1, NULL),
  (3, 5, 3, NULL),
  (3, 9, 1, NULL);
