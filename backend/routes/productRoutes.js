const express = require('express');
const productsRouter = express.Router();
const rulesRouter = express.Router();
const pool = require('../db');


productsRouter.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

productsRouter.post('/', async (req, res) => {
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

productsRouter.put('/:id', async (req, res) => {
  const { name, category, price, image } = req.body;
  try {
    await pool.query('UPDATE products SET name=?, category=?, price=?, image=? WHERE id=?',
      [name, category, price, image, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

productsRouter.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


rulesRouter.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ir.product_id, ir.inventory_id as id, ir.amount, inv.name as inv_name, inv.unit
       FROM ingredient_rules ir
       JOIN inventory inv ON inv.id = ir.inventory_id
       ORDER BY ir.product_id`
    );
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

rulesRouter.post('/:productId', async (req, res) => {
  const productId = req.params.productId;
  const { rules } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM ingredient_rules WHERE product_id = ?', [productId]);
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

module.exports = { productsRouter, rulesRouter };
