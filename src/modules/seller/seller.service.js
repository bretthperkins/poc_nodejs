const repository = require('./seller.repository');

exports.getSeller = async (seller_id) => {
  const result = await repository.findById(seller_id);
  return result;
};

exports.getSellersBySellerName = async (seller_name) => {
  const result = await repository.findBySellerName(seller_name);
  return result;
};

exports.updateSeller = async (
  seller_id,
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
  const result = await repository.updateSeller(
    seller_id,
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
  );
  return result;
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
  const result = await repository.createSeller(
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
  );
  return result;
};