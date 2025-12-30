const db = require('../db');

async function getUpline(userId) {
  const upline = [];
  let currentId = userId;

  while (true) {
    const result = await db.query(
      'SELECT parent_id FROM users WHERE id = $1',
      [currentId]
    );

    const parentId = result.rows[0]?.parent_id;
    if (!parentId) break;

    upline.push(parentId);
    currentId = parentId;
  }

  return upline;
}

module.exports = { getUpline };
