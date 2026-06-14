const express = require('express');
const routes = require('./routes');

const app = express();

app.use(express.json());

// Register all routes
app.use('/', routes);

module.exports = app;