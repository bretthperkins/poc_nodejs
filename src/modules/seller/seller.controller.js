const dataPostgresService = require('./seller.service');

exports.getSellerById = async (req, res) => {
  const seller_id = req.params.id;

  if (!seller_id) {
    res.status(400).json({ error: 'seller_id is required' });
    return;
  }

  try {
    const message = await dataPostgresService.getSeller(seller_id);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch seller' });
  }
};

exports.getSellersBySellerName = async (req, res) => {
  let seller_name = req.params.seller_name;

  // Log incoming param for debugging
  console.log('GET /seller/:seller_name called with raw param ->', seller_name);

  if (!seller_name) {
    res.status(400).json({ error: 'seller_name is required' });
    return;
  }

  // Ensure proper decoding and trimming
  try {
    seller_name = decodeURIComponent(seller_name).trim();
  } catch (e) {
    // If decoding fails, keep original value
  }

  try {
    const message = await dataPostgresService.getSellersBySellerName(seller_name);
    res.json({ message });
  } catch (error) {
    console.error('Error fetching sellers by seller name:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sellers' });
  }
};