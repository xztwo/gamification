import { useMemo, useState, useEffect } from 'react';
import { Employee, TrainingModule } from '../types';
import { ProfileCard } from './ProfileCard';
import { ModuleCard } from './ModuleCard';
import { Trainer } from './Trainer';
import { Leaderboard } from './Leaderboard';
import { AchievementCard } from './AchievementCard';
import { TRAINING_MODULES } from '../data/modules';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  calculateLevel,
  saveEmployeeData,
  loadEmployeeData,
  initializeEmployee,
  checkNewAchievements,
  saveToLeaderboard,
  calculateModuleReward,
  RewardBreakdown,
  updateDailyStreak,
} from '../utils/gamification';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { GraduationCap, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface LastReward extends RewardBreakdown {
  moduleTitle: string;
  wasPerfect: boolean;
}

const COPY = {
  unlockEasy: '\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 2 \u043b\u0451\u0433\u043a\u0438\u0445 \u043c\u043e\u0434\u0443\u043b\u044f',
  unlockMedium: '\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 2 \u0441\u0440\u0435\u0434\u043d\u0438\u0445 \u043c\u043e\u0434\u0443\u043b\u044f',
  defaultName: '\u0421\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a',
  welcome: '\u0414\u043e\u0431\u0440\u043e \u043f\u043e\u0436\u0430\u043b\u043e\u0432\u0430\u0442\u044c',
  timeOver: '\u0412\u0440\u0435\u043c\u044f \u0432\u044b\u0448\u043b\u043e',
  retryModule: '\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u0440\u043e\u0439\u0442\u0438 \u043c\u043e\u0434\u0443\u043b\u044c \u0435\u0449\u0451 \u0440\u0430\u0437.',
  achievementUnlocked: '\u041d\u043e\u0432\u043e\u0435 \u0434\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u0435 \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u043e!',
  moduleCompleted: '\u041c\u043e\u0434\u0443\u043b\u044c \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043d',
  rewardBreakdown:
    '\u0411\u0430\u0437\u0430 {base}, \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e +{quality}, \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c +{speed}, \u0441\u0435\u0440\u0438\u044f +{combo}, \u0440\u0438\u0442\u043c +{streak}',
  confirmReset: '\u0412\u044b \u0443\u0432\u0435\u0440\u0435\u043d\u044b, \u0447\u0442\u043e \u0445\u043e\u0442\u0438\u0442\u0435 \u0441\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0432\u0435\u0441\u044c \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441?',
  progressReset: '\u041f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0441\u0431\u0440\u043e\u0448\u0435\u043d',
  appTitle: '\u041f\u043e\u0434\u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0433\u0435\u0439\u043c\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438',
  appSubtitle: '\u0422\u0440\u0435\u043d\u0430\u0436\u0451\u0440 \u0440\u0430\u0431\u043e\u0442\u044b \u0441 \u0440\u0430\u0437\u043c\u0435\u0449\u0435\u043d\u0438\u0435\u043c \u0438 \u043f\u0440\u043e\u0436\u0438\u0432\u0430\u043d\u0438\u0435\u043c \u0433\u043e\u0441\u0442\u0435\u0439',
  welcomeDescription:
    '\u041f\u0440\u043e\u0445\u043e\u0434\u0438\u0442\u0435 \u0438\u0433\u0440\u043e\u0432\u044b\u0435 \u0441\u043c\u0435\u043d\u044b, \u0437\u0430\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0439\u0442\u0435 \u0431\u0430\u043b\u043b\u044b, \u0441\u043e\u0431\u0438\u0440\u0430\u0439\u0442\u0435 \u0441\u0435\u0440\u0438\u0438 \u0438 \u043e\u0442\u043a\u0440\u044b\u0432\u0430\u0439\u0442\u0435 \u043d\u043e\u0432\u044b\u0435 \u0440\u043e\u043b\u0438 \u0432 \u0441\u0438\u0441\u0442\u0435\u043c\u0435 \u043e\u0442\u0435\u043b\u044f.',
  loginLabel: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043b\u043e\u0433\u0438\u043d',
  loginPlaceholder: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043b\u043e\u0433\u0438\u043d...',
  passwordLabel: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u0430\u0440\u043e\u043b\u044c',
  passwordPlaceholder: '\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u0430\u0440\u043e\u043b\u044c...',
  startLearning: '\u041d\u0430\u0447\u0430\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u0435',
  dashboardTitle: '\u0418\u0433\u0440\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0441\u0438\u0441\u0442\u0435\u043c\u0430 \u0434\u043b\u044f \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432 \u043e\u0442\u0435\u043b\u044f',
  dashboardSubtitle:
    '\u0412\u044b\u043f\u043e\u043b\u043d\u044f\u0439\u0442\u0435 \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043c\u043e\u0434\u0443\u043b\u0438, \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441 \u0438 \u043d\u0430\u043a\u0430\u043f\u043b\u0438\u0432\u0430\u0439\u0442\u0435 \u0431\u0430\u043b\u043b\u044b \u0437\u0430 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e\u0435 \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u0435.',
  resetProgress: '\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043f\u0440\u043e\u0433\u0440\u0435\u0441\u0441',
  keyMetrics: '\u041a\u043b\u044e\u0447\u0435\u0432\u044b\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438',
  keyMetricsSubtitle: '\u0421\u0430\u043c\u044b\u0435 \u0432\u0430\u0436\u043d\u044b\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0432\u044b\u043d\u0435\u0441\u0435\u043d\u044b \u0432 \u043e\u0442\u0434\u0435\u043b\u044c\u043d\u044b\u0439 \u0431\u043b\u043e\u043a \u0434\u043b\u044f \u0431\u044b\u0441\u0442\u0440\u043e\u0433\u043e \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430.',
  totalRuns: '\u0412\u0441\u0435\u0433\u043e \u043f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0439',
  totalPoints: '\u041d\u0430\u043a\u043e\u043f\u043b\u0435\u043d\u043e \u0431\u0430\u043b\u043b\u043e\u0432',
  perfectStreak: '\u0421\u0435\u0440\u0438\u044f \u0431\u0435\u0437 \u043e\u0448\u0438\u0431\u043e\u043a',
  dailyStreak: '\u0414\u043d\u0435\u0439 \u043f\u043e\u0434\u0440\u044f\u0434',
  lastReward: '\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u044f\u044f \u043d\u0430\u0433\u0440\u0430\u0434\u0430:',
  total: '\u0418\u0442\u043e\u0433\u043e',
  pointsWord: '\u0431\u0430\u043b\u043b\u043e\u0432',
  idealRun: '\u0438\u0434\u0435\u0430\u043b\u044c\u043d\u043e\u0435 \u043f\u0440\u043e\u0445\u043e\u0436\u0434\u0435\u043d\u0438\u0435',
  base: '\u0411\u0430\u0437\u0430',
  quality: '\u041a\u0430\u0447\u0435\u0441\u0442\u0432\u043e',
  speed: '\u0421\u043a\u043e\u0440\u043e\u0441\u0442\u044c',
  combo: '\u0421\u0435\u0440\u0438\u044f',
  rhythm: '\u0420\u0438\u0442\u043c',
  modulesTitle: '\u0418\u0433\u0440\u043e\u0432\u044b\u0435 \u043c\u043e\u0434\u0443\u043b\u0438',
  modulesSubtitle: '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0441\u0446\u0435\u043d\u0430\u0440\u0438\u0439 \u0438 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0438\u0442\u0435 \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u0435.',
  leaderboard: '\u041b\u0438\u0434\u0435\u0440\u0431\u043e\u0440\u0434',
  achievements: '\u0414\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u044f',
};

function getModuleLockReason(module: TrainingModule, employee: Employee): string | null {
  if (employee.completedModules.includes(module.id)) return null;

  const completed = new Set(employee.completedModules);
  const easyDone = TRAINING_MODULES.filter((m) => m.difficulty === 'easy' && completed.has(m.id)).length;
  const mediumDone = TRAINING_MODULES.filter((m) => m.difficulty === 'medium' && completed.has(m.id)).length;

  if (module.difficulty === 'medium' && easyDone < 2) return COPY.unlockEasy;
  if (module.difficulty === 'hard' && mediumDone < 2) return COPY.unlockMedium;
  return null;
}

function formatRewardDescription(reward: RewardBreakdown) {
  return COPY.rewardBreakdown
    .replace('{base}', String(reward.basePoints))
    .replace('{quality}', String(reward.qualityBonus))
    .replace('{speed}', String(reward.speedBonus))
    .replace('{combo}', String(reward.comboBonus))
    .replace('{streak}', String(reward.streakBonus));
}

export function Dashboard() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [lastReward, setLastReward] = useState<LastReward | null>(null);

  useEffect(() => {
    const savedEmployee = loadEmployeeData();
    if (savedEmployee) setEmployee(savedEmployee);
    else setShowWelcome(true);
  }, []);

  const handleStartTraining = (name: string) => {
    const newEmployee = initializeEmployee();
    newEmployee.name = name || COPY.defaultName;
    setEmployee(newEmployee);
    saveEmployeeData(newEmployee);
    setShowWelcome(false);
    toast.success(`${COPY.welcome}, ${newEmployee.name}!`);
  };

  const handleModuleComplete = (
    module: TrainingModule,
    basePoints: number,
    timeSpent: number,
    mistakeCount: number,
  ) => {
    if (!employee) return;

    if (basePoints === 0) {
      const failedAttempt: Employee = {
        ...employee,
        perfectStreak: 0,
      };
      setEmployee(failedAttempt);
      saveEmployeeData(failedAttempt);
      setActiveModule(null);
      toast.error(COPY.timeOver, { description: COPY.retryModule });
      return;
    }

    const isPerfect = mistakeCount === 0;
    const nextPerfectStreak = isPerfect ? employee.perfectStreak + 1 : 0;
    const nextBestPerfectStreak = Math.max(employee.bestPerfectStreak, nextPerfectStreak);
    const { nextStreak, currentDate } = updateDailyStreak(employee.dailyStreak, employee.lastTrainingDate);

    const reward = calculateModuleReward({
      basePoints,
      isPerfect,
      timeSpent,
      timeLimit: module.timeLimit,
      perfectStreak: nextPerfectStreak,
      dailyStreak: nextStreak,
    });

    const completedModules = employee.completedModules.includes(module.id)
      ? employee.completedModules
      : [...employee.completedModules, module.id];

    const updatedEmployee: Employee = {
      ...employee,
      totalPoints: employee.totalPoints + reward.total,
      totalModulesCompleted: employee.totalModulesCompleted + 1,
      completedModules,
      perfectModules: isPerfect ? employee.perfectModules + 1 : employee.perfectModules,
      perfectStreak: nextPerfectStreak,
      bestPerfectStreak: nextBestPerfectStreak,
      dailyStreak: nextStreak,
      lastTrainingDate: currentDate,
      fastestTime: !employee.fastestTime || timeSpent < employee.fastestTime ? timeSpent : employee.fastestTime,
    };

    updatedEmployee.level = calculateLevel(updatedEmployee.totalPoints);

    const newAchievements = checkNewAchievements(updatedEmployee);
    if (newAchievements.length > 0) {
      updatedEmployee.unlockedAchievements = [...updatedEmployee.unlockedAchievements, ...newAchievements];
      newAchievements.forEach((achievementId) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (achievement) {
          toast.success(COPY.achievementUnlocked, { description: achievement.title });
        }
      });
    }

    setEmployee(updatedEmployee);
    saveEmployeeData(updatedEmployee);
    saveToLeaderboard(updatedEmployee);
    setActiveModule(null);
    setLastReward({ ...reward, moduleTitle: module.title, wasPerfect: isPerfect });

    toast.success(`${COPY.moduleCompleted}: +${reward.total} ${COPY.pointsWord}`, {
      description: formatRewardDescription(reward),
    });
  };

  const handleReset = () => {
    if (confirm(COPY.confirmReset)) {
      localStorage.removeItem('hotelEmployee');
      setEmployee(null);
      setShowWelcome(true);
      setActiveModule(null);
      toast.info(COPY.progressReset);
    }
  };

  const modulesWithStatus = useMemo(() => {
    if (!employee) return [];
    return TRAINING_MODULES.map((module) => {
      const lockReason = getModuleLockReason(module, employee);
      return {
        ...module,
        completed: employee.completedModules.includes(module.id),
        isLocked: !!lockReason,
      };
    });
  }, [employee]);

  if (showWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="max-w-md border-blue-200 shadow-2xl">
            <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 text-center text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                <GraduationCap size={48} />
              </div>
              <CardTitle className="mb-2 text-3xl">{COPY.appTitle}</CardTitle>
              <CardDescription className="text-lg text-white/90">{COPY.appSubtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div>
                <p className="mb-6 text-center text-lg leading-relaxed text-gray-700">{COPY.welcomeDescription}</p>
                <div className="space-y-2">
                  <label className="text-base font-medium text-gray-700">{COPY.loginLabel}</label>
                  <Input
                    type="text"
                    placeholder={COPY.loginPlaceholder}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userName.trim()) handleStartTraining(userName);
                    }}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-base font-medium text-gray-700">{COPY.passwordLabel}</label>
                  <Input
                    type="password"
                    placeholder={COPY.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userName.trim()) handleStartTraining(userName);
                    }}
                    className="text-base"
                  />
                </div>
              </div>
              <Button
                onClick={() => handleStartTraining(userName)}
                disabled={!userName.trim()}
                className="w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
              >
                {COPY.startLearning}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!employee) return null;

  const activeModuleData = TRAINING_MODULES.find((m) => m.id === activeModule);

  if (activeModuleData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-8">
        <Trainer
          module={activeModuleData}
          onComplete={(points, time, mistakes) => handleModuleComplete(activeModuleData, points, time, mistakes)}
          onCancel={() => setActiveModule(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-gray-900">{COPY.dashboardTitle}</h1>
            <p className="max-w-3xl text-xl leading-relaxed text-gray-600">{COPY.dashboardSubtitle}</p>
          </div>
          <Button variant="outline" onClick={handleReset} className="border-red-300 text-red-700 hover:bg-red-50">
            <RotateCcw size={16} className="mr-2" />
            {COPY.resetProgress}
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProfileCard employee={employee} />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-3xl">{COPY.keyMetrics}</CardTitle>
                <CardDescription className="text-lg text-slate-600">{COPY.keyMetricsSubtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
                    <p className="text-4xl font-bold text-blue-700">{employee.totalModulesCompleted}</p>
                    <p className="mt-2 text-lg text-gray-700">{COPY.totalRuns}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                    <p className="text-4xl font-bold text-emerald-700">{employee.totalPoints}</p>
                    <p className="mt-2 text-lg text-gray-700">{COPY.totalPoints}</p>
                  </div>
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 text-center">
                    <p className="text-4xl font-bold text-orange-600">{employee.perfectStreak}</p>
                    <p className="mt-2 text-lg text-gray-700">{COPY.perfectStreak}</p>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-center">
                    <p className="text-4xl font-bold text-indigo-600">{employee.dailyStreak}</p>
                    <p className="mt-2 text-lg text-gray-700">{COPY.dailyStreak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {lastReward && (
          <Card className="mb-8 border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="text-2xl">
                {COPY.lastReward} {lastReward.moduleTitle}
              </CardTitle>
              <CardDescription className="text-lg text-emerald-900/80">
                {COPY.total} +{lastReward.total} {COPY.pointsWord} {lastReward.wasPerfect ? `(${COPY.idealRun})` : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-base md:grid-cols-5">
              <div>{COPY.base}: +{lastReward.basePoints}</div>
              <div>{COPY.quality}: +{lastReward.qualityBonus}</div>
              <div>{COPY.speed}: +{lastReward.speedBonus}</div>
              <div>{COPY.combo}: +{lastReward.comboBonus}</div>
              <div>{COPY.rhythm}: +{lastReward.streakBonus}</div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">{COPY.modulesTitle}</h2>
          <p className="mb-6 text-lg text-gray-600">{COPY.modulesSubtitle}</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modulesWithStatus.map((module) => (
              <motion.div key={module.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <ModuleCard module={module} onStart={() => setActiveModule(module.id)} isLocked={module.isLocked} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Tabs defaultValue="leaderboard">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="leaderboard" className="text-base">{COPY.leaderboard}</TabsTrigger>
              <TabsTrigger value="achievements" className="text-base">{COPY.achievements}</TabsTrigger>
            </TabsList>
            <TabsContent value="leaderboard">
              <Leaderboard currentEmployeeId={employee.id} />
            </TabsContent>
            <TabsContent value="achievements">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ACHIEVEMENTS.map((achievement) => (
                  <motion.div key={achievement.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <AchievementCard
                      achievement={achievement}
                      isUnlocked={employee.unlockedAchievements.includes(achievement.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
