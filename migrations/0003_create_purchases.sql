CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  product_id INT NOT NULL REFERENCES products(id),
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
