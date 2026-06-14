const FIND_ALL = `
  SELECT id, first_name, last_name, email
  FROM customers
  ORDER BY last_name ASC;
`;

const FIND_BY_ID = `
  SELECT id, first_name, last_name, email
  FROM customers
  WHERE id = $1;
`;

const FIND_BY_COMPANY = `
  SELECT id, first_name, last_name, email
  FROM customers
  WHERE company_name = $1;
`;

const CREATE_CUSTOMER = `
  INSERT INTO customers (first_name, last_name, email)
  VALUES ($1, $2, $3)
  RETURNING *;
`;

const UPDATE_CUSTOMER = `
  UPDATE customers
  SET first_name = $1, last_name = $2, email = $3
  WHERE id = $4
  RETURNING *;
`;

const REMOVE_CUSTOMER = `
  DELETE FROM customers
  WHERE id = $1;
`;

module.exports = {
  findAll: FIND_ALL,
  findById: FIND_BY_ID,
  findByCompany: FIND_BY_COMPANY,
  create: CREATE_CUSTOMER,
  update: UPDATE_CUSTOMER,
  remove: REMOVE_CUSTOMER,
};