const fs = require('fs');
const path = require('path');
const { createPool } = require('../src/pgPool');

async function main() {
  const pool = createPool();
  for (const file of ['schema.sql', 'seed.sql']) {
    const fullPath = path.join(__dirname, '..', 'sql', file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    await pool.query(sql);
    console.log(`OK: ${file}`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
