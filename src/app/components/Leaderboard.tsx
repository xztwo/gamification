import { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LevelBadge } from './LevelBadge';
import { formatTime } from '../utils/gamification';
import { fetchLeaderboard } from '../api/gamificationApi';
import { Trophy, Medal, Award, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardProps {
  currentEmployeeId?: string;
  refreshKey?: number;
}

const COPY = {
  title: '\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u043b\u0438\u0434\u0435\u0440\u043e\u0432',
  subtitle: '\u0422\u043e\u043f-10 \u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u043a\u043e\u0432 \u043f\u043e \u043a\u043e\u043b\u0438\u0447\u0435\u0441\u0442\u0432\u0443 \u043d\u0430\u0431\u0440\u0430\u043d\u043d\u044b\u0445 \u0431\u0430\u043b\u043b\u043e\u0432',
  emptyTitle: '\u0422\u0430\u0431\u043b\u0438\u0446\u0430 \u043b\u0438\u0434\u0435\u0440\u043e\u0432 \u043f\u043e\u043a\u0430 \u043f\u0443\u0441\u0442\u0430',
  emptyHint: '\u0421\u0442\u0430\u043d\u044c\u0442\u0435 \u043f\u0435\u0440\u0432\u044b\u043c, \u043a\u0442\u043e \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u0437\u0434\u0435\u0441\u044c.',
  currentUser: '\u0412\u044b',
  modules: '\u043c\u043e\u0434\u0443\u043b\u0435\u0439',
};

export function Leaderboard({ currentEmployeeId, refreshKey = 0 }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard()
      .then((rows) => {
        if (!cancelled) setLeaderboard(rows);
      })
      .catch(() => {
        if (!cancelled) setLeaderboard([]);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="text-yellow-500" size={24} />;
      case 1:
        return <Medal className="text-gray-400" size={24} />;
      case 2:
        return <Award className="text-orange-600" size={24} />;
      default:
        return <span className="font-bold text-gray-600">{position + 1}</span>;
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy size={28} />
          {COPY.title}
        </CardTitle>
        <CardDescription className="text-base text-white/90">{COPY.subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {leaderboard.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Trophy size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">{COPY.emptyTitle}</p>
            <p className="mt-2 text-base">{COPY.emptyHint}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`rounded-lg border p-4 transition-all ${
                  entry.id === currentEmployeeId
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : index < 3
                    ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex w-8 items-center justify-center">
                    {getMedalIcon(index)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="truncate text-lg font-bold">{entry.name}</h3>
                      {entry.id === currentEmployeeId && (
                        <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                          {COPY.currentUser}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <LevelBadge level={entry.level} size="sm" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Trophy size={16} className="text-blue-600" />
                      <span className="text-xl font-bold text-blue-600">{entry.totalPoints}</span>
                    </div>
                    <div className="flex items-center justify-end gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        <span>{entry.completedModules} {COPY.modules}</span>
                      </div>
                      {entry.fastestTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatTime(entry.fastestTime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
