const express = require('express');
const router = express.Router();

const controller = require('./customer.controller');

router.get('/:id', controller.getCustomerById);
router.get('/company_name/:company_name', controller.getCustomersByCompany);

module.exports = router;