const db = require('../../../data/postgres_connection');
const sql = require('../../../data/queries/sellers.sql');

exports.findById = async (id) => {
  const result = await db.query(sql.findById, [id]);
  return result.rows[0];
};

exports.findBySellerName = async (seller_name) => {
  const result = await db.query(sql.findBySellerName, [seller_name]);
  return result.rows;
};