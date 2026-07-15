const express = require('express');
const router = express.Router();

const controller = require('./customer.controller');
const { requirePermission } = require('../../middleware/auth');

router.get('/:id', requirePermission('customer.read'), controller.getCustomerById);
router.get('/company_name/:company_name', requirePermission('customer.read'), controller.getCustomersByCompany);
router.post('/', requirePermission('customer.write'), controller.createCustomer);
router.put('/:id', requirePermission('customer.write'), controller.updateCustomer);

module.exports = router;