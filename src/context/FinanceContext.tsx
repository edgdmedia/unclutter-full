
import React, { createContext, useContext, useState } from 'react';
import { 
  mockUser, 
  mockAccounts, 
  mockTransactions, 
  mockBudgets, 
  mockGoals,
  mockCategories,
  getFinancialSummary,
  User, 
  Account, 
  Transaction, 
  Budget, 
  Goal,
  Category
} from '../data/mockData';

interface FinanceContextType {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  categories: Category[];
  isAuthenticated: boolean;
  financialSummary: {
    totalBalance: number;
    income: number;
    expenses: number;
    savings: number;
  };
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
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

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    // Mock authentication - in a real app, this would call the API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'demo@example.com' && password === 'password') {
          setUser(mockUser);
          setAccounts(mockAccounts);
          setTransactions(mockTransactions);
          setBudgets(mockBudgets);
          setGoals(mockGoals);
          setCategories(mockCategories);
          setIsAuthenticated(true);
          resolve();
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
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

  // Add transaction
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      id: `transaction-${Date.now()}`,
      ...transaction
    };
    setTransactions([newTransaction, ...transactions]);
  };

  // Update transaction
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map((transaction) =>
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    );
  };

  // Delete transaction
  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
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
        financialSummary: getFinancialSummary(),
        login,
        logout,
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
