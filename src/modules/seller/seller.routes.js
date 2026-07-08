const express = require('express');
const router = express.Router();

const controller = require('./seller.controller');

router.get('/:id', controller.getSellerById);
router.get('/name/:seller_name', controller.getSellersBySellerName);

module.exports = router;