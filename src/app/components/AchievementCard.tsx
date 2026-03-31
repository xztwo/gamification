import { Achievement } from '../types';
import { Card, CardContent } from './ui/card';
import {
  Award,
  CheckCheck,
  Coins,
  Crown,
  Flame,
  Rocket,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  Footprints,
  CalendarDays,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const iconMap: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  FootprintsIcon: Footprints,
  Zap,
  Target,
  Rocket,
  TrendingUp,
  CheckCheck,
  Coins,
  Star,
  Crown,
  Award,
  Flame,
  Trophy,
  CalendarDays,
};

const UNLOCKED = '\u0420\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u043e';

export function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
  const Icon = iconMap[achievement.icon] || Award;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={`relative overflow-hidden transition-all ${
          isUnlocked
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg'
            : 'border-gray-200 bg-gray-50 opacity-60'
        }`}
      >
        {isUnlocked && (
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rotate-45 bg-yellow-400"></div>
        )}
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-3 ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                  : 'bg-gray-300 text-gray-500'
              }`}
            >
              <Icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className={`mb-2 text-lg font-bold ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.title}
              </h3>
              <p className={`text-base leading-relaxed ${isUnlocked ? 'text-gray-700' : 'text-gray-400'}`}>
                {achievement.description}
              </p>
              {isUnlocked && (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-yellow-800">
                  <Trophy size={12} />
                  {UNLOCKED}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
