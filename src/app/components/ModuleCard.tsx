import { TrainingModule } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  UserPlus,
  Key,
  Calendar,
  LogOut,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ModuleCardProps {
  module: TrainingModule;
  onStart: () => void;
  isLocked?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  UserPlus,
  Key,
  Calendar,
  LogOut,
  AlertCircle,
  Sparkles,
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  hard: 'bg-red-100 text-red-800 border-red-300',
};

const difficultyLabels = {
  easy: '\u041b\u0435\u0433\u043a\u043e',
  medium: '\u0421\u0440\u0435\u0434\u043d\u0435',
  hard: '\u0421\u043b\u043e\u0436\u043d\u043e',
};

const COPY = {
  points: '\u0431\u0430\u043b\u043b\u043e\u0432',
  taskSingle: '\u0437\u0430\u0434\u0430\u043d\u0438\u0435',
  taskPlural: '\u0437\u0430\u0434\u0430\u043d\u0438\u0439',
  completed: '\u041f\u0440\u043e\u0439\u0434\u0435\u043d\u043e',
  locked: '\u0417\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d\u043e',
  start: '\u041d\u0430\u0447\u0430\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u0435',
};

export function ModuleCard({ module, onStart, isLocked = false }: ModuleCardProps) {
  const Icon = iconMap[module.icon] || UserPlus;

  return (
    <Card
      className={`transition-all hover:shadow-lg ${
        module.completed
          ? 'border-green-500 bg-green-50/50'
          : isLocked
          ? 'border-gray-300 bg-gray-50 opacity-60'
          : 'border-blue-200 hover:border-blue-400'
      }`}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between">
          <div
            className={`rounded-lg p-3 text-white ${
              module.completed
                ? 'bg-green-500'
                : isLocked
                ? 'bg-gray-400'
                : 'bg-blue-500'
            }`}
          >
            {module.completed ? (
              <CheckCircle2 size={28} />
            ) : isLocked ? (
              <Lock size={28} />
            ) : (
              <Icon size={28} />
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={difficultyColors[module.difficulty]}>
              {difficultyLabels[module.difficulty]}
            </Badge>
            <span className="text-base font-semibold text-blue-700">
              +{module.points} {COPY.points}
            </span>
          </div>
        </div>
        <CardTitle className="text-2xl leading-snug">{module.title}</CardTitle>
        <CardDescription className="text-lg leading-relaxed text-slate-700">{module.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-base text-muted-foreground">
            {module.tasks.length} {module.tasks.length === 1 ? COPY.taskSingle : COPY.taskPlural}
          </span>
          <Button
            onClick={onStart}
            disabled={isLocked}
            variant={module.completed ? 'outline' : 'default'}
            className={
              module.completed
                ? 'border-green-500 text-base text-green-700 hover:bg-green-50'
                : isLocked
                ? 'text-base'
                : 'bg-blue-600 text-base hover:bg-blue-700'
            }
          >
            {module.completed ? COPY.completed : isLocked ? COPY.locked : COPY.start}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
