
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, ChevronDown, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Input } from '@/components/ui/input';
import { format, parseISO } from 'date-fns';
import TransactionFormDialog from '@/components/transactions/TransactionFormDialog';
import { toast } from '@/components/ui/sonner';
import { Transaction } from '@/services/transactionsApi';
import TransactionList from '@/components/dashboard/TransactionList';

const Transactions: React.FC = () => {
  const { transactions, fetchTransactions, addTransaction } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch transactions when component mounts
  // Track if we've attempted to fetch transactions
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  // Extract loadTransactions function so it can be called from retry button
  const loadTransactions = async () => {
    if (transactions.length === 0 || !hasAttemptedFetch) {
      setIsLoading(true);
      try {
        await fetchTransactions(20); // Fetch more transactions for the transactions page
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
        setHasAttemptedFetch(true);
      }
    }
  };
  
  useEffect(() => {
    loadTransactions();
  }, [fetchTransactions, transactions.length, hasAttemptedFetch]);
  
  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction) => {
    const description = transaction.description || '';
    const category = transaction.category_name || '';
    return description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           category.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Group transactions by date
  const transactionsByDate = filteredTransactions.reduce((grouped, transaction) => {
    // Use transaction_date from API
    const date = format(parseISO(transaction.transaction_date), 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
    return grouped;
  }, {} as Record<string, Transaction[]>);

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

  const handleViewTransaction = (transaction: Transaction) => {
    // Create a detailed view of transaction for form dialog
    const accountObj = {
      id: transaction.account_id
    };
    
    const viewTransaction = {
      ...transaction,
      account: accountObj,
      // Convert string date to Date object for the form
      date: parseISO(transaction.transaction_date),
      // Map API fields to form fields
      category: transaction.category_id,
      amount: parseFloat(transaction.amount)
    };
    
    setSelectedTransaction(viewTransaction);
    setShowTransactionForm(true);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Button size="sm" onClick={() => {
          setSelectedTransaction(null);
          setShowTransactionForm(true);
        }}>
          <Plus size={16} className="mr-1" /> Add Transaction
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button variant="outline" className="md:w-auto w-full" disabled={isLoading}>
          <Filter size={16} className="mr-1" /> Filters <ChevronDown size={16} className="ml-1" />
        </Button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length > 0 ? (
        /* Transactions list when data is available */
        Object.entries(transactionsByDate).map(([date, dayTransactions]) => (
          <div key={date} className="space-y-2 mb-6">
            <h2 className="text-sm font-medium text-muted-foreground">
              {format(new Date(date), 'MMMM d, yyyy')}
            </h2>
            <Card>
              <CardContent className="p-2">
                <TransactionList
                  transactions={dayTransactions}
                />
              </CardContent>
            </Card>
          </div>
        ))
      ) : searchQuery ? (
        /* No results for search query */
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No transactions match your search</p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      ) : hasAttemptedFetch ? (
        /* No transactions after fetch attempt */
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No transactions found</p>
          <Button onClick={() => {
            setSelectedTransaction(null);
            setShowTransactionForm(true);
          }}>
            <Plus size={16} className="mr-1" /> Add Your First Transaction
          </Button>
        </div>
      ) : (
        /* Failed to load */
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Failed to load transactions</p>
          <Button variant="outline" onClick={() => {
            setHasAttemptedFetch(false);
            loadTransactions();
          }}>
            Retry
          </Button>
        </div>
      )}

      <TransactionFormDialog 
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        initialTransaction={selectedTransaction}
      />
    </div>
  );
};

export default Transactions;
