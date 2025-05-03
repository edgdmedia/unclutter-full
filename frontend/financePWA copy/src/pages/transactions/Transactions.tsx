
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Search, ChevronDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import TransactionFormDialog from '@/components/transactions/TransactionFormDialog';
import { toast } from '@/components/ui/sonner';

const Transactions: React.FC = () => {
  const { transactions, addTransaction } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  
  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction) => 
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group transactions by date
  const transactionsByDate = filteredTransactions.reduce((grouped, transaction) => {
    const date = format(new Date(transaction.date), 'yyyy-MM-dd');
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
    return grouped;
  }, {} as Record<string, typeof transactions>);

  const handleAddTransaction = (values: any) => {
    const newTransaction = {
      date: values.date.toISOString(),
      amount: values.type === 'expense' ? -Math.abs(values.amount) : values.amount,
      description: values.description || 'Unnamed transaction',
      category: values.category || 'Uncategorized',
      accountId: values.account,
      type: values.type
    };
    
    addTransaction(newTransaction);
    toast.success('Transaction added successfully!');
    setShowTransactionForm(false);
  };

  const handleViewTransaction = (transaction: any) => {
    // Create a detailed view of transaction for form dialog
    const accountObj = {
      id: transaction.accountId
    };
    
    const viewTransaction = {
      ...transaction,
      account: accountObj,
      // Convert string date to Date object for the form
      date: new Date(transaction.date)
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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search transactions..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="md:w-auto w-full">
          <Filter size={16} className="mr-1" /> Filters <ChevronDown size={16} className="ml-1" />
        </Button>
      </div>

      {Object.entries(transactionsByDate).map(([date, dayTransactions]) => (
        <div key={date} className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {format(new Date(date), 'MMMM d, yyyy')}
          </h2>
          <Card>
            <CardContent className="p-0">
              {dayTransactions.map((transaction) => (
                <div key={transaction.id} className="border-b last:border-b-0 border-border">
                  <button 
                    className="w-full text-left px-4 py-3 flex items-center justify-between"
                    onClick={() => handleViewTransaction(transaction)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-finance-green/10' : 'bg-finance-red/10'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className={`h-5 w-5 text-finance-green`} />
                        ) : (
                          <ArrowDownLeft className={`h-5 w-5 text-finance-red`} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{transaction.description}</h3>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    <div>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-finance-green' : 'text-finance-red'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {filteredTransactions.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No transactions found</p>
          <Button onClick={() => {
            setSelectedTransaction(null);
            setShowTransactionForm(true);
          }}>
            <Plus size={16} className="mr-1" /> Add Your First Transaction
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
