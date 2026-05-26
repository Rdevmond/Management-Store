const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSeed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'es_salju_app',
    multipleStatements: true // VERY IMPORTANT for running SQL scripts
  });

  try {
    console.log('Reading seed.sql...');
    const seedPath = path.join(__dirname, '..', 'seed.sql');
    const sql = fs.readFileSync(seedPath, 'utf8');
    
    console.log('Executing seed.sql...');
    await pool.query(sql);
    
    console.log('Seed executed successfully.');
  } catch (err) {
    console.error('Failed to execute seed.sql:', err);
  } finally {
    await pool.end();
  }
}

runSeed();
