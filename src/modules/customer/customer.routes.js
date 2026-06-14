const express = require('express');
const router = express.Router();

const dataPostgresController = require('./customer.controller');

// GET /customer/:customer_id
router.get('/:customer_id', dataPostgresController.getCustomer);

// GET /customers/company/:company_name
router.get('/company/:company_name', dataPostgresController.getCustomersByCompany);

module.exports = router;