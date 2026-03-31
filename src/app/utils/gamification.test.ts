import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  calculateLevel,
  getProgressToNextLevel,
  calculateModuleReward,
  initializeEmployee,
  checkNewAchievements,
} from './gamification';
import { Employee } from '../types';

function createEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    ...initializeEmployee(),
    id: 'employee-1',
    name: 'Тестовый сотрудник',
    ...overrides,
  };
}

describe('gamification utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('корректно определяет уровни по порогам баллов', () => {
    expect(calculateLevel(0)).toBe('novice');
    expect(calculateLevel(100)).toBe('student');
    expect(calculateLevel(300)).toBe('specialist');
    expect(calculateLevel(600)).toBe('expert');
    expect(calculateLevel(1000)).toBe('master');
  });

  it('считает прогресс до следующего уровня и ограничивает до 100%', () => {
    expect(getProgressToNextLevel(50)).toBe(50);
    expect(getProgressToNextLevel(850)).toBe(62.5);
    expect(getProgressToNextLevel(3000)).toBe(100);
  });

  it('считает вознаграждение с бонусами качества, скорости и серии', () => {
    const reward = calculateModuleReward({
      basePoints: 100,
      isPerfect: true,
      timeSpent: 50,
      timeLimit: 120,
      perfectStreak: 5,
      dailyStreak: 4,
    });

    expect(reward).toEqual({
      basePoints: 100,
      qualityBonus: 20,
      speedBonus: 15,
      comboBonus: 25,
      streakBonus: 10,
      total: 170,
    });
  });

  it('находит новые достижения сотрудника', () => {
    const employee = createEmployee({
      totalModulesCompleted: 3,
      completedModules: ['m1', 'm2', 'm3', 'm4', 'm5'],
      perfectModules: 1,
      totalPoints: 350,
      level: 'specialist',
      bestPerfectStreak: 3,
      dailyStreak: 3,
      unlockedAchievements: ['first-steps'],
    });

    const unlocked = checkNewAchievements(employee);
    expect(unlocked).toContain('fast-learner');
    expect(unlocked).toContain('point-collector');
    expect(unlocked).toContain('specialist-rank');
    expect(unlocked).toContain('daily-rhythm');
    expect(unlocked).not.toContain('first-steps');
  });
});
