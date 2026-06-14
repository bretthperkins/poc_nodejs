const express = require('express');
const router = express.Router();
const rootController = require('./root.controller');
const customerRoutes = require('../modules/customer/customer.routes');

// GET /
router.get('/', rootController.getRoot);

// Mount customer routes under /customer
router.use('/customer', customerRoutes);

module.exports = router;