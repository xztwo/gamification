const LEVELS = [
  { id_level: 1, level_name: '1', min_points: 0, max_points: 199, discount_percent: 0 },
  { id_level: 2, level_name: '2', min_points: 200, max_points: 399, discount_percent: 3 },
  { id_level: 3, level_name: '3', min_points: 400, max_points: 599, discount_percent: 5 },
  { id_level: 4, level_name: '4', min_points: 600, max_points: 799, discount_percent: 8.5 },
  { id_level: 5, level_name: '5', min_points: 800, max_points: 999999, discount_percent: 12 },
];

const CLIENT_POINTS = new Map([
  ['7', 450],
  ['10', 250],
  ['42', 999],
]);

function getPointsByClientId(clientId) {
  return CLIENT_POINTS.get(String(clientId)) ?? 0;
}

function getLevelByPoints(points) {
  return LEVELS.find((level) => points >= level.min_points && points <= level.max_points) ?? null;
}

function getNextLevel(currentLevel) {
  if (!currentLevel) return null;
  const next = LEVELS.find((level) => level.min_points > currentLevel.max_points);
  return next ?? currentLevel;
}

module.exports = {
  getPointsByClientId,
  getLevelByPoints,
  getNextLevel,
};

