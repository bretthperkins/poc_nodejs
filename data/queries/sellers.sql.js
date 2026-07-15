const FIND_ALL = `
	SELECT
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
		zip,
		created_at,
		updated_at
	FROM sellers
	ORDER BY seller_name ASC;
`;

const FIND_BY_ID = `
	SELECT
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
		zip,
		created_at,
		updated_at
	FROM sellers
	WHERE id = $1;
`;

const FIND_BY_SELLER_NAME = `
	SELECT
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
		zip,
		created_at,
		updated_at
	FROM sellers
	WHERE seller_name = $1;
`;

const CREATE_SELLER = `
	INSERT INTO sellers (
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
	)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	RETURNING *;
`;

const UPDATE_SELLER = `
	UPDATE sellers
	SET
		seller_name = $1,
		contact_first_name = $2,
		contact_last_name = $3,
		website = $4,
		contact_email = $5,
		address_line_1 = $6,
		address_line_2 = $7,
		city = $8,
		state = $9,
		zip = $10,
		updated_at = NOW()
	WHERE id = $11
	RETURNING *;
`;

const REMOVE_SELLER = `
	DELETE FROM sellers
	WHERE id = $1;
`;

module.exports = {
	findAll: FIND_ALL,
	findById: FIND_BY_ID,
	findBySellerName: FIND_BY_SELLER_NAME,
	create: CREATE_SELLER,
	update: UPDATE_SELLER,
	remove: REMOVE_SELLER,
};
