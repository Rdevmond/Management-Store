require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5174', credentials: true }));
app.use(express.json());

// ─── HEALTH CHECK ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Es Salju Backend API berjalan!' });
});

// ─── USERS ──────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Username atau Password salah.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, password, role]
    );
    res.json({ id: result.insertId, username, email, role });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username atau Email sudah ada.' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    if (password) {
      await pool.query('UPDATE users SET username=?, email=?, password=?, role=? WHERE id=?',
        [username, email, password, role, req.params.id]);
    } else {
      await pool.query('UPDATE users SET username=?, email=?, role=? WHERE id=?',
        [username, email, role, req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PRODUCTS ───────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, category, price, image } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO products (name, category, price, image) VALUES (?, ?, ?, ?)',
      [name, category, price, image]
    );
    res.json({ id: result.insertId, name, category, price, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, category, price, image } = req.body;
  try {
    await pool.query('UPDATE products SET name=?, category=?, price=?, image=? WHERE id=?',
      [name, category, price, image, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INVENTORY ──────────────────────────────────────────────
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, min_stock as minStock, purchase_link as purchaseLink, personal_review as personalReview FROM inventory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { name, stock, unit, minStock, price, purchaseLink, personalReview } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO inventory (name, stock, unit, min_stock, price, purchase_link, personal_review) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, stock, unit, minStock, price, purchaseLink || '', personalReview || '']
    );
    res.json({ id: result.insertId, name, stock, unit, minStock, price, purchaseLink, personalReview });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { name, stock, unit, minStock, price, purchaseLink, personalReview } = req.body;
  try {
    await pool.query(
      'UPDATE inventory SET name=?, stock=?, unit=?, min_stock=?, price=?, purchase_link=?, personal_review=? WHERE id=?',
      [name, stock, unit, minStock, price, purchaseLink || '', personalReview || '', req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk update inventory (untuk deduct stok setelah transaksi)
app.post('/api/inventory/bulk-update', async (req, res) => {
  const { updates } = req.body; // [{ id, stock }]
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const u of updates) {
      await conn.query('UPDATE inventory SET stock = ? WHERE id = ?', [u.stock, u.id]);
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INGREDIENT RULES ───────────────────────────────────────
// GET all rules grouped by product_id
app.get('/api/ingredient-rules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ir.product_id, ir.inventory_id as id, ir.amount, inv.name as inv_name, inv.unit
       FROM ingredient_rules ir
       JOIN inventory inv ON inv.id = ir.inventory_id
       ORDER BY ir.product_id`
    );
    // Transform to { productId: [{id, amount, inv_name, unit}] }
    const rules = {};
    rows.forEach(row => {
      const key = row.product_id;
      if (!rules[key]) rules[key] = [];
      rules[key].push({ id: row.id, amount: parseFloat(row.amount), inv_name: row.inv_name, unit: row.unit });
    });
    res.json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ingredient-rules/:productId — Replace entire recipe for a product
app.post('/api/ingredient-rules/:productId', async (req, res) => {
  const productId = req.params.productId;
  const { rules } = req.body; // [{ inventory_id, amount }]
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Delete existing recipe for this product
    await conn.query('DELETE FROM ingredient_rules WHERE product_id = ?', [productId]);
    // Insert new rules
    for (const rule of rules) {
      if (!rule.inventory_id || isNaN(parseFloat(rule.amount)) || parseFloat(rule.amount) <= 0) continue;
      await conn.query(
        'INSERT INTO ingredient_rules (product_id, inventory_id, amount) VALUES (?, ?, ?)',
        [productId, rule.inventory_id, rule.amount]
      );
    }
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─── FINANCE ────────────────────────────────────────────────
app.get('/api/finance', async (req, res) => {
  const { start, end } = req.query;
  try {
    let query = 'SELECT * FROM finance';
    let params = [];
    if (start && end) {
      query += ' WHERE date >= ? AND date <= ?';
      params = [start, end];
    }
    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/finance', async (req, res) => {
  const { type, amount, description, date } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO finance (type, amount, description, date) VALUES (?, ?, ?, ?)',
      [type, amount, description, date]
    );
    res.json({ id: result.insertId, type, amount, description, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CHECKOUT (Atomic Transaction: Finance + Inventory) ─────
app.post('/api/checkout', async (req, res) => {
  const { inventoryUpdates, financeLog } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert finance record
    const [finRes] = await conn.query(
      'INSERT INTO finance (type, amount, description, date) VALUES (?, ?, ?, ?)',
      [financeLog.type, financeLog.amount, financeLog.description, financeLog.date]
    );

    // 2. Deduct inventory stocks
    for (const u of inventoryUpdates) {
      await conn.query('UPDATE inventory SET stock = ? WHERE id = ?', [u.stock, u.id]);
    }

    await conn.commit();
    res.json({ success: true, financeId: finRes.insertId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─── REFUND (Atomic: Reverse Finance + Inventory) ───────────
app.post('/api/refund', async (req, res) => {
  const { inventoryRestorations, financeLog } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert refund finance record
    await conn.query(
      'INSERT INTO finance (type, amount, description, date) VALUES (?, ?, ?, ?)',
      [financeLog.type, financeLog.amount, financeLog.description, financeLog.date]
    );

    // 2. Restore inventory stocks
    for (const u of inventoryRestorations) {
      await conn.query('UPDATE inventory SET stock = stock + ? WHERE id = ?', [u.amount, u.id]);
    }

    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ─── START SERVER ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Es Salju Backend API berjalan di http://localhost:${PORT}`);
  console.log(`   Uji koneksi: http://localhost:${PORT}/api/health\n`);
});
