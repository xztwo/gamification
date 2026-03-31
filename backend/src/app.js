const express = require('express');
const { createPool } = require('./pgPool');
const repo = require('./repo/gamificationRepo');
const { getGamificationHandler } = require('./handlers/gamification');

function createApp(options = {}) {
  const app = express();
  app.use(express.json());

  const pool = options.pool || createPool();
  const handlers = {
    pool,
    repo: options.repo || repo,
  };

  app.get('/api/gamification', getGamificationHandler(handlers));

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const entries = await handlers.repo.getLeaderboard(handlers.pool);
      return res.json(entries);
    } catch {
      return res.status(500).json({ error: 'Ошибка получения лидерборда' });
    }
  });

  app.get('/api/employee/:id', async (req, res) => {
    try {
      const employee = await handlers.repo.getEmployee(handlers.pool, req.params.id);
      if (!employee) return res.status(404).json({ error: 'Сотрудник не найден' });
      return res.json(employee);
    } catch {
      return res.status(500).json({ error: 'Ошибка загрузки сотрудника' });
    }
  });

  app.put('/api/employee/:id', async (req, res) => {
    try {
      const body = req.body || {};
      if (String(body.id) !== String(req.params.id)) {
        return res.status(400).json({ error: 'id в URL и в теле должны совпадать' });
      }
      await handlers.repo.upsertEmployee(handlers.pool, body);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Ошибка сохранения сотрудника' });
    }
  });

  app.post('/api/employee', async (req, res) => {
    try {
      const body = req.body || {};
      if (!body.id) return res.status(400).json({ error: 'id обязателен' });
      await handlers.repo.upsertEmployee(handlers.pool, body);
      return res.status(201).json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Ошибка создания сотрудника' });
    }
  });

  app.delete('/api/employee/:id', async (req, res) => {
    try {
      await handlers.repo.deleteEmployee(handlers.pool, req.params.id);
      return res.json({ ok: true });
    } catch {
      return res.status(500).json({ error: 'Ошибка удаления сотрудника' });
    }
  });

  return app;
}

module.exports = { createApp };
