const repository = require('./seller.repository');

exports.getSeller = async (seller_id) => {
  const result = await repository.findById(seller_id);
  return result;
};

exports.getSellersBySellerName = async (seller_name) => {
  const result = await repository.findBySellerName(seller_name);
  return result;
};