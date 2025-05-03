
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface Budget {
  id: string;
  category: {
    id: string;
    name: string;
    type: string;
  };
  spentAmount: number;
  budgetAmount: number;
  month: number;
  year: number;
}

interface BudgetProgressProps {
  budgets: Budget[];
  limit?: number;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budgets, limit = 3 }) => {
  const sortedBudgets = [...budgets]
    .sort((a, b) => {
      const aPercentage = a.spentAmount / a.budgetAmount * 100;
      const bPercentage = b.spentAmount / b.budgetAmount * 100;
      return bPercentage - aPercentage;
    })
    .slice(0, limit);

  if (budgets.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">No budgets found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedBudgets.map((budget) => {
        const spentPercentage = Math.min(100, Math.round((budget.spentAmount / budget.budgetAmount) * 100));
        const isOverBudget = budget.spentAmount > budget.budgetAmount;

        return (
          <div key={budget.id} className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm font-medium">{budget.category.name}</span>
              <span className="text-sm font-medium">
                ${budget.spentAmount.toFixed(2)} / ${budget.budgetAmount.toFixed(2)}
              </span>
            </div>
            <Progress 
              value={spentPercentage} 
              className="h-2" 
              {...(isOverBudget 
                ? { className: "h-2 bg-gray-200" } 
                : { className: "h-2 bg-gray-200" }
              )}
              style={{
                "--progress-background": isOverBudget ? "#ef4444" : "#14b8a6"
              } as React.CSSProperties}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${isOverBudget ? 'text-finance-red' : 'text-finance-green'}`}>
                {spentPercentage}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetProgress;
