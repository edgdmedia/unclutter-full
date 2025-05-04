import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash, Filter, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinance } from '@/context/FinanceContext';
import TransactionList from '@/components/dashboard/TransactionList';
import TransactionFormDialog from '@/components/transactions/TransactionFormDialog';
import AccountFormDialog from '@/components/accounts/AccountFormDialog';
import DeleteAccountDialog from '@/components/accounts/DeleteAccountDialog';
import { toast } from '@/components/ui/sonner';
import { formatCurrency } from '@/utils/formatters';

const AccountDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  
  const {
    accounts,
    transactions,
    fetchAccounts,
    fetchTransactionsByAccount,
    addTransaction,
    updateAccount,
    deleteAccount
  } = useFinance();

  // Find the account in the accounts list
  const account = accounts.find(acc => acc.id === id);
  
  // Ensure account data is loaded
  useEffect(() => {
    if (!account && accounts.length === 0) {
      fetchAccounts();
    }
  }, [id, accounts, fetchAccounts]);

  // State for tracking transaction loading
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(false);
  const [hasLoadedTransactions, setHasLoadedTransactions] = useState(false);

  // Fetch account transactions when component mounts or when account ID changes
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const loadTransactions = async () => {
      if (id && !hasLoadedTransactions && isMounted) {
        setTransactionsLoading(true);
        setTransactionsError(false);
        
        // Add a small delay to prevent rapid consecutive calls
        timeoutId = setTimeout(async () => {
          try {
            if (isMounted) {
              await fetchTransactionsByAccount(id);
              if (isMounted) {
                setHasLoadedTransactions(true);
              }
            }
          } catch (error) {
            console.error('Error loading transactions:', error);
            if (isMounted) {
              setTransactionsError(true);
            }
          } finally {
            if (isMounted) {
              setTransactionsLoading(false);
            }
          }
        }, 300);
      }
    };
    
    loadTransactions();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [id, fetchTransactionsByAccount, hasLoadedTransactions]);

  // If accounts are empty, fetch them
  useEffect(() => {
    if (accounts.length === 0) {
      fetchAccounts();
    }
  }, [accounts.length, fetchAccounts]);

  const handleAddTransaction = async (values: any) => {
    try {
      setIsLoading(true);
      
      // Format transaction data for the API
      const newTransaction = {
        transaction_date: values.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        amount: values.amount,
        description: values.description || 'Unnamed transaction',
        category_id: values.category || '1', // Default to first category if none selected
        account_id: id, // Use the current account ID
        type: values.type,
        tags: values.tags || [],
        notes: values.notes || ''
      };
      
      // Call the API method
      await addTransaction(newTransaction as any);
      toast.success('Transaction added successfully!');
      setShowTransactionForm(false);
      
      // Refresh transactions list for this account
      await fetchTransactionsByAccount(id as string);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAccount = async (values: any) => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await updateAccount(id, values);
      toast.success('Account updated successfully!');
      setShowEditForm(false);
    } catch (error) {
      console.error('Failed to update account:', error);
      toast.error('Failed to update account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await deleteAccount(id);
      toast.success('Account deleted successfully!');
      navigate('/accounts');
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (!account) {
    return (
      <div className="p-4 text-center">
        <p>Loading account details...</p>
        {accounts.length > 0 && (
          <div className="mt-4">
            <p>Account not found.</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => navigate('/accounts')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Accounts
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header with back button and account actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate('/accounts')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{account.name}</h1>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowEditForm(true)}
          >
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-1 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Account summary card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <h2 className="text-3xl font-bold text-finance-blue">
                {formatCurrency(typeof account.balance === 'string' ? parseFloat(account.balance) : account.balance)}
              </h2>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Type</p>
              <h3 className="text-xl font-semibold">{account.type_name}</h3>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Institution</p>
              <h3 className="text-xl font-semibold">{account.institution}</h3>
            </div>
          </div>
          {account.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">Description</p>
              <p>{account.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for transactions and other account details */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <Button 
            onClick={() => setShowTransactionForm(true)}
          >
            <Plus className="mr-1 h-4 w-4" /> Add Transaction
          </Button>
        </div>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-1 h-4 w-4" /> Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Loading transactions...</p>
                </div>
              ) : transactionsError ? (
                <div className="py-8 text-center">
                  <p className="text-finance-red mb-2">Error loading transactions</p>
                  <p className="text-muted-foreground mb-4">There was a problem fetching transactions for this account.</p>
                  <Button 
                    onClick={() => {
                      setTransactionsLoading(true);
                      setTransactionsError(false);
                      setHasLoadedTransactions(false);
                    }}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : transactions.length > 0 ? (
                <TransactionList transactions={transactions} />
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No transactions found for this account.</p>
                  <Button 
                    onClick={() => setShowTransactionForm(true)} 
                    className="mt-4"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Add Transaction
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Account analytics coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Form Dialog */}
      <TransactionFormDialog
        open={showTransactionForm}
        onOpenChange={setShowTransactionForm}
        onSubmit={handleAddTransaction}
        isLoading={isLoading}
        initialAccount={id}
      />

      {/* Account Edit Form Dialog */}
      <AccountFormDialog
        open={showEditForm}
        onOpenChange={setShowEditForm}
        initialAccount={account}
        onSubmit={handleUpdateAccount}
      />

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        account={account}
        onConfirmDelete={handleDeleteAccount}
      />
    </div>
  );
};

export default AccountDetail;
