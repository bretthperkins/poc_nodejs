const express = require('express');
const routes = require('./root/index');
const { authenticateToken } = require('./middleware/auth');

const app = express();

app.use(express.json());

// Apply authentication to ALL routes
app.use(authenticateToken);

// Register all routes (now protected)
app.use('/', routes);

module.exports = app;
