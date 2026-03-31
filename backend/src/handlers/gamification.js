function getGamificationHandler({ pool, repo }) {
  return async (req, res) => {
    try {
      const clientId = req.query.ID_clients;
      if (!clientId) {
        return res.status(400).json({ error: 'ID_clients обязателен' });
      }

      const exists = await repo.hasEmployee(pool, clientId);
      if (!exists) {
        return res.json({
          total_points: 0,
          current_level: null,
          next_level: null,
        });
      }

      const totalPoints = await repo.getTotalPoints(pool, clientId);
      const currentLevel = await repo.getCurrentLevel(pool, totalPoints);
      const nextLevel = await repo.getNextLevel(pool, currentLevel);

      return res.json({
        total_points: totalPoints,
        current_level: currentLevel,
        next_level: nextLevel,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Ошибка получения геймификации' });
    }
  };
}

module.exports = { getGamificationHandler };

