/**
 * migrate_recipes.js
 * Migrasi tabel ingredient_rules dari berbasis kategori ke berbasis produk.
 * Jalankan sekali saja.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'es_salju_app',
    multipleStatements: true,
  });

  try {
    console.log('Memulai migrasi ingredient_rules...\n');

    // 1. Baca semua produk
    const [products] = await conn.query('SELECT id, name, category FROM products');
    console.log(`  Ditemukan ${products.length} produk.`);

    // 2. Baca semua aturan resep lama (per kategori)
    const [oldRules] = await conn.query('SELECT product_category, inventory_id, amount FROM ingredient_rules');
    console.log(`  Ditemukan ${oldRules.length} baris aturan resep lama.`);

    // 3. Hapus kolom lama & tambah kolom baru product_id (jika belum ada)
    // Cek struktur tabel dulu
    const [cols] = await conn.query(`SHOW COLUMNS FROM ingredient_rules`);
    const colNames = cols.map(c => c.Field);
    
    if (!colNames.includes('product_id')) {
      console.log('\n  Menambahkan kolom product_id...');
      await conn.query(`ALTER TABLE ingredient_rules ADD COLUMN product_id INT NULL AFTER id`);
    }

    // Buat product_category nullable dulu agar INSERT baru bisa berjalan
    if (colNames.includes('product_category')) {
      await conn.query(`ALTER TABLE ingredient_rules MODIFY product_category VARCHAR(50) NULL DEFAULT NULL`);
    }

    // 4. Hapus semua data lama, isi ulang berdasarkan per produk
    await conn.query('DELETE FROM ingredient_rules');
    console.log('  Data lama dihapus. Mengisi ulang berdasarkan per produk...\n');

    let insertCount = 0;
    for (const product of products) {
      const rulesForCategory = oldRules.filter(r => r.product_category === product.category);
      for (const rule of rulesForCategory) {
        await conn.query(
          'INSERT INTO ingredient_rules (product_id, inventory_id, amount) VALUES (?, ?, ?)',
          [product.id, rule.inventory_id, rule.amount]
        );
        insertCount++;
      }
      if (rulesForCategory.length > 0) {
        console.log(`  ✓ ${product.name} (${product.category}): ${rulesForCategory.length} bahan`);
      } else {
        console.log(`  - ${product.name} (${product.category}): tidak ada resep`);
      }
    }

    // 5. Hapus kolom product_category yang lama jika masih ada
    const [cols2] = await conn.query(`SHOW COLUMNS FROM ingredient_rules`);
    const colNames2 = cols2.map(c => c.Field);
    if (colNames2.includes('product_category')) {
      console.log('\n  Menghapus kolom product_category...');
      await conn.query(`ALTER TABLE ingredient_rules DROP COLUMN product_category`);
    }

    // 6. Tambahkan NOT NULL constraint ke product_id
    await conn.query(`ALTER TABLE ingredient_rules MODIFY product_id INT NOT NULL`);
    
    // 7. Tambah foreign key jika belum ada
    try {
      await conn.query(`ALTER TABLE ingredient_rules ADD CONSTRAINT fk_recipe_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`);
    } catch {
      // Mungkin sudah ada, abaikan
    }

    console.log(`\n✅ Migrasi selesai! Total ${insertCount} baris resep berhasil dipindahkan.`);
  } catch (err) {
    console.error('❌ Gagal migrasi:', err.message);
    console.error(err);
  } finally {
    await conn.end();
  }
}

migrate();
