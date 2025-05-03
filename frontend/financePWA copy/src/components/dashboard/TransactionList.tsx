
import React from 'react';
import { Wallet, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react';
import { Transaction } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <ArrowDown className="h-4 w-4 text-finance-green" />;
      case 'expense':
        return <ArrowUp className="h-4 w-4 text-finance-red" />;
      case 'transfer':
        return <ArrowLeftRight className="h-4 w-4 text-blue-500" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-1">
      {displayTransactions.length > 0 ? (
        displayTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded-full mr-3">
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
              </div>
            </div>
            <div className={cn(
              "font-medium",
              transaction.amount > 0 ? "text-finance-green" : "text-finance-red"
            )}>
              {transaction.amount > 0 ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        ))
      ) : (
        <div className="py-4 text-center text-muted-foreground">No transactions found</div>
      )}
    </div>
  );
};

export default TransactionList;
