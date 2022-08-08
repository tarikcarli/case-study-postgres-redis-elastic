CREATE EXTENSION pg_trgm;
CREATE TABLE category(
	idx serial PRIMARY KEY,
	elastic_idx TEXT,
	"name" TEXT,
	creation_time timestamptz NOT NULL DEFAULT now(),
	deletion_time timestamptz
);
CREATE UNIQUE INDEX ON category("name");
CREATE INDEX ON category(elastic_idx);
CREATE INDEX ON category(deletion_time);
CREATE INDEX ON category USING GIST (name gist_trgm_ops);

CREATE TABLE product(
	idx serial PRIMARY KEY,
	elastic_idx TEXT,
	category_idx int4,
	"name" TEXT,
	creation_time timestamptz NOT NULL DEFAULT now(),
	deletion_time timestamptz,
	FOREIGN KEY(category_idx) 
   	REFERENCES category(idx)
);
CREATE INDEX ON product(elastic_idx);
CREATE INDEX ON product(deletion_time);
CREATE INDEX ON product USING GIST (name gist_trgm_ops);

CREATE TABLE product_updated_idx(
	idx serial PRIMARY KEY,
	product_idx int4,
	FOREIGN KEY(product_idx) 
   	REFERENCES product(idx)
);

CREATE TABLE category_updated_idx(
	idx serial PRIMARY KEY,
	category_idx int4,
	FOREIGN KEY(category_idx) 
   	REFERENCES category(idx)
);