CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS sellers (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	seller_name TEXT NOT NULL,
	contact_first_name TEXT NOT NULL,
	contact_last_name TEXT NOT NULL,
	website TEXT,
	contact_email TEXT NOT NULL,
	address_line_1 TEXT NOT NULL,
	address_line_2 TEXT,
	cuty TEXT,
	state TEXT,
	zip TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sellers (
	id,
	seller_name,
	contact_first_name,
	contact_last_name,
	website,
	contact_email,
	address_line_1,
	address_line_2,
	cuty,
	state,
	zip,
	created_at,
	updated_at
)
SELECT
	gen_random_uuid(),
	format('Seller %s', n),
	first_names[((n - 1) % array_length(first_names, 1)) + 1],
	last_names[((n - 1) % array_length(last_names, 1)) + 1],
	format('https://seller%s.example.com', n),
	format('contact%s@seller%s.example.com', n, n),
	format('%s Main Street', n),
	CASE WHEN n % 3 = 0 THEN format('Suite %s', n) ELSE NULL END,
	format('City %s', n),
	states[((n - 1) % array_length(states, 1)) + 1],
	LPAD((10000 + n)::text, 5, '0'),
	NOW(),
	NOW()
FROM generate_series(1, 100) AS gs(n)
CROSS JOIN (
	SELECT
		ARRAY['Avery', 'Blake', 'Casey', 'Drew', 'Emerson', 'Finley', 'Gray', 'Harper', 'Indigo', 'Jordan'] AS first_names,
		ARRAY['Anderson', 'Bennett', 'Carter', 'Delgado', 'Ellis', 'Foster', 'Griffin', 'Hayes', 'Iverson', 'James'] AS last_names,
		ARRAY['AL', 'CA', 'FL', 'GA', 'IL', 'NY', 'NC', 'OH', 'TX', 'WA'] AS states
) AS seed;


select * from sellers;