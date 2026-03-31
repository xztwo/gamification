const request = require('supertest');
const { createApp } = require('../../src/app');

describe('GET /api/gamification (integration)', () => {
  test('returns 400 on missing ID_clients', async () => {
    const app = createApp();

    const response = await request(app).get('/api/gamification');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'ID_clients обязателен' });
  });

  test('returns gamification data for known client', async () => {
    const app = createApp();

    const response = await request(app).get('/api/gamification?ID_clients=7');

    expect(response.status).toBe(200);
    expect(response.body.total_points).toBe(450);
    expect(response.body.current_level.level_name).toBe('3');
    expect(response.body.next_level.level_name).toBe('4');
  });

  test('returns default and first level for unknown client', async () => {
    const app = createApp();

    const response = await request(app).get('/api/gamification?ID_clients=9999');

    expect(response.status).toBe(200);
    expect(response.body.total_points).toBe(0);
    expect(response.body.current_level.level_name).toBe('1');
    expect(response.body.next_level.level_name).toBe('2');
  });
});

