const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_INSTANCE,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
});

pool.on('connect', () => {
  console.log('Connected to Postgres');
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres error', err);
  process.exit(-1);
});

module.exports = pool;