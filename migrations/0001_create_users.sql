CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  parent_id INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);