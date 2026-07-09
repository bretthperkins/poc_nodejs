const express = require('express');
const router = express.Router();

const controller = require('./seller.controller');
const { requireAudience } = require('../../middleware/auth');

router.use(
	requireAudience(
		process.env.KEYCLOAK_AUDIENCE_SELLER
	)
);

router.get('/:id', controller.getSellerById);
router.get('/name/:seller_name', controller.getSellersBySellerName);

module.exports = router;