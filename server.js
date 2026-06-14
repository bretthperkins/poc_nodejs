require('dotenv').config();
const app = require('./src/app');
const postgres_db = require('./data/postgres_connection');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    // Optional: sanity check to verify DB connectivity
    await postgres_db.query('SELECT 1');
    console.log('Database connection verified');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
})();