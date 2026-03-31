const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../../src/app');
const { createPool } = require('../../src/pgPool');
const repo = require('../../src/repo/gamificationRepo');

describe('GET /api/gamification (integration)', () => {
  const pool = createPool();
  const app = createApp({ pool, repo });

  async function runSqlFile(fileName) {
    const filePath = path.join(__dirname, '..', '..', 'sql', fileName);
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
  }

  beforeAll(async () => {
    await runSqlFile('schema.sql');
    await runSqlFile('seed.sql');
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE TABLE employee_gamification');
  });

  afterAll(async () => {
    await pool.end();
  });

  test('returns 400 on missing ID_clients', async () => {
    const response = await request(app).get('/api/gamification');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID_clients обязателен' });
  });

  test('returns gamification data for known employee', async () => {
    await pool.query(`INSERT INTO employee_gamification (id_employee, name, total_points) VALUES ($1, $2, $3)`, [
      '7',
      'Иван',
      450,
    ]);

    const response = await request(app).get('/api/gamification?ID_clients=7');

    expect(response.status).toBe(200);
    expect(response.body.total_points).toBe(450);
    expect(response.body.current_level.level_name).toBe('3');
    expect(response.body.next_level.level_name).toBe('4');
  });

  test('returns null levels for unknown employee (no profile yet)', async () => {
    const response = await request(app).get('/api/gamification?ID_clients=9999');

    expect(response.status).toBe(200);
    expect(response.body.total_points).toBe(0);
    expect(response.body.current_level).toBeNull();
    expect(response.body.next_level).toBeNull();
  });
});

