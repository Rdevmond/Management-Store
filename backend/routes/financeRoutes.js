const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/finance', async (req, res) => {
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

router.post('/finance', async (req, res) => {
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

router.post('/checkout', async (req, res) => {
  const { inventoryUpdates, financeLog } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let finResId = financeLog?.id || null;
    if (financeLog) {
      if (financeLog.id) {
        await conn.query(
          'UPDATE finance SET type = ?, amount = ?, description = ?, date = ? WHERE id = ?',
          [financeLog.type, financeLog.amount, financeLog.description, financeLog.date, financeLog.id]
        );
      } else {
        const [finRes] = await conn.query(
          'INSERT INTO finance (type, amount, description, date) VALUES (?, ?, ?, ?)',
          [financeLog.type, financeLog.amount, financeLog.description, financeLog.date]
        );
        finResId = finRes.insertId;
      }
    }
    for (const u of inventoryUpdates) {
      await conn.query('UPDATE inventory SET stock = ? WHERE id = ?', [u.stock, u.id]);
    }
    await conn.commit();
    res.json({ success: true, financeId: finResId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.post('/refund', async (req, res) => {
  const { inventoryRestorations, financeLog } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    if (financeLog) {
      await conn.query(
        'INSERT INTO finance (type, amount, description, date) VALUES (?, ?, ?, ?)',
        [financeLog.type, financeLog.amount, financeLog.description, financeLog.date]
      );
    }
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

module.exports = router;
