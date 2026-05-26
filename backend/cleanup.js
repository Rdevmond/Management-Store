import mysql from 'mysql2/promise';

async function cleanupDB() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root', // Adjust if needed
    password: '',
    database: 'es_salju_app'
  });

  try {
    console.log('--- CLEANUP START ---');

    // 1. Find and remove duplicate products (keep the one with lowest ID)
    const [products] = await connection.execute('SELECT id, name FROM products ORDER BY id ASC');
    const seenProducts = new Set();
    let deletedProductsCount = 0;
    
    for (const p of products) {
      if (seenProducts.has(p.name)) {
        await connection.execute('DELETE FROM products WHERE id = ?', [p.id]);
        deletedProductsCount++;
      } else {
        seenProducts.add(p.name);
      }
    }
    console.log(`Deleted ${deletedProductsCount} duplicate products.`);

    // 2. Find and remove duplicate inventory (keep the one with lowest ID)
    const [inventory] = await connection.execute('SELECT id, name FROM inventory ORDER BY id ASC');
    const seenInventory = new Set();
    let deletedInventoryCount = 0;
    
    for (const inv of inventory) {
      if (seenInventory.has(inv.name)) {
        await connection.execute('DELETE FROM inventory WHERE id = ?', [inv.id]);
        deletedInventoryCount++;
      } else {
        seenInventory.add(inv.name);
      }
    }
    console.log(`Deleted ${deletedInventoryCount} duplicate inventory items.`);

    // 3. Update categories for Vanila, Coklat, Stroberi to "Susu"
    // Also, might as well update all "Es Salju Susu / Bingsoo" to just "Susu" if they are the Bingsoo ones.
    // The user said "sama yang vanila, coklat stroberi masuk ke varian susu ya."
    const [updateResult] = await connection.execute(
      `UPDATE products 
       SET category = 'Es Salju Susu' 
       WHERE name LIKE '%Vanila%' OR name LIKE '%Coklat%' OR name LIKE '%Stroberi%'`
    );
    console.log(`Updated category for ${updateResult.affectedRows} products.`);

    console.log('--- CLEANUP DONE ---');
  } catch (err) {
    console.error('Error during cleanup:', err.message);
  } finally {
    await connection.end();
  }
}

cleanupDB();
