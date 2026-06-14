const express = require('express');
const router = express.Router();

const dataPostgresController = require('../controllers/data.postgres.controller');

// GET /customer/:customer_id
router.get('/customer/:customer_id', dataPostgresController.getCustomer);

// GET /customers/company/:company_name
router.get('/customer/company/:company_name', dataPostgresController.getCustomersByCompany);

module.exports = router;