
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Wallet, PiggyBank, CreditCard, TrendingUp } from 'lucide-react';

interface AccountCardProps {
  name: string;
  balance: number;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  institution: string;
  onClick?: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  name,
  balance,
  type,
  institution,
  onClick,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getIcon = () => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'checking':
        return 'bg-blue-50';
      case 'savings':
        return 'bg-green-50';
      case 'credit':
        return 'bg-purple-50';
      case 'investment':
        return 'bg-amber-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'checking':
        return 'text-blue-500';
      case 'savings':
        return 'text-green-500';
      case 'credit':
        return 'text-purple-500';
      case 'investment':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card
      className={cn(
        "w-full transition-all cursor-pointer hover:shadow-md",
        balance < 0 ? "border-red-200" : "border-gray-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn("p-2 rounded-full", getBackgroundColor())}>
            <div className={getIconColor()}>{getIcon()}</div>
          </div>
          <div className="text-sm text-muted-foreground">{institution}</div>
        </div>
        
        <div className="mt-3">
          <h3 className="font-medium text-sm text-gray-600">{name}</h3>
          <p className={cn(
            "text-lg font-bold mt-1",
            balance < 0 ? "text-finance-red" : "text-finance-blue"
          )}>
            {formatCurrency(balance)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
