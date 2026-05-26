require('dotenv').config();
const mysql = require('mysql2/promise');

// Create MySQL connection pool using environment variables with sensible defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // default empty for local development
  database: process.env.DB_NAME || 'es_salju_app',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT) : 10,
  queueLimit: 0,
  dateStrings: true
});

module.exports = pool;
