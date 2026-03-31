import { EmployeeLevel } from '../types';
import { LEVEL_NAMES, LEVEL_COLORS } from '../utils/gamification';
import { Award } from 'lucide-react';

interface LevelBadgeProps {
  level: EmployeeLevel;
  size?: 'sm' | 'md' | 'lg';
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <div
      className={`${LEVEL_COLORS[level]} ${sizeClasses[size]} text-white font-semibold rounded-full inline-flex items-center gap-1.5 shadow-md`}
    >
      <Award size={iconSizes[size]} />
      <span>{LEVEL_NAMES[level]}</span>
    </div>
  );
}
