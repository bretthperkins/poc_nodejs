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