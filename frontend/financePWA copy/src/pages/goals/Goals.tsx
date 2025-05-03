
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Clock, Calendar, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useFinance } from '@/context/FinanceContext';
import GoalFormDialog from '@/components/goals/GoalFormDialog';

const Goals: React.FC = () => {
  const { goals } = useFinance();
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  const handleAddGoal = () => {
    setSelectedGoal(null);
    setIsGoalFormOpen(true);
  };

  const handleEditGoal = (goal: any) => {
    setSelectedGoal(goal);
    setIsGoalFormOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderGoalCard = (goal: any) => {
    const progressPercentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
    
    return (
      <Card key={goal.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div 
            className="flex items-center justify-between cursor-pointer" 
            onClick={() => handleEditGoal(goal)}
          >
            <div>
              <h3 className="font-medium">{goal.name}</h3>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {goal.status === 'completed' 
                    ? `Completed ${formatDistanceToNow(new Date(goal.completedDate), { addSuffix: true })}`
                    : `Target date: ${new Date(goal.targetDate).toLocaleDateString()}`}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2" 
              indicatorClassName="bg-finance-blue"
            />
          </div>
          
          {goal.status === 'active' && goal.daysRemaining && (
            <div className="mt-2 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">
                {goal.daysRemaining} days remaining
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <Button size="sm" onClick={handleAddGoal}>
          <Plus size={16} className="mr-1" /> Add Goal
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedGoals.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.length > 0 ? (
              activeGoals.map(renderGoalCard)
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground mb-4">No active goals</p>
                <Button onClick={handleAddGoal}>
                  <Plus size={16} className="mr-1" /> Create Your First Goal
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.length > 0 ? (
              completedGoals.map(renderGoalCard)
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No completed goals yet</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <GoalFormDialog
        open={isGoalFormOpen}
        onOpenChange={setIsGoalFormOpen}
        initialGoal={selectedGoal}
      />
    </div>
  );
};

export default Goals;
