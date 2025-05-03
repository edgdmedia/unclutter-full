
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Filter, Edit } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import BudgetFormDialog from '@/components/budgets/BudgetFormDialog';

const Budgets: React.FC = () => {
  const { budgets } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any>(null);
  
  // Calculate total budget and spent
  const totalBudgeted = budgets.reduce((sum, budget) => sum + (budget.budgetAmount || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spentAmount || 0), 0);
  const remainingPercentage = totalBudgeted > 0 ? Math.min(100, Math.max(0, 100 - (totalSpent / totalBudgeted * 100))) : 100;
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleAddBudget = () => {
    setSelectedBudget(null);
    setIsBudgetFormOpen(true);
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudget(budget);
    setIsBudgetFormOpen(true);
  };

  // Sort budgets by percentage spent (highest first)
  const sortedBudgets = [...budgets].sort((a, b) => {
    const aPercentage = (a.spentAmount || 0) / (a.budgetAmount || 1) * 100;
    const bPercentage = (b.spentAmount || 0) / (b.budgetAmount || 1) * 100;
    return bPercentage - aPercentage;
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-1" /> Filter
          </Button>
          <Button size="sm" onClick={handleAddBudget}>
            <Plus size={16} className="mr-1" /> Add Budget
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <span className="sr-only">Previous month</span>
              &lt;
            </Button>
            <h2 className="text-xl font-semibold">
              {months[selectedMonth - 1]} {selectedYear}
            </h2>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <span className="sr-only">Next month</span>
              &gt;
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">${totalBudgeted.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-finance-green">
                ${(totalBudgeted - totalSpent).toLocaleString()}
              </p>
            </div>
          </div>
          <Progress 
            value={remainingPercentage} 
            className="h-2 bg-finance-red"
            indicatorClassName="bg-finance-green"
          />
          <div className="flex justify-between text-xs">
            <span>Spent: ${totalSpent.toLocaleString()}</span>
            <span>{remainingPercentage.toFixed(0)}% remaining</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Budget Categories</h2>
        {sortedBudgets.length > 0 ? (
          <div className="space-y-2">
            {sortedBudgets.map((budget) => {
              const spentAmount = budget.spentAmount || 0;
              const budgetAmount = budget.budgetAmount || 0;
              const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
              const isOverBudget = percentage > 100;
              
              return (
                <Card key={budget.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: isOverBudget ? '#ef4444' : '#14b8a6' }}
                          ></div>
                          <h3 className="font-medium">{budget.category.name}</h3>
                        </div>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            ${spentAmount.toLocaleString()} of ${budgetAmount.toLocaleString()}
                          </span>
                          <span 
                            className={`text-sm font-medium ${isOverBudget ? 'text-finance-red' : 'text-finance-green'}`}
                          >
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleEditBudget(budget)}>
                        <Edit size={16} />
                      </Button>
                    </div>
                    <Progress 
                      value={Math.min(percentage, 100)} 
                      className="h-2 mt-2 bg-gray-200"
                      indicatorClassName={isOverBudget ? 'bg-finance-red' : 'bg-finance-green'}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No budgets found for this month</p>
            <Button onClick={handleAddBudget}>
              <Plus size={16} className="mr-1" /> Create Your First Budget
            </Button>
          </div>
        )}
      </div>

      <BudgetFormDialog
        open={isBudgetFormOpen}
        onOpenChange={setIsBudgetFormOpen}
        initialBudget={selectedBudget}
        month={selectedMonth}
        year={selectedYear}
      />
    </div>
  );
};

export default Budgets;
