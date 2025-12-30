const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, parentId } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email required' });
  }

  if (parentId) {
    const parent = await db.query(
      'SELECT id FROM users WHERE id = $1',
      [parentId]
    );
    if (parent.rowCount === 0) {
      return res.status(400).json({ error: 'parent not found' });
    }
  }

  const result = await db.query(
    'INSERT INTO users (email, parent_id) VALUES ($1, $2) RETURNING *',
    [email, parentId || null]
  );

  res.json(result.rows[0]);
});

module.exports = router;
