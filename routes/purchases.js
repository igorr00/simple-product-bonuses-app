const express = require('express');
const db = require('../db');
const { getUpline } = require('../services/uplineService');

const router = express.Router();

router.post('/', async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId and productId are required' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const productResult = await client.query(
      'SELECT id, price FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rowCount === 0) {
      throw new Error('Product not found');
    }

    const price = productResult.rows[0].price;

    const purchaseResult = await client.query(
      `INSERT INTO purchases (user_id, product_id, price)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, productId, price]
    );

    const purchase = purchaseResult.rows[0];

    const parentResult = await client.query(
      'SELECT parent_id FROM users WHERE id = $1',
      [userId]
    );

    const parentId = parentResult.rows[0]?.parent_id;

    if (parentId) {
      const directBonusAmount = price * 0.10;

      await client.query(
        `INSERT INTO bonuses
         (user_id, purchase_id, type, amount, status, available_at)
         VALUES ($1, $2, 'DIRECT', $3, 'PAID', now())`,
        [parentId, purchase.id, directBonusAmount]
      );
    }

    const upline = await getUpline(userId);

    const availableAt = new Date(Date.now() + 60 * 60 * 1000); // +1 hour

    for (const uplineUserId of upline) {
      const teamBonusAmount = price * 0.05;

      await client.query(
        `INSERT INTO bonuses
         (user_id, purchase_id, type, amount, status, available_at)
         VALUES ($1, $2, 'TEAM', $3, 'PENDING', $4)`,
        [uplineUserId, purchase.id, teamBonusAmount, availableAt]
      );
    }

    await client.query('COMMIT');

    res.json({
      purchase,
      message: 'Purchase successful, bonuses created'
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
