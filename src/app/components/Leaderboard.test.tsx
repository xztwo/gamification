import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Leaderboard } from './Leaderboard';
import type { LeaderboardEntry } from '../types';

function mockFetchLeaderboard(rows: LeaderboardEntry[]) {
  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/api/leaderboard')) {
      return {
        ok: true,
        text: async () => JSON.stringify(rows),
        json: async () => rows,
      } as Response;
    }
    return { ok: false, status: 404, text: async () => '' } as Response;
  }) as typeof fetch;
}

describe('Leaderboard integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('показывает пустое состояние без данных', async () => {
    mockFetchLeaderboard([]);
    render(<Leaderboard />);
    await waitFor(() => {
      expect(screen.getByText('Таблица лидеров пока пуста')).toBeInTheDocument();
    });
  });

  it('отображает данные с API и помечает текущего пользователя', async () => {
    const rows: LeaderboardEntry[] = [
      {
        id: 'u1',
        name: 'Иван',
        totalPoints: 450,
        level: 'student',
        completedModules: 2,
        perfectModules: 1,
        fastestTime: 95,
      },
      {
        id: 'u2',
        name: 'Мария',
        totalPoints: 900,
        level: 'expert',
        completedModules: 2,
        perfectModules: 1,
      },
    ];
    mockFetchLeaderboard(rows);
    render(<Leaderboard currentEmployeeId="u1" refreshKey={1} />);

    await waitFor(() => {
      expect(screen.getByText('Мария')).toBeInTheDocument();
      expect(screen.getByText('Иван')).toBeInTheDocument();
      expect(screen.getByText('Вы')).toBeInTheDocument();
      expect(screen.getByText('1:35')).toBeInTheDocument();
    });
  });
});
