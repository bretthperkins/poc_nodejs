const repository = require('./customer.repository');

exports.getCustomer = async (customer_id) => {
  const result = await repository.findById(customer_id);
  return result;
};

exports.getCustomersByCompany = async (company_name) => {
  const result = await repository.findByCompany(company_name);
  return result;
}

exports.updateCustomer = async (customer_id, first_name, last_name, email) => {
  const result = await repository.updateCustomer(customer_id, first_name, last_name, email);
  return result;
};

exports.createCustomer = async (first_name, last_name, email, company_name) => {
  const result = await repository.createCustomer(first_name, last_name, email, company_name);
  return result;
};