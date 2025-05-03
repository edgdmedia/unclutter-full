
export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  institution: string;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  accountId: string;
  type: 'income' | 'expense' | 'transfer';
}

export interface Budget {
  id: string;
  category: {
    id: string;
    name: string;
    type: 'income' | 'expense' | 'account' | 'tag';
    description?: string;
  };
  budgetAmount: number;
  spentAmount: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'account' | 'tag';
  description?: string;
  parent?: string;
  usageCount: number;
}

export const mockUser: User = {
  id: '1',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex@example.com',
  phone: '+1 555-123-4567'
};

export const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Primary Checking',
    type: 'checking',
    balance: 2450.32,
    institution: 'Chase Bank',
    lastUpdated: '2025-04-30T12:00:00Z'
  },
  {
    id: '2',
    name: 'Savings',
    type: 'savings',
    balance: 8750.00,
    institution: 'Chase Bank',
    lastUpdated: '2025-04-30T12:00:00Z'
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit',
    balance: -1250.75,
    institution: 'American Express',
    lastUpdated: '2025-04-29T12:00:00Z'
  },
  {
    id: '4',
    name: 'Investment Account',
    type: 'investment',
    balance: 15680.42,
    institution: 'Fidelity',
    lastUpdated: '2025-04-28T12:00:00Z'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-05-01T10:30:00Z',
    amount: -45.99,
    description: 'Grocery Store',
    category: 'Food & Dining',
    accountId: '1',
    type: 'expense'
  },
  {
    id: '2',
    date: '2025-04-30T14:15:00Z',
    amount: -125.00,
    description: 'Electric Bill',
    category: 'Utilities',
    accountId: '1',
    type: 'expense'
  },
  {
    id: '3',
    date: '2025-04-29T09:00:00Z',
    amount: 1250.00,
    description: 'Paycheck',
    category: 'Income',
    accountId: '1',
    type: 'income'
  },
  {
    id: '4',
    date: '2025-04-28T18:30:00Z',
    amount: -55.80,
    description: 'Restaurant',
    category: 'Food & Dining',
    accountId: '3',
    type: 'expense'
  },
  {
    id: '5',
    date: '2025-04-27T12:00:00Z',
    amount: -500.00,
    description: 'Transfer to Savings',
    category: 'Transfer',
    accountId: '1',
    type: 'transfer'
  },
  {
    id: '6',
    date: '2025-04-27T12:00:00Z',
    amount: 500.00,
    description: 'Transfer from Checking',
    category: 'Transfer',
    accountId: '2',
    type: 'transfer'
  }
];

export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Food & Dining',
    type: 'expense',
    description: 'Restaurants, groceries, and food delivery',
    usageCount: 25
  },
  {
    id: '2',
    name: 'Utilities',
    type: 'expense',
    description: 'Electric, water, gas, internet',
    usageCount: 10
  },
  {
    id: '3',
    name: 'Transportation',
    type: 'expense',
    description: 'Gas, public transit, ride services',
    usageCount: 15
  },
  {
    id: '4',
    name: 'Entertainment',
    type: 'expense',
    description: 'Movies, concerts, subscriptions',
    usageCount: 8
  },
  {
    id: '5',
    name: 'Shopping',
    type: 'expense',
    description: 'Clothing, electronics, household items',
    usageCount: 12
  },
  {
    id: '6',
    name: 'Salary',
    type: 'income',
    description: 'Regular employment income',
    usageCount: 5
  },
  {
    id: '7',
    name: 'Investments',
    type: 'income',
    description: 'Dividends, capital gains',
    usageCount: 3
  },
  {
    id: '8',
    name: 'Checking',
    type: 'account',
    description: 'Primary transaction accounts',
    usageCount: 2
  },
  {
    id: '9',
    name: 'Savings',
    type: 'account',
    description: 'Interest-bearing savings accounts',
    usageCount: 1
  },
  {
    id: '10',
    name: 'Vacation',
    type: 'tag',
    description: 'Expenses related to vacations',
    usageCount: 0
  }
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    category: {
      id: '1',
      name: 'Food & Dining',
      type: 'expense'
    },
    budgetAmount: 500.00,
    spentAmount: 325.75,
    month: 4,
    year: 2025
  },
  {
    id: '2',
    category: {
      id: '2',
      name: 'Utilities',
      type: 'expense'
    },
    budgetAmount: 300.00,
    spentAmount: 275.00,
    month: 4,
    year: 2025
  },
  {
    id: '3',
    category: {
      id: '3',
      name: 'Transportation',
      type: 'expense'
    },
    budgetAmount: 200.00,
    spentAmount: 178.50,
    month: 4,
    year: 2025
  },
  {
    id: '4',
    category: {
      id: '4',
      name: 'Entertainment',
      type: 'expense'
    },
    budgetAmount: 150.00,
    spentAmount: 185.25,
    month: 4,
    year: 2025
  },
  {
    id: '5',
    category: {
      id: '5',
      name: 'Shopping',
      type: 'expense'
    },
    budgetAmount: 250.00,
    spentAmount: 120.80,
    month: 4,
    year: 2025
  }
];

export const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 10000.00,
    currentAmount: 5500.00,
    startDate: '2025-01-01T00:00:00Z',
    targetDate: '2025-12-31T00:00:00Z',
    status: 'active'
  },
  {
    id: '2',
    name: 'New Car',
    targetAmount: 25000.00,
    currentAmount: 8750.00,
    startDate: '2024-10-01T00:00:00Z',
    targetDate: '2026-10-01T00:00:00Z',
    status: 'active'
  },
  {
    id: '3',
    name: 'Summer Vacation',
    targetAmount: 3000.00,
    currentAmount: 3000.00,
    startDate: '2025-01-01T00:00:00Z',
    targetDate: '2025-06-01T00:00:00Z',
    status: 'completed'
  }
];

export const getAccountById = (id: string): Account | undefined => {
  return mockAccounts.find(account => account.id === id);
};

export const getFinancialSummary = () => {
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);
  const income = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const savings = income - expenses;

  return {
    totalBalance,
    income,
    expenses,
    savings
  };
};
