import { useState, useEffect } from 'react';
import { TrainingModule, Task } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { CheckCircle2, XCircle, Lightbulb, Trophy, Timer } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { formatTime } from '../utils/gamification';

interface TrainerProps {
  module: TrainingModule;
  onComplete: (earnedPoints: number, timeSpent: number, mistakeCount: number) => void;
  onCancel: () => void;
}

function formatDateDDMMYYYY(date: Date): string {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function resolveDateToken(token: string): string | null {
  const match = token.trim().toLowerCase().match(/^today(?:([+-]\d+))?$/);
  if (!match) return null;

  const offset = match[1] ? Number(match[1]) : 0;
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return formatDateDDMMYYYY(date);
}

function validateTaskAnswer(
  moduleId: string,
  task: Task,
  userAnswer: string | string[] | undefined,
): { isCorrect: boolean; error?: string } {
  const correctAnswer = task.correctAnswer;

  if (Array.isArray(correctAnswer)) {
    const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : []);
    const correctSet = new Set(correctAnswer);
    const isCorrect = userSet.size === correctSet.size && [...userSet].every((item) => correctSet.has(item));
    return {
      isCorrect,
      error: isCorrect ? undefined : 'Проверьте выбранные варианты и попробуйте ещё раз.',
    };
  }

  if (typeof userAnswer !== 'string') {
    return { isCorrect: false, error: 'Ответ не заполнен.' };
  }

  const normalizedAnswer = userAnswer.trim();
  if (!normalizedAnswer) {
    return { isCorrect: false, error: 'Ответ не заполнен.' };
  }

  const validation = task.validation;
  if (validation?.mode === 'regex' && validation.pattern) {
    const regex = new RegExp(validation.pattern);
    const isCorrect = regex.test(normalizedAnswer);
    return {
      isCorrect,
      error: isCorrect ? undefined : validation.errorMessage || 'Формат ответа не соответствует условию.',
    };
  }

  if (validation?.mode === 'non-empty') {
    return {
      isCorrect: normalizedAnswer.length >= 3,
      error: validation.errorMessage || 'Введите осмысленный ответ (минимум 3 символа).',
    };
  }

  if (validation?.mode === 'date-dd-mm-yyyy') {
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(normalizedAnswer)) {
      return {
        isCorrect: false,
        error: validation.errorMessage || 'Используйте формат ДД.ММ.ГГГГ.',
      };
    }

    const expectedDateFromToken =
      typeof correctAnswer === 'string' ? resolveDateToken(correctAnswer) : null;
    if (expectedDateFromToken) {
      return {
        isCorrect: normalizedAnswer === expectedDateFromToken,
        error: `Неверно. Считайте от текущей даты. Правильный формат: ДД.ММ.ГГГГ.`,
      };
    }

    const isCorrect =
      typeof correctAnswer === 'string' &&
      normalizedAnswer === correctAnswer.trim();
    return {
      isCorrect,
      error: isCorrect ? undefined : validation.errorMessage || 'Используйте формат ДД.ММ.ГГГГ.',
    };
  }

  if (moduleId === 'guest-registration' && task.id === 'task-3') {
    const passportRegex = /^\d{4}\s\d{6}$/;
    const isCorrect = passportRegex.test(normalizedAnswer);
    return {
      isCorrect,
      error: isCorrect ? undefined : 'Введите серию и номер в формате 1234 567890.',
    };
  }

  if (task.type === 'input') {
    return {
      isCorrect: normalizedAnswer.length >= 3,
      error: 'Введите осмысленный ответ (минимум 3 символа).',
    };
  }

  const isCorrect = normalizedAnswer.toLowerCase() === correctAnswer.toLowerCase().trim();
  return {
    isCorrect,
    error: isCorrect ? undefined : 'Неверно. Попробуйте ещё раз или используйте подсказку.',
  };
}

export function Trainer({ module, onComplete, onCancel }: TrainerProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'correct' | 'incorrect' | null;
    message: string;
  }>({ type: null, message: '' });
  const [, setCompletedTasks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(module.timeLimit || null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);

  useEffect(() => {
    if (module.timeLimit) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            onComplete(0, module.timeLimit!, mistakeCount);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [module.timeLimit, mistakeCount, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const currentTask = module.tasks[currentTaskIndex];
  const progress = ((currentTaskIndex + 1) / module.tasks.length) * 100;
  const isLastTask = currentTaskIndex === module.tasks.length - 1;

  const checkAnswer = () => {
    const result = validateTaskAnswer(module.id, currentTask, answers[currentTask.id]);

    if (result.isCorrect) {
      setFeedback({
        type: 'correct',
        message: 'Правильно! Отличная работа.',
      });
      setCompletedTasks((prev) => [...prev, currentTask.id]);
      setTimeout(() => {
        if (isLastTask) {
          onComplete(module.points, timeSpent, mistakeCount);
        } else {
          setCurrentTaskIndex(currentTaskIndex + 1);
          setFeedback({ type: null, message: '' });
          setShowHint(false);
        }
      }, 1200);
      return;
    }

    setFeedback({
      type: 'incorrect',
      message: result.error || 'Неверно. Попробуйте ещё раз или используйте подсказку.',
    });
    setMistakeCount((prev) => prev + 1);
  };

  const renderTaskInput = (task: Task) => {
    switch (task.type) {
      case 'input':
      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor="answer">{task.question}</Label>
            <Input
              id="answer"
              type="text"
              placeholder="Введите ваш ответ..."
              value={(answers[task.id] as string) || ''}
              onChange={(e) => setAnswers({ ...answers, [task.id]: e.target.value })}
              className="text-base"
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-4">
            <Label className="text-base">{task.question}</Label>
            <RadioGroup
              value={(answers[task.id] as string) || ''}
              onValueChange={(value) => setAnswers({ ...answers, [task.id]: value })}
            >
              {task.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 rounded-lg p-3 transition-colors hover:bg-blue-50">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'checkbox':
        const selectedOptions = (answers[task.id] as string[]) || [];
        return (
          <div className="space-y-4">
            <Label className="text-base">{task.question}</Label>
            <div className="space-y-2">
              {task.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 rounded-lg p-3 transition-colors hover:bg-blue-50">
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setAnswers({
                          ...answers,
                          [task.id]: [...selectedOptions, option],
                        });
                      } else {
                        setAnswers({
                          ...answers,
                          [task.id]: selectedOptions.filter((o) => o !== option),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Card className="border-blue-200 shadow-xl">
        <CardHeader className="rounded-t-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="mb-2 flex items-center justify-between">
            <CardTitle className="text-2xl">{module.title}</CardTitle>
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
              <Trophy size={20} />
              <span className="font-bold">+{module.points} баллов</span>
            </div>
          </div>
          <CardDescription className="text-base text-white/90">
            Задание {currentTaskIndex + 1} из {module.tasks.length}
          </CardDescription>
          {timeLeft !== null && (
            <div className="mt-3 flex items-center gap-2">
              <Timer size={18} />
              <span className={`text-lg font-bold ${timeLeft < 30 ? 'animate-pulse text-red-300' : ''}`}>
                Осталось: {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <Progress value={progress} className="mt-4 h-2 bg-white/20" />
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          {renderTaskInput(currentTask)}

          {showHint && currentTask.hint && (
            <Alert className="border-blue-200 bg-blue-50">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Подсказка:</strong> {currentTask.hint}
              </AlertDescription>
            </Alert>
          )}

          {feedback.type && (
            <Alert className={feedback.type === 'correct' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {feedback.type === 'correct' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={feedback.type === 'correct' ? 'text-green-900' : 'text-red-900'}>
                {feedback.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <Button variant="outline" onClick={onCancel}>
              Отменить
            </Button>
            <div className="flex gap-2">
              {!showHint && currentTask.hint && (
                <Button
                  variant="outline"
                  onClick={() => setShowHint(true)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Lightbulb size={16} className="mr-2" />
                  Подсказка
                </Button>
              )}
              <Button
                onClick={checkAnswer}
                disabled={!answers[currentTask.id] || feedback.type === 'correct'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLastTask ? 'Завершить' : 'Проверить'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
