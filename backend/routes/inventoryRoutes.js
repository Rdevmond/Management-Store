const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT *, min_stock as minStock, purchase_link as purchaseLink, personal_review as personalReview, image FROM inventory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, stock, unit, minStock, price, purchaseLink, personalReview, image } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO inventory (name, stock, unit, min_stock, price, purchase_link, personal_review, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, stock, unit, minStock, price, purchaseLink || '', personalReview || '', image || null]
    );
    res.json({ id: result.insertId, name, stock, unit, minStock, price, purchaseLink, personalReview, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { name, stock, unit, minStock, price, purchaseLink, personalReview, image } = req.body;
  try {
    await pool.query(
      'UPDATE inventory SET name=?, stock=?, unit=?, min_stock=?, price=?, purchase_link=?, personal_review=?, image=? WHERE id=?',
      [name, stock, unit, minStock, price, purchaseLink || '', personalReview || '', image || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/bulk-update', async (req, res) => {
  const { updates } = req.body;
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

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
