require('dotenv').config();
const db = require('../db');

async function runBonusWorker() {
  console.log('Bonus worker running...');

  try {
    const result = await db.query(
      `SELECT id
       FROM bonuses
       WHERE status = 'PENDING'
       AND available_at <= now()`
    );

    if (result.rowCount === 0) {
      console.log('No bonuses to pay');
      return;
    }

    for (const row of result.rows) {
      await db.query(
        `UPDATE bonuses
         SET status = 'PAID'
         WHERE id = $1`,
        [row.id]
      );

      console.log(`Paid bonus ${row.id}`);
    }
  } catch (err) {
    console.error('Bonus worker error:', err);
  }
}

setInterval(runBonusWorker, 60 * 1000);

runBonusWorker();
