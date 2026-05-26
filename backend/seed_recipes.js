/**
 * seed_recipes.js
 * Insert resep per produk (product_id) ke ingredient_rules.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedRecipes() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'es_salju_app',
  });

  try {
    // Resep per kategori (untuk dikonversi per produk)
    const recipesByCategory = {
      'Es Salju Buah': [
        { inv_id: 1, amount: 1 },   // Mangkok Bingsoo
        { inv_id: 2, amount: 1 },   // Sendok Plastik
        { inv_id: 3, amount: 0.05 },// SKM
        { inv_id: 6, amount: 0.08 },// Buah Segar & Sirup
        { inv_id: 8, amount: 0.1 }, // Es Batu
      ],
      'Es Salju Susu / Bingsoo': [
        { inv_id: 1, amount: 1 },   // Mangkok Bingsoo
        { inv_id: 2, amount: 1 },   // Sendok Plastik
        { inv_id: 3, amount: 0.05 },// SKM
        { inv_id: 4, amount: 0.15 },// Susu Segar/UHT
        { inv_id: 5, amount: 0.04 },// Bubuk Perasa
        { inv_id: 8, amount: 0.1 }, // Es Batu
      ],
      'Kietna': [
        { inv_id: 2, amount: 1 },   // Sendok Plastik
        { inv_id: 7, amount: 0.05 },// Jeruk Kietna & Somboi
        { inv_id: 8, amount: 0.1 }, // Es Batu
        { inv_id: 9, amount: 1 },   // Kantong Plastik
      ],
      'Minuman': [
        { inv_id: 2, amount: 1 },   // Sendok Plastik
        { inv_id: 7, amount: 0.03 },// Jeruk Kietna & Somboi
        { inv_id: 8, amount: 0.1 }, // Es Batu
        { inv_id: 9, amount: 1 },   // Kantong Plastik
      ],
    };

    // Ambil semua produk
    const [products] = await conn.query('SELECT id, name, category FROM products');
    
    // Bersihkan resep lama
    await conn.query('DELETE FROM ingredient_rules');
    console.log('Resep lama dibersihkan.\n');

    let total = 0;
    for (const product of products) {
      const rules = recipesByCategory[product.category];
      if (!rules) {
        console.log(`  - ${product.name}: kategori tidak dikenal (${product.category})`);
        continue;
      }
      for (const rule of rules) {
        await conn.query(
          'INSERT INTO ingredient_rules (product_id, inventory_id, amount) VALUES (?, ?, ?)',
          [product.id, rule.inv_id, rule.amount]
        );
        total++;
      }
      console.log(`  ✓ ${product.name} (id=${product.id}): ${rules.length} bahan`);
    }

    console.log(`\n✅ Selesai! ${total} baris resep berhasil dimasukkan.`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await conn.end();
  }
}

seedRecipes();
