import { api } from './apiClient';
import * as dbService from './dbService';
import { v4 as uuidv4 } from 'uuid';

// Helper to dispatch queue change event
const notifyQueueChanged = () => {
  window.dispatchEvent(new Event('offlineQueueChanged'));
};

export interface Transaction {
  id: string;
  profile_id?: string;
  account_id: string;
  category_id: string;
  amount: string | number;
  transaction_date: string;
  description: string | null;
  notes: string | null;
  type: string;
  created_at?: string;
  updated_at?: string;
  account_name?: string;
  category_name?: string;
  tags?: any[];
  attachments?: any[];
  _synced?: boolean;
  _pendingAction?: 'create' | 'update' | 'delete';
  _localId?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    total: number;
    per_page: number;
    page: number;
    total_pages: number;
  };
}

// Get recent transactions with offline support (default to 5)
export const getRecentTransactions = async (limit: number = 5) => {
  try {
    // First try to get from IndexedDB
    const cachedTransactions = await dbService.getTransactions(limit);
    
    // If we're offline, just return cached data
    if (!navigator.onLine) {
      console.log('Offline: Using cached transactions');
      return { success: true, data: cachedTransactions };
    }
    
    // If we're online, try to fetch from API
    try {
      console.log(`Fetching ${limit} recent transactions from API`);
      const res = await api.get('/transactions', {
        params: {
          per_page: limit,
          page: 1,
          order: 'desc',
          order_by: 'transaction_date'
        }
      });
      
      console.log('API Response:', res.data);
      
      // Save to IndexedDB for offline use
      if (res.data && (res.data.data || Array.isArray(res.data))) {
        const transactions = res.data.data || res.data;
        await dbService.saveTransactions(transactions);
      }
      
      return res.data;
    } catch (error) {
      console.error('API error, falling back to cached data:', error);
      return { success: true, data: cachedTransactions };
    }
  } catch (error) {
    console.error('Error getting recent transactions:', error);
    throw error;
  }
};

// Get transaction by ID with offline support
export const getTransaction = async (id: string) => {
  try {
    // First try to get from IndexedDB
    const cachedTransaction = await dbService.getTransaction(id);
    
    // If we're offline, just return cached data
    if (!navigator.onLine) {
      console.log(`Offline: Using cached transaction ${id}`);
      if (cachedTransaction) {
        return { success: true, data: cachedTransaction };
      } else {
        throw new Error(`Transaction with ID ${id} not found in offline storage`);
      }
    }
    
    // If we're online, try to fetch from API
    try {
      console.log(`Fetching transaction ${id} from API`);
      const res = await api.get(`/transactions/${id}`);
      console.log('API Response:', res.data);
      
      // Save to IndexedDB for offline use
      if (res.data && (res.data.data || res.data)) {
        const transaction = res.data.data || res.data;
        transaction._synced = true;
        await dbService.initDB().then(db => db.put('transactions', transaction));
      }
      
      return res.data;
    } catch (error) {
      console.error(`API error, falling back to cached transaction ${id}:`, error);
      if (cachedTransaction) {
        return { success: true, data: cachedTransaction };
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error getting transaction ${id}:`, error);
    throw error;
  }
};

// Create a new transaction
export interface CreateTransactionData {
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  transaction_date: string;
  category_id: number | string;
  description?: string;
  notes?: string;
  account_id: number | string;
  tags?: (number | string)[];
  attachments?: any[];
}

export const createTransaction = async (data: CreateTransactionData) => {
  try {
    // Generate a temporary ID for offline use
    const tempId = `temp_${uuidv4()}`;
    
    // Create a transaction object with the temporary ID
    const transaction: Transaction = {
      id: tempId,
      ...data,
      description: data.description || null,
      notes: data.notes || null,
      _synced: false,
      _pendingAction: 'create',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save to IndexedDB first
    const db = await dbService.initDB();
    await db.put('transactions', transaction);
    
    // If offline, add to queue and return the local transaction
    if (!navigator.onLine) {
      console.log('Offline: Queuing transaction creation');
      await dbService.addToOfflineQueue('transactions', 'create', transaction);
      notifyQueueChanged();
      return { success: true, data: transaction, offline: true };
    }
    
    // If online, try to create via API
    console.log('Creating transaction via API:', data);
    const res = await api.post('/transactions', data);
    console.log('API Response:', res.data);
    
    // Update the local copy with the server response
    if (res.data && (res.data.data || res.data)) {
      const serverTransaction = res.data.data || res.data;
      serverTransaction._synced = true;
      
      // Replace the temporary transaction with the server version
      await db.delete('transactions', tempId);
      await db.put('transactions', serverTransaction);
    }
    
    return res.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    
    // If it's a network error, we've already saved locally, so just return success
    if (error.message?.includes('Network Error') || !navigator.onLine) {
      const db = await dbService.initDB();
      const transaction = await db.get('transactions', `temp_${tempId}`);
      return { success: true, data: transaction, offline: true };
    }
    
    throw error;
  }
};

// Update a transaction with offline support
export const updateTransaction = async (id: string, data: Partial<CreateTransactionData>) => {
  try {
    // First, get the current transaction from IndexedDB
    const db = await dbService.initDB();
    const currentTransaction = await db.get('transactions', id);
    
    if (!currentTransaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    // Update the transaction
    const updatedTransaction = {
      ...currentTransaction,
      ...data,
      _synced: false,
      _pendingAction: 'update',
      updated_at: new Date().toISOString()
    };
    
    // Save to IndexedDB
    await db.put('transactions', updatedTransaction);
    
    // If offline, add to queue and return the updated transaction
    if (!navigator.onLine) {
      console.log('Offline: Queuing transaction update');
      await dbService.addToOfflineQueue('transactions', 'update', updatedTransaction);
      notifyQueueChanged();
      return { success: true, data: updatedTransaction, offline: true };
    }
    
    // If online, try to update via API
    console.log(`Updating transaction ${id} via API:`, data);
    const res = await api.put(`/transactions/${id}`, data);
    console.log('API Response:', res.data);
    
    // Update the local copy with the server response
    if (res.data && (res.data.data || res.data)) {
      const serverTransaction = res.data.data || res.data;
      serverTransaction._synced = true;
      await db.put('transactions', serverTransaction);
    }
    
    return res.data;
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    
    // If it's a network error, we've already saved locally, so just return success
    if (error.message?.includes('Network Error') || !navigator.onLine) {
      const transaction = await dbService.getTransaction(id);
      return { success: true, data: transaction, offline: true };
    }
    
    throw error;
  }
};

// Delete a transaction with offline support
export const deleteTransaction = async (id: string) => {
  try {
    // First, get the current transaction from IndexedDB
    const db = await dbService.initDB();
    const transaction = await db.get('transactions', id);
    
    if (!transaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    
    // Mark as pending delete but don't remove yet
    transaction._pendingAction = 'delete';
    transaction._synced = false;
    await db.put('transactions', transaction);
    
    // If offline, add to queue
    if (!navigator.onLine) {
      console.log('Offline: Queuing transaction deletion');
      await dbService.addToOfflineQueue('transactions', 'delete', { id });
      notifyQueueChanged();
      return { success: true, message: 'Transaction queued for deletion', offline: true };
    }
    
    // If online, try to delete via API
    console.log(`Deleting transaction ${id} via API`);
    const res = await api.delete(`/transactions/${id}`);
    console.log('API Response:', res.data);
    
    // Remove from IndexedDB after successful API call
    await db.delete('transactions', id);
    
    return res.data;
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error);
    
    // If it's a network error, we've already marked it for deletion locally
    if (error.message.includes('Network Error') || !navigator.onLine) {
      return { success: true, message: 'Transaction queued for deletion', offline: true };
    }
    
    throw error;
  }
};
