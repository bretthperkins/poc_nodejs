require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

(async () => {
  try {

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
})();