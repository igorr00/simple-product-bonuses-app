# simple-product-bonuses-app
This is a Node.js + Express API with a PostgreSQL database that implements a referral-based bonus system.  
Users can invite other users to the platform. When a user makes a purchase, bonuses are paid to their upline according to defined business rules.

---

## Business Rules

- Users can invite other users (tree structure)
- When a user purchases a product:
  - **Direct bonus**
    - Paid instantly
    - 10% of product price
    - Paid to the direct inviter (parent)
  - **Team bonus**
    - Paid to all uplines (parent, parent’s parent, etc.)
    - 5% of product price per upline
    - Paid 1 hour after the purchase

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- SQL-based migrations
- Background worker for delayed payouts

---

## Project Structure

src/  
├── app.js  
├── server.js  
├── db.js  
├── routes/  
│ ├── users.js  
│ └── purchases.js  
├── services/  
│ └── uplineService.js  
├── workers/  
│ └── bonusWorker.js  
└── migrations/  


---

## Database Schema

### users
- id
- email
- parent_id (self-referencing)
- created_at

### products
- id
- name
- price

### purchases
- id
- user_id
- product_id
- price
- created_at

### bonuses
- id
- user_id
- purchase_id
- type (`DIRECT`, `TEAM`)
- amount
- status (`PENDING`, `PAID`)
- available_at
- created_at

---

## Migrations

SQL migration files are located in the `migrations/` directory.

They must be executed in order:

1. create users
2. create products
3. create purchases
4. create bonuses

Products are seeded manually:

```sql
INSERT INTO products (name, price) VALUES
('Package 1', 100.00),
('Package 2', 500.00);
```

---

## Running the application

### Install dependencies
```bash
npm install
```

### Create PostgreSQL database
```sql
CREATE DATABASE simple-product-bonuses-app;
```

Update .env:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/simple-product-bonuses-app
```

### Run migrations (manual execution)
Execute SQL files from the migrations/ directory using pgAdmin or psql.

### Start the API server
```bash
npm run dev
```

Server runs on:
```arduino
http://localhost:3000
```

### Start the bonus worker (separate terminal)
```bash
node src/workers/bonusWorker.js
```

The worker:

Runs every minute  
Pays all pending bonuses whose available_at <= now()

### API Endpoints
Create User
```bash
POST /api/users
```
```json
{
  "email": "user@test.com",
  "parentId": 1
}
```

parentId is optional.

Create Purchase
```bash
POST /api/purchases
```
```json
{
  "userId": 3,
  "productId": 1
}
```

This will:  
Create a purchase  
Pay direct bonus instantly  
Schedule team bonuses for 1 hour later  

### Testing  
The API can be tested using Postman

Example test flow:  
Create users with referral relationships  
Create a purchase  
Verify bonuses table  
Run bonus worker  
Confirm team bonuses change from PENDING to PAID
