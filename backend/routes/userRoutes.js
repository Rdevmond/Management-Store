const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
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

router.put('/:id', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





module.exports = router;
