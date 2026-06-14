const postgres_db = require('../../data/postgres_connection');

exports.getCustomer = async (customer_id) => {
  const result = await postgres_db.query('SELECT * FROM customers WHERE id = $1', [customer_id]);
  return result.rows[0];
};

exports.getCustomersByCompany = async (company_name) => {
  const result = await postgres_db.query('SELECT * FROM customers WHERE company_name = $1', [company_name]);
  return result.rows;
}