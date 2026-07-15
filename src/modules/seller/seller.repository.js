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

exports.updateSeller = async (
  id,
  seller_name,
  contact_first_name,
  contact_last_name,
  website,
  contact_email,
  address_line_1,
  address_line_2,
  city,
  state,
  zip
) => {
  const result = await db.query(sql.update, [
    seller_name,
    contact_first_name,
    contact_last_name,
    website,
    contact_email,
    address_line_1,
    address_line_2,
    city,
    state,
    zip,
    id,
  ]);
  return result.rows[0];
};

exports.createSeller = async (
  seller_name,
  contact_first_name,
  contact_last_name,
  website,
  contact_email,
  address_line_1,
  address_line_2,
  city,
  state,
  zip
) => {
  const result = await db.query(sql.create, [
    seller_name,
    contact_first_name,
    contact_last_name,
    website,
    contact_email,
    address_line_1,
    address_line_2,
    city,
    state,
    zip,
  ]);
  return result.rows[0];
};