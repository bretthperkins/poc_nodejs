const dataPostgresService = require('./customer.service');

exports.getCustomerById = async (req, res) => {
  const customer_id = req.params.id;

  if (!customer_id) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  try {
    const message = await dataPostgresService.getCustomer(customer_id);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to fetch customer' });
  }
};

exports.getCustomersByCompany = async (req, res) => {
  let company_name = req.params.company_name;

  // Log incoming param for debugging
  console.log('GET /company/:company_name called with raw param ->', company_name);

  if (!company_name) {
    res.status(400).json({ error: 'company_name is required' });
    return;
  }

  // Ensure proper decoding and trimming
  try {
    company_name = decodeURIComponent(company_name).trim();
  } catch (e) {
    // If decoding fails, keep original value
  }

  try {
    const message = await dataPostgresService.getCustomersByCompany(company_name);
    res.json({ message });
  } catch (error) {
    console.error('Error fetching customers by company:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customers' });
  }
};

exports.createCustomer = async (req, res) => {
  const { first_name, last_name, email, company_name } = req.body;
  if (!first_name || !last_name || !email || !company_name) {
    return res.status(400).json({ error: 'first_name, last_name, email, company_name are required' });
  }

  try {
    const message = await dataPostgresService.createCustomer(first_name, last_name, email, company_name);
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create customer' });
  }
};

exports.updateCustomer = async (req, res) => {
  const customer_id = req.params.id;
  const { first_name, last_name, email } = req.body;

  if (!customer_id || !first_name || !last_name || !email) {
    return res.status(400).json({ error: 'id, first_name, last_name, email are required' });
  }

  try {
    const message = await dataPostgresService.updateCustomer(customer_id, first_name, last_name, email);
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to update customer' });
  }
};