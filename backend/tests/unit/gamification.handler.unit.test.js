const { getGamificationHandler } = require('../../src/handlers/gamification');

function createRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('GET /api/gamification handler (unit)', () => {
  test('returns 400 when ID_clients is missing', async () => {
    const repo = {
      hasEmployee: jest.fn(),
      getTotalPoints: jest.fn(),
      getCurrentLevel: jest.fn(),
      getNextLevel: jest.fn(),
    };
    const handler = getGamificationHandler({ pool: {}, repo });
    const req = { query: {} };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID_clients обязателен' });
    expect(repo.getTotalPoints).not.toHaveBeenCalled();
    expect(repo.hasEmployee).not.toHaveBeenCalled();
  });

  test('returns gamification payload when repo returns data', async () => {
    const current = { id_level: 2, level_name: '2', min_points: 200, max_points: 399, discount_percent: 3 };
    const next = { id_level: 3, level_name: '3', min_points: 400, max_points: 599, discount_percent: 5 };
    const repo = {
      hasEmployee: jest.fn().mockResolvedValue(true),
      getTotalPoints: jest.fn().mockResolvedValue(250),
      getCurrentLevel: jest.fn().mockResolvedValue(current),
      getNextLevel: jest.fn().mockResolvedValue(next),
    };
    const handler = getGamificationHandler({ pool: {}, repo });
    const req = { query: { ID_clients: '10' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      total_points: 250,
      current_level: current,
      next_level: next,
    });
  });

  test('returns 500 when repository throws', async () => {
    const repo = {
      hasEmployee: jest.fn().mockResolvedValue(true),
      getTotalPoints: jest.fn(() => {
        throw new Error('db down');
      }),
      getCurrentLevel: jest.fn(),
      getNextLevel: jest.fn(),
    };
    const handler = getGamificationHandler({ pool: {}, repo });
    const req = { query: { ID_clients: '7' } };
    const res = createRes();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Ошибка получения геймификации' });
  });
});

