require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const nodemailer = require('nodemailer');
const app = express();
const forgotCodes = {};
const PORT = process.env.PORT || 5113;
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Es Salju Backend API berjalan!' });
});

app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, username, email, role, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Username atau Password salah.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    if (password) {
      await pool.query('UPDATE users SET username=$1, email=$2, password=$3, role=$4 WHERE id=$5',
        [username, email, password, role, req.params.id]);
    } else {
      await pool.query('UPDATE users SET username=$1, email=$2, role=$3 WHERE id=$4',
        [username, email, role, req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/forgot-password', '/api/users/forgot-password'], async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).json({ error: 'Username and email required.' });
  try {
    const { rows } = await pool.query('SELECT id FROM users WHERE username = $1 AND email = $2', [username, email]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    forgotCodes[username] = { code, expires: Date.now() + 10 * 60 * 1000, email };

    const mailOptions = {
      from: process.env.SMTP_USER || '"Es Salju Admin" <no-reply@essalju.com>',
      to: email,
      subject: 'Kode Verifikasi Reset Password',
      text: `Kode verifikasi Anda adalah: ${code}\nKode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.`,
      html: `<div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; max-width: 480px; margin: auto; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
               <div style="text-align: center; margin-bottom: 20px;">
                 <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em;">Es Susu Salju Korea</h2>
                 <span style="font-size: 10px; color: #16a34a; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">Bingsoo & Kietna</span>
               </div>
               <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 20px;" />
               <p style="font-size: 14px; color: #334155; line-height: 1.5; margin: 0 0 16px;">Halo <strong>${username}</strong>,</p>
               <p style="font-size: 14px; color: #334155; line-height: 1.5; margin: 0 0 20px;">Kami menerima permintaan untuk mereset password akun Anda. Silakan gunakan kode verifikasi di bawah ini untuk melanjutkan:</p>
               <div style="font-size: 32px; font-weight: 800; text-align: center; letter-spacing: 0.25em; padding: 15px 0; margin: 20px 0; color: #16a34a; background-color: #f0fdf4; border-radius: 12px; border: 1px dashed #bbf7d0;">
                 &nbsp;${code}
               </div>
               <p style="font-size: 12px; color: #64748b; line-height: 1.5; text-align: center; margin: 20px 0 0;">Kode verifikasi ini hanya berlaku selama <strong>10 menit</strong>. Jika Anda tidak merasa melakukan permintaan ini, harap abaikan email ini.</p>
             </div>`
    };

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } else {
      try {
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        const info = await transporter.sendMail({
          ...mailOptions,
          from: `"Es Salju Admin (Demo)" <${testAccount.user}>`
        });
        const testUrl = nodemailer.getTestMessageUrl(info);
        res.json({ success: true, testUrl });
      } catch (etherealErr) {
        res.status(500).json({ error: 'Gagal membuat email sandbox virtual.' });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(['/api/verify-code', '/api/users/verify-code'], (req, res) => {
  const { username, email, code } = req.body;
  if (!username || !email || !code) {
    return res.status(400).json({ error: 'Username, email, dan kode verifikasi wajib diisi.' });
  }
  const entry = forgotCodes[username];
  if (!entry || entry.email !== email) {
    return res.status(404).json({ error: 'Permintaan reset password tidak ditemukan.' });
  }
  if (Date.now() > entry.expires) {
    delete forgotCodes[username];
    return res.status(410).json({ error: 'Kode verifikasi telah kedaluwarsa.' });
  }
  if (entry.code !== code) {
    return res.status(401).json({ error: 'Kode verifikasi salah.' });
  }
  res.json({ success: true });
});

app.post(['/api/confirm-forgot', '/api/users/confirm-forgot'], async (req, res) => {
  const { username, email, code, newPassword } = req.body;
  if (!username || !email || !code || !newPassword) return res.status(400).json({ error: 'All fields required.' });
  const entry = forgotCodes[username];
  if (!entry || entry.email !== email) return res.status(404).json({ error: 'No reset request found.' });
  if (Date.now() > entry.expires) { delete forgotCodes[username]; return res.status(410).json({ error: 'Code expired.' }); }
  if (entry.code !== code) return res.status(401).json({ error: 'Invalid code.' });
  try {
    await pool.query('UPDATE users SET password = $1 WHERE username = $2 AND email = $3', [newPassword, username, email]);
    delete forgotCodes[username];
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { name, category, price, image } = req.body;
  try {
    const { rows: resultRows } = await pool.query(
      'INSERT INTO products (name, category, price, image) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, category, price, image]
    );
    res.json({ id: resultRows[0].id, name, category, price, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { name, category, price, image } = req.body;
  try {
    await pool.query('UPDATE products SET name=$1, category=$2, price=$3, image=$4 WHERE id=$5',
      [name, category, price, image, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT *, min_stock as "minStock", purchase_link as "purchaseLink", personal_review as "personalReview", image FROM inventory');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  const { name, stock, unit, minStock, price, purchaseLink, personalReview, image } = req.body;
  try {
    const { rows: resultRows } = await pool.query(
      'INSERT INTO inventory (name, stock, unit, min_stock, price, purchase_link, personal_review, image) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [name, stock, unit, minStock, price, purchaseLink || '', personalReview || '', image || null]
    );
    res.json({ id: resultRows[0].id, name, stock, unit, minStock, price, purchaseLink, personalReview, image });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  const { name, stock, unit, minStock, price, purchaseLink, personalReview, image } = req.body;
  try {
    await pool.query(
      'UPDATE inventory SET name=$1, stock=$2, unit=$3, min_stock=$4, price=$5, purchase_link=$6, personal_review=$7, image=$8 WHERE id=$9',
      [name, stock, unit, minStock, price, purchaseLink || '', personalReview || '', image || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory/bulk-update', async (req, res) => {
  const { updates } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const u of updates) {
      await client.query('UPDATE inventory SET stock = $1 WHERE id = $2', [u.stock, u.id]);
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ingredient-rules', async (req, res) => {
  try {
    const { rows } = await pool.query(
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

app.post('/api/ingredient-rules/:productId', async (req, res) => {
  const productId = req.params.productId;
  const { rules } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM ingredient_rules WHERE product_id = $1', [productId]);
    for (const rule of rules) {
      if (!rule.inventory_id || isNaN(parseFloat(rule.amount)) || parseFloat(rule.amount) <= 0) continue;
      await client.query(
        'INSERT INTO ingredient_rules (product_id, inventory_id, amount) VALUES ($1, $2, $3)',
        [productId, rule.inventory_id, rule.amount]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get('/api/finance', async (req, res) => {
  const { start, end } = req.query;
  try {
    let query = 'SELECT * FROM finance';
    let params = [];
    if (start && end) {
      query += ' WHERE date >= $1 AND date <= $2';
      params = [start, end];
    }
    query += ' ORDER BY id DESC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/finance', async (req, res) => {
  const { type, amount, description, date } = req.body;
  try {
    const { rows: finRows } = await pool.query(
      'INSERT INTO finance (type, amount, description, date) VALUES ($1, $2, $3, $4) RETURNING id',
      [type, amount, description, date]
    );
    res.json({ id: finRows[0].id, type, amount, description, date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkout', async (req, res) => {
  const { inventoryUpdates, financeLog } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    let finResId = financeLog?.id || null;
    if (financeLog) {
      if (financeLog.id) {
        await client.query(
          'UPDATE finance SET type = $1, amount = $2, description = $3, date = $4 WHERE id = $5',
          [financeLog.type, financeLog.amount, financeLog.description, financeLog.date, financeLog.id]
        );
      } else {
        const { rows: finRows } = await client.query(
          'INSERT INTO finance (type, amount, description, date) VALUES ($1, $2, $3, $4) RETURNING id',
          [financeLog.type, financeLog.amount, financeLog.description, financeLog.date]
        );
        finResId = finRows[0].id;
      }
    }
    for (const u of inventoryUpdates) {
      await client.query('UPDATE inventory SET stock = $1 WHERE id = $2', [u.stock, u.id]);
    }
    await client.query('COMMIT');
    res.json({ success: true, financeId: finResId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/refund', async (req, res) => {
  const { inventoryRestorations, financeLog } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (financeLog) {
      await client.query(
        'INSERT INTO finance (type, amount, description, date) VALUES ($1, $2, $3, $4)',
        [financeLog.type, financeLog.amount, financeLog.description, financeLog.date]
      );
    }
    for (const u of inventoryRestorations) {
      await client.query('UPDATE inventory SET stock = stock + $1 WHERE id = $2', [u.amount, u.id]);
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n✅ Es Salju Backend API berjalan di http://localhost:${PORT}`);
    console.log(`   Uji koneksi: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;