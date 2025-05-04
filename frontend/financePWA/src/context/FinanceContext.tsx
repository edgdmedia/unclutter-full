
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as accountsApi from '../services/accountsApi';
import * as dashboardApi from '../services/dashboardApi';
import * as authApi from '../services/authApi';
import * as transactionsApi from '../services/transactionsApi';
import * as categoriesApi from '../services/categoriesApi';
import * as dbService from '../services/dbService';
import { DashboardSummary, DashboardTrends } from '../services/dashboardApi';
import { Transaction } from '../services/transactionsApi';
import { Category } from '../services/categoriesApi';

// For debugging - log when FinanceContext is loaded
console.log('FinanceContext loaded');

// Define types based on API responses instead of mock data
interface User {
  id: string;
  name: string;
  email: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution: string;
}

// Using the Transaction type imported from transactionsApi.ts

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  spent: number;
  period: string;
  category_name: string;
}

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  status: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface FinanceContextType {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  categories: Category[];
  isAuthenticated: boolean;
  // Financial summary is now derived from dashboardSummary
  financialSummary: {
    totalBalance: number;
    income: number;
    expenses: number;
    savings: number;
  };
  dashboardSummary: DashboardSummary | null;
  dashboardTrends: DashboardTrends | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchAccounts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchDashboardSummary: () => Promise<void>;
  fetchDashboardTrends: () => Promise<void>;
  fetchTransactions: (limit?: number) => Promise<void>;
  fetchTransactionsByAccount: (accountId: string) => Promise<void>;
  addAccount: (data: Partial<Account>) => Promise<void>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getAccount: (id: string) => Promise<Account | null>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [dashboardTrends, setDashboardTrends] = useState<DashboardTrends | null>(null);
  const [db, setDb] = useState<any>(null);
  
  // Initialize database when component mounts
  useEffect(() => {
    const initializeDb = async () => {
      try {
        const database = await dbService.initDB();
        setDb(database);
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };
    
    initializeDb();
  }, []);
  
  // Fetch accounts from API with IndexedDB caching
  const fetchAccounts = async () => {
    console.log('fetchAccounts called, isAuthenticated:', isAuthenticated);
    try {
      // First try to get accounts from IndexedDB
      const shouldSyncAccounts = await dbService.shouldSync('accounts');
      
      if (!shouldSyncAccounts) {
        // Use cached accounts if they exist and are fresh enough
        const cachedAccounts = await dbService.getAccounts();
        if (cachedAccounts && cachedAccounts.length > 0) {
          console.log('Using cached accounts from IndexedDB:', cachedAccounts);
          setAccounts(cachedAccounts);
          return;
        }
      }
      
      // If no cached accounts or cache is stale, fetch from API
      console.log('Fetching accounts from API...');
      const res = await accountsApi.getAccounts();
      console.log('API Response:', res);
      
      let accountsData = [];
      
      // Handle different response formats
      if (res && res.success && Array.isArray(res.data)) {
        // Format: { success: true, data: [...] }
        accountsData = res.data;
      } else if (res && res.data && Array.isArray(res.data)) {
        // Format: { data: [...] }
        accountsData = res.data;
      } else if (res && Array.isArray(res)) {
        // Format: [...]
        accountsData = res;
      } else {
        // Unknown format
        console.warn('Unexpected accounts data format:', res);
        accountsData = [];
      }
      
      // Save accounts to IndexedDB
      if (accountsData.length > 0) {
        await dbService.saveAccounts(accountsData);
      }
      
      // Update state
      console.log('Setting accounts:', accountsData);
      setAccounts(accountsData);
    } catch (e) {
      console.error('Error fetching accounts:', e);
      
      // Try to get accounts from IndexedDB as fallback
      try {
        const cachedAccounts = await dbService.getAccounts();
        if (cachedAccounts && cachedAccounts.length > 0) {
          console.log('Using cached accounts as fallback:', cachedAccounts);
          setAccounts(cachedAccounts);
        } else {
          setAccounts([]);
        }
      } catch (dbError) {
        console.error('Error fetching accounts from IndexedDB:', dbError);
        setAccounts([]);
      }
    }
  };

  // Fetch categories from API with IndexedDB caching
  const fetchCategories = async () => {
    console.log('fetchCategories called, isAuthenticated:', isAuthenticated);
    try {
      // First try to get categories from IndexedDB
      const shouldSyncCategories = await dbService.shouldSync('categories');
      
      if (!shouldSyncCategories) {
        // Use cached categories if they exist and are fresh enough
        const cachedCategories = await dbService.getCategories();
        if (cachedCategories && cachedCategories.length > 0) {
          console.log('Using cached categories from IndexedDB:', cachedCategories);
          setCategories(cachedCategories);
          return;
        }
      }
      
      // If no cached categories or cache is stale, fetch from API
      console.log('Fetching categories from API...');
      const res = await categoriesApi.getCategories();
      console.log('Categories API Response:', res);
      
      let categoriesData = [];
      
      // Handle different response formats
      if (res && res.success && Array.isArray(res.data)) {
        // Format: { success: true, data: [...] }
        categoriesData = res.data;
      } else if (res && res.data && Array.isArray(res.data)) {
        // Format: { data: [...] }
        categoriesData = res.data;
      } else if (res && Array.isArray(res)) {
        // Format: [...]
        categoriesData = res;
      } else {
        // Unknown format
        console.warn('Unexpected categories data format:', res);
        categoriesData = [];
      }
      
      // Save categories to IndexedDB
      if (categoriesData.length > 0) {
        await dbService.saveCategories(categoriesData);
      }
      
      // Update state
      console.log('Setting categories:', categoriesData);
      setCategories(categoriesData);
    } catch (e) {
      console.error('Error fetching categories:', e);
      
      // Try to get categories from IndexedDB as fallback
      try {
        const cachedCategories = await dbService.getCategories();
        if (cachedCategories && cachedCategories.length > 0) {
          console.log('Using cached categories as fallback:', cachedCategories);
          setCategories(cachedCategories);
        } else {
          setCategories([]);
        }
      } catch (dbError) {
        console.error('Error fetching categories from IndexedDB:', dbError);
        setCategories([]);
      }
    }
  };

  // Fetch transactions from API
  const fetchTransactions = async (limit: number = 5) => {
    try {
      console.log('Fetching transactions from API, limit:', limit);
      const res = await transactionsApi.getRecentTransactions(limit);
      console.log('Transactions API response:', res);
      
      // Handle different response formats
      if (res && res.success && Array.isArray(res.data)) {
        // Format: { success: true, data: [...] }
        console.log('Setting transactions from res.data array:', res.data);
        setTransactions(res.data);
        
        // Update IndexedDB
        if (db) {
          try {
            const tx = db.transaction('transactions', 'readwrite');
            const store = tx.objectStore('transactions');
            
            // Clear existing transactions
            await store.clear();
            
            // Add new transactions
            for (const transaction of res.data) {
              await store.add(transaction);
            }
            
            console.log('Transactions saved to IndexedDB');
          } catch (dbError) {
            console.error('Error saving transactions to IndexedDB:', dbError);
          }
        }
      } else if (res && res.data && Array.isArray(res.data)) {
        // Format: { data: [...] }
        console.log('Setting transactions from res.data array:', res.data);
        setTransactions(res.data);
        
        // Update IndexedDB
        if (db) {
          try {
            const tx = db.transaction('transactions', 'readwrite');
            const store = tx.objectStore('transactions');
            
            // Clear existing transactions
            await store.clear();
            
            // Add new transactions
            for (const transaction of res.data) {
              await store.add(transaction);
            }
            
            console.log('Transactions saved to IndexedDB');
          } catch (dbError) {
            console.error('Error saving transactions to IndexedDB:', dbError);
          }
        }
      } else if (res && Array.isArray(res)) {
        // Format: [...]
        console.log('Setting transactions from direct array:', res);
        setTransactions(res);
        
        // Update IndexedDB
        if (db) {
          try {
            const tx = db.transaction('transactions', 'readwrite');
            const store = tx.objectStore('transactions');
            
            // Clear existing transactions
            await store.clear();
            
            // Add new transactions
            for (const transaction of res) {
              await store.add(transaction);
            }
            
            console.log('Transactions saved to IndexedDB');
          } catch (dbError) {
            console.error('Error saving transactions to IndexedDB:', dbError);
          }
        }
      } else {
        // Unknown format
        console.warn('Unexpected transactions data format:', res);
        setTransactions([]);
      }
    } catch (e) {
      console.error('Error fetching transactions:', e);
      setTransactions([]);
      
      // Try to load from IndexedDB if online fetch fails
      if (db) {
        try {
          const tx = db.transaction('transactions', 'readonly');
          const store = tx.objectStore('transactions');
          const transactions = await store.getAll();
          
          if (transactions && transactions.length > 0) {
            console.log('Loaded transactions from IndexedDB:', transactions);
            setTransactions(transactions);
          }
        } catch (dbError) {
          console.error('Error loading transactions from IndexedDB:', dbError);
        }
      }
    }
  };
  
  // Track the last fetched account to prevent duplicate calls
  const lastFetchedAccountRef = useRef<string | null>(null);
  const fetchingRef = useRef<boolean>(false);

  // Fetch transactions for a specific account
  const fetchTransactionsByAccount = async (accountId: string) => {
    // Prevent duplicate or rapid consecutive calls for the same account
    if (fetchingRef.current || lastFetchedAccountRef.current === accountId) {
      console.log('Skipping duplicate fetch for account:', accountId);
      return;
    }
    
    fetchingRef.current = true;
    lastFetchedAccountRef.current = accountId;
    try {
      console.log('Fetching transactions for account:', accountId);
      const res = await transactionsApi.getTransactionsByAccount(accountId);
      console.log('Account transactions API response:', res);
      
      // Handle different response formats
      if (res && res.success && Array.isArray(res.data)) {
        // Format: { success: true, data: [...] }
        console.log('Setting account transactions from res.data array:', res.data);
        setTransactions(res.data);
        
        // Update IndexedDB - store with account ID as key
        if (db) {
          try {
            // Check if the accountTransactions store exists
            if (db.objectStoreNames.contains('accountTransactions')) {
              const tx = db.transaction('accountTransactions', 'readwrite');
              const store = tx.objectStore('accountTransactions');
              
              // Store the account transactions with the account ID as key
              await store.put({ accountId, transactions: res.data });
              
              console.log('Account transactions saved to IndexedDB');
            } else {
              console.log('accountTransactions store does not exist, skipping IndexedDB save');
              // Just store in regular transactions store instead
              const tx = db.transaction('transactions', 'readwrite');
              const store = tx.objectStore('transactions');

              // Add transactions to the regular transactions store
              for (const transaction of res.data) {
                if (transaction.account_id === accountId) {
                  await store.put(transaction);
                }
              }
            }
          } catch (dbError) {
            console.error('Error saving account transactions to IndexedDB:', dbError);
          }
        }
      } else if (res && Array.isArray(res)) {
        // Direct array format
        console.log('Setting account transactions from direct array:', res);
        setTransactions(res);

        // Update IndexedDB
        if (db) {
          try {
            // Check if the accountTransactions store exists
            if (db.objectStoreNames.contains('accountTransactions')) {
              const tx = db.transaction('accountTransactions', 'readwrite');
              const store = tx.objectStore('accountTransactions');

              // Store the account transactions with the account ID as key
              await store.put({ accountId, transactions: res });

              console.log('Account transactions saved to IndexedDB');
            } else {
              console.log('accountTransactions store does not exist, skipping IndexedDB save');
              // Just store in regular transactions store instead
              const tx = db.transaction('transactions', 'readwrite');
              const store = tx.objectStore('transactions');

              // Add transactions to the regular transactions store
              for (const transaction of res) {
                if (transaction.account_id === accountId) {
                  await store.put(transaction);
                }
              }
            }
          } catch (dbError) {
            console.error('Error saving account transactions to IndexedDB:', dbError);
          }
        }
      } else {
        // Unknown format or empty response
        console.warn('Unexpected account transactions data format:', res);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching account transactions:', error);
      setTransactions([]);

      // Try to load from IndexedDB if online fetch fails
      if (db) {
        try {
          // Check if the accountTransactions store exists
          if (db.objectStoreNames.contains('accountTransactions')) {
            const tx = db.transaction('accountTransactions', 'readonly');
            const store = tx.objectStore('accountTransactions');
            const accountData = await store.get(accountId);

            if (accountData && accountData.transactions && accountData.transactions.length > 0) {
              console.log('Loaded account transactions from IndexedDB:', accountData.transactions);
              setTransactions(accountData.transactions);
            }
          } else {
            console.log('accountTransactions store does not exist, trying to filter from transactions store');
            // Try to filter from the transactions store instead
            const tx = db.transaction('transactions', 'readonly');
            const store = tx.objectStore('transactions');
            const allTransactions = await store.getAll();

            // Filter transactions by account ID
            const filteredTransactions = allTransactions.filter(
              (transaction) => transaction.account_id === accountId
            );

            if (filteredTransactions.length > 0) {
              console.log('Loaded filtered transactions from IndexedDB:', filteredTransactions);
              setTransactions(filteredTransactions);
            }
          }
        } catch (dbError) {
          console.error('Error loading account transactions from IndexedDB:', dbError);
        }
      }

      // Re-throw to allow component to handle the error
      throw error;
    } finally {
      // Reset fetching state after a short delay to prevent immediate re-fetching
      setTimeout(() => {
        fetchingRef.current = false;
      }, 1000);
    }
  };

  // Automatically fetch accounts, categories, dashboard data, and transactions after successful login or when authenticated
  // Check for token on initial load to restore session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Found token in localStorage, restoring session');
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, fetching data...');
      // Use Promise.all to fetch data in parallel and log when all are complete
      Promise.all([
        fetchAccounts(),
        fetchCategories(),
        fetchDashboardSummary(),
        fetchDashboardTrends(),
        fetchTransactions(5)
      ])
        .then(() => {
          console.log('All data fetched successfully');
          console.log('Accounts count:', accounts.length);
          console.log('Categories count:', categories.length);
        })
        .catch(error => {
          console.error('Error fetching initial data:', error);
        });
    }
  }, [isAuthenticated]);
  
  // Fetch dashboard summary
  const fetchDashboardSummary = async () => {
    try {
      console.log('Fetching dashboard summary...');
      const res = await dashboardApi.getDashboardSummary();
      console.log('Dashboard summary response:', res);
      if (res.success && res.data) {
        setDashboardSummary(res.data);
      }
    } catch (e) {
      console.error('Error fetching dashboard summary:', e);
      setDashboardSummary(null);
    }
  };
  
  // Fetch dashboard trends
  const fetchDashboardTrends = async () => {
    try {
      console.log('Fetching dashboard trends...');
      const res = await dashboardApi.getDashboardTrends();
      console.log('Dashboard trends response:', res);
      if (res.success && res.data) {
        setDashboardTrends(res.data);
      }
    } catch (e) {
      console.error('Error fetching dashboard trends:', e);
      setDashboardTrends(null);
    }
  };
  // Add account
  const addAccount = async (data: Partial<Account>) => {
    try {
      const response = await accountsApi.createAccount(data);
      
      // If the API returns the new account, add it to the accounts state immediately
      if (response && response.success && response.account) {
        // Update the accounts state with the new account
        setAccounts(prevAccounts => [...prevAccounts, response.account]);
        return response.account;
      } else {
        // Fallback to fetching all accounts if the API doesn't return the new account
        await fetchAccounts();
      }
      return response;
    } catch (e) {
      console.error('Error adding account:', e);
      throw e; // Re-throw to allow handling in the component
    }
  };
  // Update account
  const updateAccount = async (id: string, data: Partial<Account>) => {
    try {
      const response = await accountsApi.updateAccount(id, data);
      
      // If the API returns the updated account, update it in the accounts state immediately
      if (response && response.success && response.account) {
        // Update the accounts state with the updated account
        setAccounts(prevAccounts => 
          prevAccounts.map(account => 
            account.id === id ? response.account : account
          )
        );
        return response.account;
      } else {
        // Fallback to fetching all accounts if the API doesn't return the updated account
        await fetchAccounts();
      }
      return response;
    } catch (e) {
      console.error('Error updating account:', e);
      throw e; // Re-throw to allow handling in the component
    }
  };
  // Delete account
  const deleteAccount = async (id: string) => {
    try {
      await accountsApi.deleteAccount(id);
      await fetchAccounts();
    } catch (e) {
      // Optionally handle error
    }
  };
  // Get account detail
  const getAccount = async (id: string): Promise<Account | null> => {
    try {
      const res = await accountsApi.getAccount(id);
      return res.data || null;
    } catch (e) {
      return null;
    }
  };



  // Login function - using real API
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('Calling real login API with:', email);
      
      // Call the real login API
      const response = await authApi.login(email, password);
      console.log('Login response:', response);
      
      // The token is already saved in localStorage by authApi.login
      // We just need to set the user data and authenticated state
      
      // Set user data from response or use minimal data if not available
      setUser(response.user || { id: '1', name: 'User', email: email });
      
      // Initialize with empty arrays to prevent null reference errors
      setAccounts([]);
      setTransactions([]);
      setBudgets([]);
      setGoals([]);
      setCategories([]);
      
      // Set authenticated to trigger API calls
      console.log('Setting isAuthenticated to true to trigger data fetching');
      setIsAuthenticated(true);
      
      console.log('Login successful, authenticated:', true);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      
      // The useEffect will automatically fetch accounts and dashboard data
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setAccounts([]);
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setCategories([]);
    setIsAuthenticated(false);
  };

  // Add transaction using real API
  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      console.log('Adding transaction:', transactionData);
      const response = await transactionsApi.createTransaction(transactionData as any);
      
      if (response.success && response.data) {
        // Add the new transaction to the state
        setTransactions([response.data, ...transactions]);
        return response.data;
      } else {
        throw new Error('Failed to create transaction');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  // Update transaction using real API
  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      console.log('Updating transaction:', updatedTransaction);
      const { id, ...transactionData } = updatedTransaction;
      
      const response = await transactionsApi.updateTransaction(id, transactionData as any);
      
      if (response.success) {
        // Update the transaction in the state
        setTransactions(
          transactions.map((transaction) =>
            transaction.id === id ? updatedTransaction : transaction
          )
        );
        
        // Refresh transactions to get the latest data
        await fetchTransactions(20);
        
        return response;
      } else {
        throw new Error('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  // Delete transaction using real API
  const deleteTransaction = async (id: string) => {
    try {
      console.log('Deleting transaction:', id);
      const response = await transactionsApi.deleteTransaction(id);
      
      if (response.success) {
        // Remove the transaction from the state
        setTransactions(transactions.filter((transaction) => transaction.id !== id));
        return response;
      } else {
        throw new Error('Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  // Calculate financial summary from dashboard data
  // Provide default empty values to prevent blank pages
  const financialSummary = {
    totalBalance: dashboardSummary?.net_balance || 0,
    income: dashboardSummary?.total_income || 0,
    expenses: dashboardSummary?.total_expenses || 0,
    savings: dashboardSummary ? (dashboardSummary.total_income - dashboardSummary.total_expenses) : 0
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        accounts,
        transactions,
        budgets,
        goals,
        categories,
        isAuthenticated,
        financialSummary,
        dashboardSummary,
        dashboardTrends,
        login,
        logout,
        fetchAccounts,
        fetchCategories,
        fetchDashboardSummary,
        fetchDashboardTrends,
        fetchTransactions,
        fetchTransactionsByAccount,
        addAccount,
        updateAccount,
        deleteAccount,
        getAccount,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
