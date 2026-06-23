const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.API_DB_SERVER_USER,
  password: process.env.API_DB_SERVER_PASSWORD,
  database: process.env.API_DB_SERVER_INSTANCE,
  host: process.env.API_DB_SERVER_HOST,
  port: process.env.API_DB_SERVER_PORT,
});

pool.on('connect', () => {
  console.log('Connected to Postgres');
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres error', err);
  process.exit(-1);
});

module.exports = pool;