import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';
import { saveToLeaderboard, initializeEmployee } from '../utils/gamification';

function addEntry(name: string, id: string, totalPoints: number, fastestTime?: number) {
  const employee = initializeEmployee();
  employee.id = id;
  employee.name = name;
  employee.totalPoints = totalPoints;
  employee.level = totalPoints >= 1000 ? 'master' : totalPoints >= 600 ? 'expert' : 'student';
  employee.completedModules = ['module-1', 'module-2'];
  employee.totalModulesCompleted = 2;
  employee.perfectModules = 1;
  employee.fastestTime = fastestTime;
  saveToLeaderboard(employee);
}

describe('Leaderboard integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('показывает пустое состояние без данных', () => {
    render(<Leaderboard />);
    expect(screen.getByText('Таблица лидеров пока пуста')).toBeInTheDocument();
  });

  it('отображает данные из localStorage и помечает текущего пользователя', () => {
    addEntry('Иван', 'u1', 450, 95);
    addEntry('Мария', 'u2', 900);

    render(<Leaderboard currentEmployeeId="u1" />);

    expect(screen.getByText('Мария')).toBeInTheDocument();
    expect(screen.getByText('Иван')).toBeInTheDocument();
    expect(screen.getByText('Вы')).toBeInTheDocument();
    expect(screen.getByText('1:35')).toBeInTheDocument();
  });
});

