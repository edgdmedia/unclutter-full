
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter, ChevronRight } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import AccountFormDialog from '@/components/accounts/AccountFormDialog';
import DeleteAccountDialog from '@/components/accounts/DeleteAccountDialog';

const Accounts: React.FC = () => {
  const { accounts } = useFinance();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  
  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Group accounts by type
  const accountsByType = accounts.reduce((grouped, account) => {
    if (!grouped[account.type]) {
      grouped[account.type] = [];
    }
    grouped[account.type].push(account);
    return grouped;
  }, {} as Record<string, typeof accounts>);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  const handleEditAccount = (account: any) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleDeleteAccount = (account: any) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-1" /> Filter
          </Button>
          <Button size="sm" onClick={handleAddAccount}>
            <Plus size={16} className="mr-1" /> Add Account
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Total Balance</p>
            <h2 className="text-3xl font-bold text-finance-blue">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>
        </CardContent>
      </Card>

      {Object.entries(accountsByType).map(([type, accounts]) => (
        <div key={type} className="space-y-2">
          <h2 className="text-lg font-semibold capitalize">{type}</h2>
          <div className="space-y-2">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="w-full text-left px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-finance-light-gray flex items-center justify-center">
                        <span className="text-finance-blue text-lg font-bold">
                          {account.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{account.name}</h3>
                        <p className="text-xs text-muted-foreground">{account.institution}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${account.balance >= 0 ? 'text-finance-green' : 'text-finance-red'}`}>
                        ${Math.abs(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <div className="flex">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleEditAccount(account)}
                        >
                          <span className="sr-only">Edit</span>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {accounts.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">No accounts found</p>
          <Button onClick={handleAddAccount}>
            <Plus size={16} className="mr-1" /> Add Your First Account
          </Button>
        </div>
      )}

      <AccountFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialAccount={selectedAccount}
      />

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        account={selectedAccount}
      />
    </div>
  );
};

export default Accounts;
