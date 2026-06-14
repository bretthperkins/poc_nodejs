const repository = require('./customer.repository');

exports.getCustomer = async (customer_id) => {
  const result = await repository.findById(customer_id);
  return result;
};

exports.getCustomersByCompany = async (company_name) => {
  const result = await repository.findByCompany(company_name);
  return result;
}