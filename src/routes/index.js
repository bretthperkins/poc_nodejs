const express = require('express');
const router = express.Router();
const rootController = require('../controllers/root.controller');
const dataPostgresRoutes = require('./data.postgres');

// GET /
router.get('/', rootController.getRoot);

// Mount data postgres routes under /data
router.use('/data', dataPostgresRoutes);

module.exports = router;