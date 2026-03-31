async function getEmployee(pool, id_employee) {
  const { rows } = await pool.query(`SELECT * FROM employee_gamification WHERE id_employee = $1`, [
    String(id_employee),
  ]);
  const r = rows[0];
  if (!r) return null;

  const completed = r.completed_modules;
  const unlocked = r.unlocked_achievements;

  return {
    id: r.id_employee,
    name: r.name,
    totalPoints: Number(r.total_points),
    totalModulesCompleted: Number(r.total_modules_completed),
    level: r.level,
    completedModules: Array.isArray(completed) ? completed : [],
    unlockedAchievements: Array.isArray(unlocked) ? unlocked : [],
    fastestTime: r.fastest_time == null ? undefined : Number(r.fastest_time),
    perfectModules: Number(r.perfect_modules),
    perfectStreak: Number(r.perfect_streak),
    bestPerfectStreak: Number(r.best_perfect_streak),
    lastTrainingDate: r.last_training_date || undefined,
    dailyStreak: Number(r.daily_streak),
    avatar: r.avatar || undefined,
  };
}

async function upsertEmployee(pool, employee) {
  const completed = JSON.stringify(employee.completedModules ?? []);
  const unlocked = JSON.stringify(employee.unlockedAchievements ?? []);
  await pool.query(
    `INSERT INTO employee_gamification (
        id_employee, name, total_points, total_modules_completed, level,
        completed_modules, unlocked_achievements, fastest_time,
        perfect_modules, perfect_streak, best_perfect_streak,
        last_training_date, daily_streak, avatar, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,NOW()
      )
      ON CONFLICT (id_employee) DO UPDATE SET
        name = EXCLUDED.name,
        total_points = EXCLUDED.total_points,
        total_modules_completed = EXCLUDED.total_modules_completed,
        level = EXCLUDED.level,
        completed_modules = EXCLUDED.completed_modules,
        unlocked_achievements = EXCLUDED.unlocked_achievements,
        fastest_time = EXCLUDED.fastest_time,
        perfect_modules = EXCLUDED.perfect_modules,
        perfect_streak = EXCLUDED.perfect_streak,
        best_perfect_streak = EXCLUDED.best_perfect_streak,
        last_training_date = EXCLUDED.last_training_date,
        daily_streak = EXCLUDED.daily_streak,
        avatar = EXCLUDED.avatar,
        updated_at = NOW()`,
    [
      String(employee.id),
      String(employee.name || 'Сотрудник'),
      Number(employee.totalPoints ?? 0),
      Number(employee.totalModulesCompleted ?? 0),
      String(employee.level ?? 'novice'),
      completed,
      unlocked,
      employee.fastestTime == null ? null : Number(employee.fastestTime),
      Number(employee.perfectModules ?? 0),
      Number(employee.perfectStreak ?? 0),
      Number(employee.bestPerfectStreak ?? 0),
      employee.lastTrainingDate ?? null,
      Number(employee.dailyStreak ?? 0),
      employee.avatar ?? null,
    ],
  );
}

async function deleteEmployee(pool, id_employee) {
  await pool.query(`DELETE FROM employee_gamification WHERE id_employee = $1`, [String(id_employee)]);
}

async function hasEmployee(pool, id_employee) {
  const { rows } = await pool.query(
    `SELECT 1 AS ok FROM employee_gamification WHERE id_employee = $1`,
    [String(id_employee)],
  );
  return rows.length > 0;
}

async function getTotalPoints(pool, id_employee) {
  const { rows } = await pool.query(
    `SELECT total_points FROM employee_gamification WHERE id_employee = $1`,
    [String(id_employee)],
  );
  return Number(rows[0]?.total_points ?? 0);
}

async function getCurrentLevel(pool, totalPoints) {
  const { rows } = await pool.query(
    `SELECT id_level, level_name, min_points, max_points, discount_percent
     FROM gamification_levels
     WHERE $1 BETWEEN min_points AND max_points
     ORDER BY min_points
     LIMIT 1`,
    [Number(totalPoints)],
  );
  return rows[0] ?? null;
}

async function getNextLevel(pool, currentLevel) {
  if (!currentLevel) return null;
  const { rows } = await pool.query(
    `SELECT id_level, level_name, min_points, max_points, discount_percent
     FROM gamification_levels
     WHERE min_points > $1
     ORDER BY min_points
     LIMIT 1`,
    [Number(currentLevel.max_points)],
  );
  return rows[0] ?? currentLevel;
}

async function addPoints(pool, { id_employee, delta }) {
  const { rows } = await pool.query(
    `UPDATE employee_gamification
     SET total_points = total_points + $2, updated_at = NOW()
     WHERE id_employee = $1
     RETURNING total_points`,
    [String(id_employee), Number(delta)],
  );
  return Number(rows[0]?.total_points ?? 0);
}

async function getLeaderboard(pool) {
  const { rows } = await pool.query(
    `SELECT
       id_employee AS id,
       name,
       total_points AS "totalPoints",
       level,
       total_modules_completed AS "completedModules",
       perfect_modules AS "perfectModules",
       fastest_time AS "fastestTime"
     FROM employee_gamification
     ORDER BY total_points DESC, updated_at ASC
     LIMIT 10`,
  );
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    totalPoints: Number(r.totalPoints),
    level: r.level,
    completedModules: Number(r.completedModules),
    perfectModules: Number(r.perfectModules),
    fastestTime: r.fastestTime == null ? undefined : Number(r.fastestTime),
  }));
}

module.exports = {
  getEmployee,
  upsertEmployee,
  deleteEmployee,
  hasEmployee,
  getTotalPoints,
  getCurrentLevel,
  getNextLevel,
  addPoints,
  getLeaderboard,
};
