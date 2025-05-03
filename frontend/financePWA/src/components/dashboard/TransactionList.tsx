import React from 'react';
import { Wallet, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react';
import { Transaction } from '@/services/transactionsApi';
import { cn } from '@/lib/utils';
import { formatCurrency as formatCurrencyUtil } from '@/utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, limit }) => {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;
  
  // Wrapper to handle string amounts and absolute values
  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return formatCurrencyUtil(Math.abs(numAmount));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
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
                <p className="font-medium text-sm">{transaction.description || transaction.category_name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(transaction.transaction_date)} • {transaction.account_name}</p>
              </div>
            </div>
            <div className={cn(
              "font-medium",
              transaction.type === 'income' ? "text-finance-green" : "text-finance-red"
            )}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
