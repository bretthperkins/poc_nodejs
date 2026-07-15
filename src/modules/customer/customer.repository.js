const db = require('../../../data/postgres_connection');
const sql = require('../../../data/queries/customers.sql');

exports.findById = async (id) => {
  const result = await db.query(sql.findById, [id]);
  return result.rows[0];
};

exports.findByCompany = async (company_name) => {
  const result = await db.query(sql.findByCompany, [company_name]);
  return result.rows;
};

exports.updateCustomer = async (id, first_name, last_name, email) => {
  const result = await db.query(sql.update, [first_name, last_name, email, id]);
  return result.rows[0];
};

exports.createCustomer = async (first_name, last_name, email, company_name) => {
  const result = await db.query(sql.create, [first_name, last_name, email, company_name]);
  return result.rows[0];
};