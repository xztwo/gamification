DROP TABLE IF EXISTS employee_gamification;
DROP TABLE IF EXISTS gamification_levels;

CREATE TABLE gamification_levels (
  id_level SERIAL PRIMARY KEY,
  level_name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE employee_gamification (
  id_employee TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  total_points INTEGER NOT NULL DEFAULT 0,
  total_modules_completed INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'novice',
  completed_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  unlocked_achievements JSONB NOT NULL DEFAULT '[]'::jsonb,
  fastest_time INTEGER,
  perfect_modules INTEGER NOT NULL DEFAULT 0,
  perfect_streak INTEGER NOT NULL DEFAULT 0,
  best_perfect_streak INTEGER NOT NULL DEFAULT 0,
  last_training_date TEXT,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  avatar TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
