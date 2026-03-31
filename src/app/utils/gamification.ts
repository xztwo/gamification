import { EmployeeLevel, Employee } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';

export const LEVEL_THRESHOLDS = {
  novice: 0,
  student: 100,
  specialist: 300,
  expert: 600,
  master: 1000,
};

export const LEVEL_NAMES: Record<EmployeeLevel, string> = {
  novice: 'Новичок',
  student: 'Ученик',
  specialist: 'Специалист',
  expert: 'Эксперт',
  master: 'Мастер',
};

export const LEVEL_COLORS: Record<EmployeeLevel, string> = {
  novice: 'bg-slate-400',
  student: 'bg-blue-400',
  specialist: 'bg-blue-500',
  expert: 'bg-blue-600',
  master: 'bg-gradient-to-r from-blue-600 to-indigo-600',
};

export interface RewardBreakdown {
  basePoints: number;
  qualityBonus: number;
  speedBonus: number;
  comboBonus: number;
  streakBonus: number;
  total: number;
}

export function calculateLevel(points: number): EmployeeLevel {
  if (points >= LEVEL_THRESHOLDS.master) return 'master';
  if (points >= LEVEL_THRESHOLDS.expert) return 'expert';
  if (points >= LEVEL_THRESHOLDS.specialist) return 'specialist';
  if (points >= LEVEL_THRESHOLDS.student) return 'student';
  return 'novice';
}

export function getNextLevelThreshold(currentLevel: EmployeeLevel): number | null {
  const levels: EmployeeLevel[] = ['novice', 'student', 'specialist', 'expert', 'master'];
  const currentIndex = levels.indexOf(currentLevel);

  if (currentIndex === levels.length - 1) return null;

  const nextLevel = levels[currentIndex + 1];
  return LEVEL_THRESHOLDS[nextLevel];
}

export function getProgressToNextLevel(points: number): number {
  const currentLevel = calculateLevel(points);
  const nextThreshold = getNextLevelThreshold(currentLevel);

  if (nextThreshold === null) return 100;

  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return Math.min(Math.max(progress, 0), 100);
}

function getLocalISODate(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDayDiff(fromISO: string, toISO: string): number {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

export function initializeEmployee(): Employee {
  return {
    id: Date.now().toString(),
    name: 'Сотрудник',
    totalPoints: 0,
    totalModulesCompleted: 0,
    level: 'novice',
    completedModules: [],
    unlockedAchievements: [],
    perfectModules: 0,
    perfectStreak: 0,
    bestPerfectStreak: 0,
    dailyStreak: 0,
  };
}

export function updateDailyStreak(
  currentStreak: number,
  lastTrainingDate?: string,
): { nextStreak: number; currentDate: string } {
  const currentDate = getLocalISODate();

  if (!lastTrainingDate) {
    return { nextStreak: 1, currentDate };
  }

  const diff = calculateDayDiff(lastTrainingDate, currentDate);
  if (diff <= 0) return { nextStreak: Math.max(currentStreak, 1), currentDate };
  if (diff === 1) {
    return { nextStreak: currentStreak + 1, currentDate };
  }

  return { nextStreak: 1, currentDate };
}

export function calculateModuleReward(params: {
  basePoints: number;
  isPerfect: boolean;
  timeSpent: number;
  timeLimit?: number;
  perfectStreak: number;
  dailyStreak: number;
}): RewardBreakdown {
  const { basePoints, isPerfect, timeSpent, timeLimit, perfectStreak, dailyStreak } = params;

  const qualityBonus = isPerfect ? Math.round(basePoints * 0.2) : 0;

  let speedBonus = 0;
  if (timeLimit && timeSpent <= Math.floor(timeLimit * 0.6)) {
    speedBonus = Math.round(basePoints * 0.15);
  } else if (timeSpent <= 180) {
    speedBonus = Math.round(basePoints * 0.1);
  }

  const comboMultiplier = Math.min(perfectStreak * 0.05, 0.25);
  const comboBonus = isPerfect ? Math.round(basePoints * comboMultiplier) : 0;

  const streakBonus = dailyStreak >= 3 ? Math.round(basePoints * 0.1) : 0;

  const total = basePoints + qualityBonus + speedBonus + comboBonus + streakBonus;
  return {
    basePoints,
    qualityBonus,
    speedBonus,
    comboBonus,
    streakBonus,
    total,
  };
}

export function checkNewAchievements(employee: Employee): string[] {
  const newAchievements: string[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    if (!employee.unlockedAchievements.includes(achievement.id) && achievement.condition(employee)) {
      newAchievements.push(achievement.id);
    }
  });

  return newAchievements;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
