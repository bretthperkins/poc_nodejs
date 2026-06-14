const rootService = require('./root.service');

exports.getRoot = (req, res) => {
  const message = rootService.getWelcomeMessage();
  res.json({ message });
};