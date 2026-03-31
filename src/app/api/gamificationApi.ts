import type { Employee, LeaderboardEntry } from '../types';

export const SESSION_EMPLOYEE_ID_KEY = 'hotelEmployeeSessionId';

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch('/api/leaderboard');
  return parseJson<LeaderboardEntry[]>(res);
}

export async function fetchEmployee(id: string): Promise<Employee | null> {
  const res = await fetch(`/api/employee/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  return parseJson<Employee>(res);
}

export async function createEmployee(employee: Employee): Promise<void> {
  const res = await fetch('/api/employee', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  await parseJson(res);
}

export async function updateEmployee(employee: Employee): Promise<void> {
  const res = await fetch(`/api/employee/${encodeURIComponent(employee.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  await parseJson(res);
}

export async function deleteEmployeeRemote(id: string): Promise<void> {
  const res = await fetch(`/api/employee/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await parseJson(res);
}
