const express = require('express');
const router = express.Router();

const controller = require('./seller.controller');
const { requirePermission } = require('../../middleware/auth');

router.get('/:id', requirePermission('seller.read'), controller.getSellerById);
router.get('/name/:seller_name', requirePermission('seller.read'), controller.getSellersBySellerName);
router.post('/', requirePermission('seller.write'), controller.createSeller);
router.put('/:id', requirePermission('seller.write'), controller.updateSeller);

module.exports = router;