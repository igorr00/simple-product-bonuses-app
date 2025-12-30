CREATE TABLE bonuses (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  purchase_id INT NOT NULL REFERENCES purchases(id),
  type TEXT CHECK (type IN ('DIRECT', 'TEAM')),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT CHECK (status IN ('PENDING', 'PAID')),
  available_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
