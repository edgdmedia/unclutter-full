
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, ChevronRight, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import AccountCard from '@/components/dashboard/AccountCard';
import TransactionList from '@/components/dashboard/TransactionList';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import GoalCard from '@/components/dashboard/GoalCard';
import { useFinance } from '@/context/FinanceContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, transactions, budgets, goals, financialSummary } = useFinance();

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button variant="outline" onClick={() => navigate('/transactions/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(financialSummary.totalBalance)}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Income"
          value={formatCurrency(financialSummary.income)}
          icon={<TrendingUp className="h-4 w-4 text-finance-green" />}
          trend="up"
          trendValue="+8.2% from last month"
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(financialSummary.expenses)}
          icon={<TrendingDown className="h-4 w-4 text-finance-red" />}
          trend="down"
          trendValue="-3.1% from last month"
        />
        <StatCard
          title="Savings"
          value={formatCurrency(financialSummary.savings)}
          icon={<BarChart3 className="h-4 w-4 text-amber-500" />}
          trend="up"
          trendValue="+12.5% from last month"
        />
      </div>

      {/* Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <Button variant="ghost" size="sm" className="text-sm" onClick={() => navigate('/accounts')}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              name={account.name}
              balance={account.balance}
              type={account.type}
              institution={account.institution}
              onClick={() => navigate(`/accounts/${account.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Transactions and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-sm" onClick={() => navigate('/transactions')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={transactions} limit={5} />
          </CardContent>
        </Card>

        {/* Budget Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Budget Status</CardTitle>
            <Button variant="ghost" size="sm" className="text-sm" onClick={() => navigate('/budgets')}>
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <BudgetProgress budgets={budgets} limit={3} />
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Savings Goals</h2>
          <Button variant="ghost" size="sm" className="text-sm" onClick={() => navigate('/goals')}>
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.filter(goal => goal.status === 'active').slice(0, 3).map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => navigate(`/goals/${goal.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
