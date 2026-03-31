export type EmployeeLevel = 'novice' | 'student' | 'specialist' | 'expert' | 'master';

export interface Employee {
  id: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  totalModulesCompleted: number;
  level: EmployeeLevel;
  completedModules: string[];
  unlockedAchievements: string[];
  fastestTime?: number;
  perfectModules: number;
  perfectStreak: number;
  bestPerfectStreak: number;
  lastTrainingDate?: string;
  dailyStreak: number;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tasks: Task[];
  completed: boolean;
  timeLimit?: number;
  unlockRequirement?: string;
}

export interface TaskValidation {
  mode: 'exact' | 'regex' | 'non-empty' | 'date-dd-mm-yyyy';
  pattern?: string;
  errorMessage?: string;
}

export interface Task {
  id: string;
  type: 'input' | 'select' | 'checkbox' | 'date';
  question: string;
  correctAnswer: string | string[];
  options?: string[];
  hint?: string;
  validation?: TaskValidation;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (employee: Employee) => boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  level: EmployeeLevel;
  completedModules: number;
  perfectModules: number;
  fastestTime?: number;
}
