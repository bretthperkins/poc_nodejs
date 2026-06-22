const express = require('express');
const router = express.Router();
const rootController = require('./root.controller');
const customerController = require('../modules/customer/customer.controller');
const customerRoutes = require('../modules/customer/customer.routes');

// GET /
router.get('/', rootController.getRoot);

// Mount customer routes under /customer
router.use('/customer', customerRoutes);

// Expose company lookup at top-level: GET /company/:company_name
router.get('/company/:company_name', customerController.getCustomersByCompany);

module.exports = router;