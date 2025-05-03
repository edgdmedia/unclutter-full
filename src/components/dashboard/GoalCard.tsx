
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed';
  description?: string;
}

interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onClick }) => {
  // Calculate days remaining until target date
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <h3 className="font-medium mb-1">{goal.name}</h3>
        
        <div className="mt-3 mb-1">
          <div className="flex justify-between text-sm">
            <span>{formatCurrency(goal.currentAmount)}</span>
            <span>{formatCurrency(goal.targetAmount)}</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 mt-1"
            style={{ "--progress-background": "#3b82f6" } as React.CSSProperties}
          />
          <div className="flex justify-end mt-1">
            <span className="text-xs font-medium">{progressPercentage}%</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 mt-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Target: {new Date(goal.targetDate).toLocaleDateString()}
            </span>
          </div>
          {goal.status === 'active' && diffDays > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">
                {diffDays} days remaining
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
