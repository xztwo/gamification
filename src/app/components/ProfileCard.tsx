import { Employee } from '../types';
import { LevelBadge } from './LevelBadge';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';
import { User, TrendingUp, Target, Zap } from 'lucide-react';
import {
  getProgressToNextLevel,
  getNextLevelThreshold,
  LEVEL_NAMES,
  formatTime,
} from '../utils/gamification';

interface ProfileCardProps {
  employee: Employee;
}

const COPY = {
  employee: '\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a',
  currentResult: '\u0422\u0435\u043a\u0443\u0449\u0438\u0439 \u0440\u0435\u0437\u0443\u043b\u044c\u0442\u0430\u0442',
  collectedPoints: '\u043d\u0430\u043a\u043e\u043f\u043b\u0435\u043d\u043d\u044b\u0445 \u0431\u0430\u043b\u043b\u043e\u0432',
  level: '\u0423\u0440\u043e\u0432\u0435\u043d\u044c',
  nextLevelProgress: '\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0434\u043e \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0435\u0433\u043e \u0443\u0440\u043e\u0432\u043d\u044f',
  maxLevelReached: '\u041c\u0430\u043a\u0441\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u0434\u043e\u0441\u0442\u0438\u0433\u043d\u0443\u0442',
  reachedTitle: '\u0412\u044b \u0434\u043e\u0441\u0442\u0438\u0433\u043b\u0438 \u0437\u0432\u0430\u043d\u0438\u044f',
  uniqueModules: '\u0423\u043d\u0438\u043a\u0430\u043b\u044c\u043d\u044b\u0445 \u043c\u043e\u0434\u0443\u043b\u0435\u0439',
  totalRuns: '\u0412\u0441\u0435\u0433\u043e \u043f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0439',
  perfectRuns: '\u0411\u0435\u0437 \u043e\u0448\u0438\u0431\u043e\u043a',
  bestTime: '\u041b\u0443\u0447\u0448\u0435\u0435 \u0432\u0440\u0435\u043c\u044f',
};

export function ProfileCard({ employee }: ProfileCardProps) {
  const progress = getProgressToNextLevel(employee.totalPoints);
  const nextThreshold = getNextLevelThreshold(employee.level);

  return (
    <Card className="border-none bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
      <CardContent className="p-7">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-white/20 p-4">
            <User size={52} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="mb-1 text-base text-white/80">{COPY.employee}</p>
            <h2 className="mb-3 text-3xl font-bold leading-tight">{employee.name}</h2>
            <LevelBadge level={employee.level} size="lg" />
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white/14 p-5 shadow-inner">
          <div className="mb-2 text-base font-semibold text-white/85">{COPY.currentResult}</div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-5xl font-extrabold tracking-tight">{employee.totalPoints}</p>
              <p className="mt-2 text-lg text-white/80">{COPY.collectedPoints}</p>
            </div>
            <div className="rounded-xl bg-white/12 px-4 py-3 text-right">
              <p className="text-sm uppercase tracking-[0.2em] text-white/70">{COPY.level}</p>
              <p className="mt-1 text-2xl font-bold">{LEVEL_NAMES[employee.level]}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {nextThreshold !== null && (
            <div>
              <div className="mb-3 flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <TrendingUp size={18} />
                  <span>{COPY.nextLevelProgress}</span>
                </div>
                <span className="font-medium">
                  {employee.totalPoints} / {nextThreshold}
                </span>
              </div>
              <Progress value={progress} className="h-4 bg-white/20" />
            </div>
          )}

          {nextThreshold === null && (
            <div className="rounded-lg bg-white/10 py-4 text-center">
              <p className="text-xl font-semibold">{COPY.maxLevelReached}</p>
              <p className="mt-1 text-base text-white/80">
                {COPY.reachedTitle} {LEVEL_NAMES[employee.level]}
              </p>
            </div>
          )}

          <div className="border-t border-white/20 pt-5">
            <div className="mb-4 flex items-center justify-between text-base">
              <span>{COPY.uniqueModules}</span>
              <span className="text-xl font-bold">{employee.completedModules.length}</span>
            </div>
            <div className="mb-4 flex items-center justify-between text-base">
              <span>{COPY.totalRuns}</span>
              <span className="text-xl font-bold">{employee.totalModulesCompleted}</span>
            </div>
            <div className="mb-4 flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Target size={18} />
                <span>{COPY.perfectRuns}</span>
              </div>
              <span className="text-xl font-bold">{employee.perfectModules}</span>
            </div>
            {employee.fastestTime && (
              <div className="flex items-center justify-between text-base">
                <div className="flex items-center gap-2">
                  <Zap size={18} />
                  <span>{COPY.bestTime}</span>
                </div>
                <span className="text-xl font-bold">{formatTime(employee.fastestTime)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
