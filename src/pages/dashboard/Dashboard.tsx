import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Plus, ChevronRight, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/dashboard/StatCard';
import AccountCard from '@/components/dashboard/AccountCard';
import TransactionList from '@/components/dashboard/TransactionList';
import TransactionFormDialog from '@/components/transactions/TransactionFormDialog';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import GoalCard from '@/components/dashboard/GoalCard';
import { useFinance } from '@/context/FinanceContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/utils/formatters';
import { toast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const { user } = useAuth();
  
  const { 
    dashboardSummary,
    dashboardTrends,
    transactions,
    fetchDashboardSummary,
    fetchDashboardTrends,
    fetchTransactions,
    addTransaction
  } = useFinance();
  
  // Add loading states for different data types
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState({
    transactions: false,
    dashboardSummary: false,
    dashboardTrends: false
  });
  
  // Simpler approach - just clear localStorage for the new user
  const clearCacheForNewUser = () => {
    console.log('Clearing cache for new user');
    try {
      // Clear localStorage items
      localStorage.removeItem('dashboardSummary');
      localStorage.removeItem('dashboardTrends');
      localStorage.removeItem('transactions');
      localStorage.removeItem('accounts');
      localStorage.removeItem('categories');
      localStorage.removeItem('budgets');
      localStorage.removeItem('goals');
      localStorage.removeItem('preferences');
      
      console.log('Successfully cleared localStorage cache');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };
  
  // Add a ref to track if we've already loaded data for this session
  const dataLoadedRef = React.useRef(false);

  // Fetch dashboard data on component mount
  React.useEffect(() => {
    // Skip if we've already loaded data and nothing important has changed
    if (dataLoadedRef.current && dashboardSummary && dashboardTrends && transactions.length > 0) {
      return;
    }
    
    const loadData = async () => {
      console.log('Dashboard: Loading data');
      
      // Get current user email from localStorage
      const currentUserEmail = localStorage.getItem('userEmail');
      
      // Get the last loaded user email from localStorage
      const lastLoadedUserEmail = localStorage.getItem('lastLoadedUserEmail');
      
      // Check if this is a new user (different from the last loaded user)
      const isNewUser = currentUserEmail && lastLoadedUserEmail && currentUserEmail !== lastLoadedUserEmail;
      
      console.log(`Current user: ${currentUserEmail}, Last loaded: ${lastLoadedUserEmail}, Is new user: ${isNewUser}`);
      
      if (isNewUser) {
        // New user flow: clear cache, fetch new data, update UI
        console.log('New user detected, clearing data and fetching fresh data');
        
        // Show loading states
        setIsLoadingTransactions(true);
        setIsLoadingBudgets(true);
        setIsLoadingGoals(true);
        
        // Clear cache for the new user - simpler approach
        clearCacheForNewUser();
        
        try {
          // Reset attempt states to force new fetches
          setHasAttemptedFetch({
            transactions: false,
            dashboardSummary: false,
            dashboardTrends: false
          });
          
          // Fetch all data in parallel
          await Promise.all([
            fetchDashboardSummary(),
            fetchDashboardTrends(),
            fetchTransactions(5) // Fetch just a few for the dashboard
          ]);
          console.log('Successfully fetched all dashboard data for new user');
          
          // Store the current user as the last loaded user
          localStorage.setItem('lastLoadedUserEmail', currentUserEmail);
          
          // Mark that we've loaded data for this session
          dataLoadedRef.current = true;
        } catch (error) {
          console.error('Failed to fetch dashboard data for new user:', error);
        } finally {
          // Update attempt states
          setHasAttemptedFetch({
            transactions: true,
            dashboardSummary: true,
            dashboardTrends: true
          });
          
          // Hide loading states
          setIsLoadingTransactions(false);
          setIsLoadingBudgets(false);
          setIsLoadingGoals(false);
        }
      } else {
        // Same user flow: load from DB and refresh with new fetched data
        console.log('Same user or first load, using normal data loading flow');
        
        // Store the current user as the last loaded user if not set
        if (currentUserEmail && !lastLoadedUserEmail) {
          localStorage.setItem('lastLoadedUserEmail', currentUserEmail);
        }
        
        let dataFetched = false;
        
        // Fetch dashboard summary
        if (!dashboardSummary && !hasAttemptedFetch.dashboardSummary) {
          try {
            await fetchDashboardSummary();
            dataFetched = true;
          } catch (error) {
            console.error('Failed to fetch dashboard summary:', error);
          } finally {
            setHasAttemptedFetch(prev => ({ ...prev, dashboardSummary: true }));
          }
        }
        
        // Fetch dashboard trends
        if (!dashboardTrends && !hasAttemptedFetch.dashboardTrends) {
          try {
            await fetchDashboardTrends();
            dataFetched = true;
          } catch (error) {
            console.error('Failed to fetch dashboard trends:', error);
          } finally {
            setHasAttemptedFetch(prev => ({ ...prev, dashboardTrends: true }));
          }
        }
        
        // Fetch recent transactions
        if (transactions.length === 0 && !hasAttemptedFetch.transactions) {
          setIsLoadingTransactions(true);
          try {
            await fetchTransactions(5); // Fetch just a few for the dashboard
            dataFetched = true;
          } catch (error) {
            console.error('Failed to fetch transactions:', error);
          } finally {
            setIsLoadingTransactions(false);
            setHasAttemptedFetch(prev => ({ ...prev, transactions: true }));
          }
        }
        
        // If we fetched any data, mark that we've loaded data for this session
        if (dataFetched) {
          dataLoadedRef.current = true;
        }
      }
    };
    
    loadData();
  }, [
    // Only include the data existence checks and fetch functions
    // Remove hasAttemptedFetch from dependencies to prevent loops
    dashboardSummary, 
    dashboardTrends, 
    transactions.length, 
    fetchDashboardSummary, 
    fetchDashboardTrends, 
    fetchTransactions
  ]);

  // Using formatCurrency from utils

    const handleAddTransaction = async (values: any) => {
      try {
        setIsLoading(true);
        
        // Format transaction data for the API
        const newTransaction = {
          transaction_date: values.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
          amount: values.amount,
          description: values.description || 'Unnamed transaction',
          category_id: values.category || '1', // Default to first category if none selected
          account_id: values.account,
          type: values.type,
          tags: values.tags || [],
          notes: values.notes || ''
        };
        
        // Call the real API method
        await addTransaction(newTransaction as any);
        toast.success('Transaction added successfully!');
        setShowTransactionForm(false);
        
        // Refresh transactions list
        await fetchTransactions(20);
      } catch (error) {
        console.error('Failed to add transaction:', error);
        toast.error('Failed to add transaction. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="space-y-6 pb-8 relative">
      <div className="flex items-center mt-4 justify-between">
        <div>
          <h1 className="text-2xl hidden font-bold tracking-tight">
            {user?.first_name ? `Welcome back, ${user.first_name}!` : 'Welcome back!'}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} <br/> Here's your financial overview
          </p>
        </div>
      </div>
      
      {/* Floating Action Button for Add Transaction */}
      <Button 
        className="fixed bottom-20 right-6 rounded-full w-14 h-14 shadow-lg z-50 flex items-center justify-center p-0"
        size="icon"
        onClick={() => setShowTransactionForm(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      {/* Transaction Form Dialog */}
      <TransactionFormDialog
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        onSubmit={handleAddTransaction}
        isLoading={isLoading}
      />

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
            {isLoadingTransactions ? (
              <div className="py-8 text-center">
                <div className="flex justify-center mb-2">
                  <BarChart3 className="h-10 w-10 text-muted-foreground animate-pulse" />
                </div>
                <p className="text-muted-foreground">Loading transactions...</p>
              </div>
            ) : transactions.length > 0 ? (
              <TransactionList transactions={transactions} limit={5} />
            ) : hasAttemptedFetch.transactions ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No transactions found</p>
                <Button variant="outline" onClick={() => setShowTransactionForm(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Transaction
                </Button>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Failed to load transactions</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => fetchTransactions(5)}>
                  Retry
                </Button>
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
            {isLoadingBudgets ? (
              <div className="py-8 text-center">
                <div className="flex justify-center mb-2">
                  <BarChart3 className="h-10 w-10 text-muted-foreground animate-pulse" />
                </div>
                <p className="text-muted-foreground">Loading budget data...</p>
              </div>
            ) : dashboardSummary?.budgets?.length > 0 ? (
              <div>
                {/* Budget content will go here when implemented */}
                <p className="text-muted-foreground text-center">Budget data available</p>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground mb-4">No budget data found</p>
                <Button variant="outline" onClick={() => navigate('/budgets')}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Budget
                </Button>
              </div>
            )}
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
          {isLoadingGoals ? (
            <div className="col-span-full py-8 text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-10 w-10 text-muted-foreground animate-pulse" />
              </div>
              <p className="text-muted-foreground">Loading savings goals...</p>
            </div>
          ) : dashboardSummary?.goals?.length > 0 ? (
            <div className="col-span-full">
              {/* Goals content will go here when implemented */}
              <p className="text-muted-foreground text-center">Savings goals available</p>
            </div>
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-muted-foreground mb-4">No savings goals found</p>
              <Button variant="outline" onClick={() => navigate('/goals')}>
                <Plus className="mr-2 h-4 w-4" /> Create Your First Savings Goal
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
