const express = require('express');
const router = express.Router();

const controller = require('./customer.controller');
const { requireAudience } = require('../../middleware/auth');

router.use(
	requireAudience(
		process.env.KEYCLOAK_AUDIENCE_CUSTOMER
	)
);

router.get('/:id', controller.getCustomerById);
router.get('/company_name/:company_name', controller.getCustomersByCompany);

module.exports = router;