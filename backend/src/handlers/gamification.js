function getGamificationHandler(repo) {
  return async (req, res) => {
    try {
      const clientId = req.query.ID_clients;
      if (!clientId) {
        return res.status(400).json({ error: 'ID_clients обязателен' });
      }

      const totalPoints = repo.getPointsByClientId(clientId);
      const currentLevel = repo.getLevelByPoints(totalPoints);
      const nextLevel = repo.getNextLevel(currentLevel);

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

