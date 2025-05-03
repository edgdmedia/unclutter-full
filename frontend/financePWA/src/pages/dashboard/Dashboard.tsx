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
import { formatCurrency } from '@/utils/formatters';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    dashboardSummary,
    dashboardTrends,
    transactions,
    fetchDashboardSummary,
    fetchDashboardTrends,
    fetchTransactions
  } = useFinance();
  
  // Fetch dashboard data if not already loaded
  React.useEffect(() => {
    if (!dashboardSummary) {
      fetchDashboardSummary();
    }
    if (!dashboardTrends) {
      fetchDashboardTrends();
    }
    if (transactions.length === 0) {
      fetchTransactions(5);
    }
  }, [dashboardSummary, dashboardTrends, transactions.length, fetchDashboardSummary, fetchDashboardTrends, fetchTransactions]);

  // Using formatCurrency from utils

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
          value={dashboardSummary ? formatCurrency(dashboardSummary.net_balance) : '...'}
          icon={<DollarSign className="h-4 w-4 text-primary" />}
        />
        <StatCard
          title="Income"
          value={dashboardSummary ? formatCurrency(dashboardSummary.total_income) : '...'}
          icon={<TrendingUp className="h-4 w-4 text-finance-green" />}
          trend="up"
          trendValue={dashboardTrends ? `Trend over ${dashboardTrends.labels.length} months` : 'Loading...'}
        />
        <StatCard
          title="Expenses"
          value={dashboardSummary ? formatCurrency(dashboardSummary.total_expenses) : '...'}
          icon={<TrendingDown className="h-4 w-4 text-finance-red" />}
          trend="down"
          trendValue={dashboardTrends ? `Trend over ${dashboardTrends.labels.length} months` : 'Loading...'}
        />
        <StatCard
          title="Savings"
          value={dashboardSummary ? 
            formatCurrency(dashboardSummary.total_income - dashboardSummary.total_expenses) : 
            '...'}
          icon={<BarChart3 className="h-4 w-4 text-amber-500" />}
          trend="up"
          trendValue={dashboardTrends ? `Based on ${dashboardTrends.labels[dashboardTrends.labels.length-1]}` : 'Loading...'}
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
          {dashboardSummary && dashboardSummary.accounts ? 
            dashboardSummary.accounts.map((account) => (
              <AccountCard
                key={account.id}
                name={account.name}
                balance={parseFloat(account.balance)}
                type={account.type_name}
                institution={account.institution}
                onClick={() => navigate(`/accounts/${account.id}`)}
              />
            )) : 
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Loading accounts...</p>
            </div>
          }
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
            {transactions.length > 0 ? (
              <TransactionList transactions={transactions} limit={5} />
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            )}
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
            {/* We'll implement real budget API in the next step */}
            <div className="py-8 text-center">
              <p className="text-muted-foreground">Loading budget data...</p>
            </div>
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
          {/* We'll implement real goals API in the next step */}
          <div className="col-span-full py-8 text-center">
            <p className="text-muted-foreground">Loading savings goals...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
