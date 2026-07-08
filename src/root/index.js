const express = require('express');
const router = express.Router();
const rootController = require('./root.controller');

const routes = [
  { path: '/customer', router: require('../modules/customer/customer.routes.js') },
  { path: '/seller', router: require('../modules/seller/seller.routes.js') },
];

router.get('/', rootController.getRoot);

for (const route of routes) {
  router.use(route.path, route.router);
}

module.exports = router;