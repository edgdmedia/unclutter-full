import { openDB, DBSchema, IDBPDatabase } from 'idb';

// Define conflict resolution strategies
export enum ConflictResolutionStrategy {
  CLIENT_WINS = 'client_wins',  // Local changes override server changes
  SERVER_WINS = 'server_wins',  // Server changes override local changes
  MANUAL = 'manual',           // User must manually resolve the conflict
  NEWEST_WINS = 'newest_wins', // Most recent change wins based on timestamp
  MERGE = 'merge'              // Attempt to merge changes automatically
}

// Define sync status
export enum SyncStatus {
  PENDING = 'pending',         // Change is pending sync
  IN_PROGRESS = 'in_progress', // Sync is in progress
  COMPLETED = 'completed',     // Sync completed successfully
  FAILED = 'failed',           // Sync failed
  CONFLICT = 'conflict'         // Conflict detected during sync
}

// Define the database schema
interface FinanceDB extends DBSchema {
  accounts: {
    key: string;
    value: {
      id: string;
      name: string;
      type_id: string;
      type_name: string;
      balance: string;
      institution: string;
      description?: string;
      is_active: string;
      created_at: string;
      updated_at: string;
      _synced?: boolean; // Track if this item has been synced with server
    };
    indexes: { 'by-name': string };
  };
  accountTransactions: {
    key: string; // accountId
    value: {
      accountId: string;
      transactions: any[];
      lastUpdated: string;
    };
  };
  userSettings: {
    key: string; // 'profile', 'preferences', 'notifications'
    value: any; // Store different types of user settings
  };
  categories: {
    key: string;
    value: {
      id: string;
      profile_id: string;
      name: string;
      type: string; // 'income', 'expense', 'account_type', 'tag'
      parent_id: string | null;
      description?: string;
      is_active: string;
      created_at: string;
      updated_at: string;
      children?: any[];
      _synced?: boolean; // Track if this item has been synced with server
      _serverVersion?: number; // Server version for conflict detection
      _localVersion?: number; // Local version for conflict detection
      _lastModified?: number; // Timestamp of last modification
    };
    indexes: { 'by-type': string; 'by-profile': string };
  };
  transactions: {
    key: string;
    value: {
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
      _synced?: boolean; // Track if this item has been synced with server
      _pendingAction?: 'create' | 'update' | 'delete'; // Track pending actions for offline sync
      _localId?: string; // Local ID for new items created offline
      _serverVersion?: number; // Server version for conflict detection
      _localVersion?: number; // Local version for conflict detection
      _lastModified?: number; // Timestamp of last modification
      _syncStatus?: SyncStatus; // Current sync status
      _conflictResolution?: ConflictResolutionStrategy; // How to resolve conflicts
      _serverData?: any; // Server data for conflict resolution
    };
    indexes: { 'by-date': string; 'by-account': string; 'by-sync': string; 'by-status': string };
  };
  lastSync: {
    key: string;
    value: {
      entity: string;
      timestamp: number;
    };
  };
  offlineQueue: {
    key: string;
    value: {
      id: string;
      entity: 'accounts' | 'categories' | 'transactions';
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      attempts: number; // Number of sync attempts
      lastAttempt: number; // Timestamp of last sync attempt
      error?: string; // Last error message
      status: SyncStatus; // Current sync status
      conflictResolution?: ConflictResolutionStrategy; // How to resolve conflicts
      serverData?: any; // Server data for conflict resolution
      priority: number; // Priority for sync (higher = more important)
    };
    indexes: { 'by-entity': string; 'by-status': string; 'by-priority': string };
  };
  appState: {
    key: string;
    value: {
      key: string;
      value: any;
    };
  };
}

// Database initialization lock to prevent concurrent access during upgrades
let dbPromise: Promise<IDBPDatabase<FinanceDB>> | null = null;
let dbInitializing = false;
let dbInitQueue: Array<{
  resolve: (db: IDBPDatabase<FinanceDB>) => void;
  reject: (error: Error) => void;
}> = [];

// Initialize the database with a lock mechanism to prevent concurrent access during upgrades
export const initDB = async (): Promise<IDBPDatabase<FinanceDB>> => {
  // If we already have a database connection, return it
  if (dbPromise) {
    return dbPromise;
  }
  
  // If database is initializing, queue this request
  if (dbInitializing) {
    console.log('Database is initializing, queuing request');
    return new Promise<IDBPDatabase<FinanceDB>>((resolve, reject) => {
      dbInitQueue.push({ resolve, reject });
    });
  }
  
  // Set initializing flag
  dbInitializing = true;
  
  try {
    // console.log('Initializing IndexedDB database');
    const db = await openDB<FinanceDB>('finance-db', 2, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        
        // Handle database versioning
        if (oldVersion < 1) {
          console.log('Creating database schema version 1');
          
          // Create accounts store
          const accountsStore = db.createObjectStore('accounts', { keyPath: 'id' });
          accountsStore.createIndex('by-name', 'name');
          
          // Create categories store
          const categoriesStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoriesStore.createIndex('by-type', 'type');
          categoriesStore.createIndex('by-profile', 'profile_id');
          
          // Create transactions store
          const transactionsStore = db.createObjectStore('transactions', { keyPath: 'id' });
          transactionsStore.createIndex('by-date', 'transaction_date');
          transactionsStore.createIndex('by-account', 'account_id');
          transactionsStore.createIndex('by-sync', '_synced');
          
          // Create lastSync store for tracking last synchronization
          db.createObjectStore('lastSync', { keyPath: 'entity' });
          
          // Create offlineQueue store for pending operations
          const offlineQueueStore = db.createObjectStore('offlineQueue', { 
            keyPath: 'id',
            autoIncrement: true
          });
          offlineQueueStore.createIndex('by-entity', 'entity');
          
          // Create appState store for app-wide state
          db.createObjectStore('appState', { keyPath: 'key' });
          
          console.log('Created all stores for version 1');
        }
        
        // Version 2: Add accountTransactions store
        if (oldVersion < 2) {
          console.log('Upgrading to schema version 2');
          
          if (!db.objectStoreNames.contains('accountTransactions')) {
            db.createObjectStore('accountTransactions', { keyPath: 'accountId' });
            console.log('Created accountTransactions store');
          }
        }
        
        // Upgrade to version 2 - add new indexes and fields for conflict resolution
        if (oldVersion < 2 && oldVersion > 0) {
          console.log('Upgrading database to version 2 with conflict resolution support');
          
          // Add new indexes to transactions store if it exists
          if (db.objectStoreNames.contains('transactions')) {
            try {
              const txStore = db.transaction('transactions', 'readwrite')
                .objectStore('transactions');
              
              // Add new indexes if they don't exist
              if (!txStore.indexNames.contains('by-status')) {
                txStore.createIndex('by-status', '_syncStatus');
              }
            } catch (error) {
              console.error('Error upgrading transactions store:', error);
            }
          }
          
          // Add new indexes to offlineQueue store if it exists
          if (db.objectStoreNames.contains('offlineQueue')) {
            try {
              const queueStore = db.transaction('offlineQueue', 'readwrite')
                .objectStore('offlineQueue');
              
              // Add new indexes if they don't exist
              if (!queueStore.indexNames.contains('by-status')) {
                queueStore.createIndex('by-status', 'status');
              }
              
              if (!queueStore.indexNames.contains('by-priority')) {
                queueStore.createIndex('by-priority', 'priority');
              }
            } catch (error) {
              console.error('Error upgrading offlineQueue store:', error);
            }
          }
        }
      }
    });
    
    // Store the database promise for future use
    dbPromise = Promise.resolve(db);
    
    // Process any queued requests
    while (dbInitQueue.length > 0) {
      const request = dbInitQueue.shift();
      if (request) {
        request.resolve(db);
      }
    }
    
    console.log('Database initialization complete');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    
    // Reject any queued requests
    while (dbInitQueue.length > 0) {
      const request = dbInitQueue.shift();
      if (request) {
        request.reject(error as Error);
      }
    }
    
    // Clear the promise so we can try again
    dbPromise = null;
    throw error;
  } finally {
    // Reset initializing flag
    dbInitializing = false;
  }
};

// Network status tracking
let isOnline = navigator.onLine;

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('App is online');
  isOnline = true;
  setNetworkStatus(true);
  // Attempt to sync when we come back online
  syncOfflineChanges();
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  isOnline = false;
  setNetworkStatus(false);
});

// Accounts operations
export const saveAccounts = async (accounts: any[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction('accounts', 'readwrite');
  
  // Clear existing accounts
  await tx.objectStore('accounts').clear();
  
  // Add all accounts
  for (const account of accounts) {
    await tx.objectStore('accounts').add(account);
  }
  
  // Update last sync time
  await db.put('lastSync', { entity: 'accounts', timestamp: Date.now() });
  
  await tx.done;
  console.log('Accounts saved to IndexedDB');
};

export const getAccounts = async (): Promise<any[]> => {
  const db = await initDB();
  return db.getAll('accounts');
};

export const getAccount = async (id: string): Promise<any | undefined> => {
  const db = await initDB();
  return db.get('accounts', id);
};

// Categories operations
export const saveCategories = async (categories: any[]): Promise<void> => {
  try {
    console.log('Saving categories to IndexedDB:', categories.length);
    const db = await initDB();
    
    // Use a single transaction for all operations
    const tx = db.transaction('categories', 'readwrite');
    const store = tx.objectStore('categories');
    
    // Get existing categories to preserve local changes
    const existingCategories = await store.getAll();
    const existingMap = new Map(existingCategories.map(cat => [cat.id, cat]));
    
    // Process all categories within the same transaction
    const promises = [];
    
    // Clear existing categories that aren't user-created (profile_id === '0')
    for (const category of existingCategories) {
      // Only remove global categories or categories that haven't been modified locally
      if (category.profile_id === '0' || category._synced) {
        promises.push(store.delete(category.id));
      }
    }
    
    // Add all categories, preserving local changes for user-created ones
    for (const category of categories) {
      // Mark as synced since it came from the server
      category._synced = true;
      category._serverVersion = category.updated_at ? new Date(category.updated_at).getTime() : Date.now();
      category._lastModified = Date.now();
      category.isGlobal = category.profile_id === '0'; // Mark global categories
      
      // If we have a local version with changes, merge appropriately
      const existing = existingMap.get(category.id);
      if (existing && existing._pendingAction && existing.profile_id !== '0') {
        // For user-created categories with pending changes, preserve the local version
        console.log(`Preserving local changes for category ${category.id}`);
        continue;
      }
      
      promises.push(store.put(category));
    }
    
    // Wait for all store operations to complete
    await Promise.all(promises);
    
    // Complete the transaction
    await tx.done;
    
    // Update last sync time (in a separate transaction)
    await db.put('lastSync', { entity: 'categories', timestamp: Date.now() });
    
    console.log('Categories saved to IndexedDB successfully');
  } catch (error) {
    console.error('Error saving categories to IndexedDB:', error);
    throw error;
  }
};

export const getCategories = async (): Promise<any[]> => {
  const db = await initDB();
  return db.getAll('categories');
};

export const getCategoriesByType = async (type: string): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readonly');
  const index = tx.store.index('by-type');
  return index.getAll(type);
};

export const getCategoriesByProfile = async (profileId: string): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction('categories', 'readonly');
  const index = tx.store.index('by-profile');
  return index.getAll(profileId);
};

export const getCategory = async (id: string): Promise<any | undefined> => {
  const db = await initDB();
  return db.get('categories', id);
};

export const saveCategory = async (category: any): Promise<void> => {
  const db = await initDB();
  
  // Set metadata for tracking
  category._synced = false;
  category._localVersion = (category._localVersion || 0) + 1;
  category._lastModified = Date.now();
  
  await db.put('categories', category);
  console.log(`Category ${category.id} saved to IndexedDB`);
};

// Get expense categories (for transaction form)
export const getExpenseCategories = async (): Promise<any[]> => {
  return getCategoriesByType('expense');
};

// Get income categories (for transaction form)
export const getIncomeCategories = async (): Promise<any[]> => {
  return getCategoriesByType('income');
};

// Get tags (for transaction form)
export const getTags = async (): Promise<any[]> => {
  return getCategoriesByType('tag');
};

// Last sync operations
export const getLastSync = async (entity: string): Promise<number> => {
  const db = await initDB();
  const syncInfo = await db.get('lastSync', entity);
  return syncInfo?.timestamp || 0;
};

// Check if we need to sync
export const shouldSync = async (entity: string, cacheTime: number = 5 * 60 * 1000): Promise<boolean> => {
  const lastSync = await getLastSync(entity);
  const now = Date.now();
  return now - lastSync > cacheTime; // Default: sync if older than 5 minutes
};

// Network status management
export const setNetworkStatus = async (online: boolean): Promise<void> => {
  const db = await initDB();
  await db.put('appState', { key: 'networkStatus', value: online });
};

export const getNetworkStatus = async (): Promise<boolean> => {
  const db = await initDB();
  const status = await db.get('appState', 'networkStatus');
  return status?.value ?? navigator.onLine;
};

// Transactions operations with offline support
export const saveTransactions = async (transactions: any[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction('transactions', 'readwrite');
  
  // We don't clear existing transactions, we merge them
  for (const transaction of transactions) {
    // Mark as synced since it came from the server
    transaction._synced = true;
    await tx.objectStore('transactions').put(transaction);
  }
  
  // Update last sync time
  await db.put('lastSync', { entity: 'transactions', timestamp: Date.now() });
  
  await tx.done;
  console.log('Transactions saved to IndexedDB');
};

export const getTransactions = async (limit?: number): Promise<any[]> => {
  const db = await initDB();
  const allTransactions = await db.getAll('transactions');
  
  // Sort by date (newest first)
  allTransactions.sort((a, b) => {
    return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
  });
  
  return limit ? allTransactions.slice(0, limit) : allTransactions;
};

export const getTransaction = async (id: string): Promise<any | undefined> => {
  const db = await initDB();
  return db.get('transactions', id);
};

// Offline queue operations
export const removeFromOfflineQueue = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete('offlineQueue', id);
};

// Register for background sync
export const registerBackgroundSync = async (): Promise<void> => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Register for different sync types
      await registration.sync.register('sync-transactions');
      await registration.sync.register('sync-accounts');
      await registration.sync.register('sync-categories');
      
      console.log('Background sync registered');
    } catch (error) {
      console.error('Error registering for background sync:', error);
    }
  } else {
    console.log('Background sync not supported');
  }
};

// Add item to offline queue with enhanced conflict handling
export const addToOfflineQueue = async (
  entity: 'accounts' | 'categories' | 'transactions', 
  action: 'create' | 'update' | 'delete', 
  data: any,
  conflictResolution: ConflictResolutionStrategy = ConflictResolutionStrategy.NEWEST_WINS
): Promise<string> => {
  const db = await initDB();
  
  // Set default priority based on action type
  let priority = 1; // Default priority
  
  // Deletes should be processed first, then updates, then creates
  if (action === 'delete') priority = 3;
  else if (action === 'update') priority = 2;
  
  const id = await db.add('offlineQueue', {
    entity,
    action,
    data,
    timestamp: Date.now(),
    attempts: 0,
    lastAttempt: 0,
    status: SyncStatus.PENDING,
    conflictResolution,
    priority
  });
  
  console.log(`Added ${action} operation on ${entity} to offline queue with priority ${priority}`);
  
  // Try to register for background sync
  await registerBackgroundSync();
  
  return id.toString();
};

// Get offline queue with filtering options
export const getOfflineQueue = async (
  options: { 
    entity?: 'accounts' | 'categories' | 'transactions',
    status?: SyncStatus,
    limit?: number
  } = {}
): Promise<any[]> => {
  const db = await initDB();
  let queue = await db.getAll('offlineQueue');
  
  // Apply filters
  if (options.entity) {
    queue = queue.filter(item => item.entity === options.entity);
  }
  
  if (options.status) {
    queue = queue.filter(item => item.status === options.status);
  }
  
  // Sort by priority (high to low) and then by timestamp (oldest first)
  queue.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority; // Higher priority first
    }
    return a.timestamp - b.timestamp; // Older items first
  });
  
  // Apply limit if specified
  if (options.limit && options.limit > 0) {
    queue = queue.slice(0, options.limit);
  }
  
  return queue;
};

// Update queue item status
export const updateQueueItemStatus = async (id: string, status: SyncStatus, error?: string): Promise<void> => {
  const db = await initDB();
  const item = await db.get('offlineQueue', id);
  
  if (item) {
    item.status = status;
    item.lastAttempt = Date.now();
    item.attempts += 1;
    
    if (error) {
      item.error = error;
    }
    
    await db.put('offlineQueue', item);
    console.log(`Updated queue item ${id} status to ${status}`);
  }
};

// Handle conflict resolution
export const resolveConflict = async (
  entity: 'accounts' | 'categories' | 'transactions',
  localData: any,
  serverData: any,
  strategy: ConflictResolutionStrategy
): Promise<any> => {
  console.log(`Resolving conflict for ${entity} with strategy ${strategy}`);
  
  switch (strategy) {
    case ConflictResolutionStrategy.CLIENT_WINS:
      return localData;
      
    case ConflictResolutionStrategy.SERVER_WINS:
      return serverData;
      
    case ConflictResolutionStrategy.NEWEST_WINS:
      // Compare timestamps to determine which is newer
      const localTimestamp = new Date(localData._lastModified || localData.updated_at).getTime();
      const serverTimestamp = new Date(serverData.updated_at).getTime();
      
      return localTimestamp > serverTimestamp ? localData : serverData;
      
    case ConflictResolutionStrategy.MERGE:
      // Merge the two objects, with local data taking precedence for overlapping fields
      // except for system fields like id, created_at, etc.
      const merged = { ...serverData };
      
      // Copy all local data fields except system fields
      Object.keys(localData).forEach(key => {
        if (!key.startsWith('_') && key !== 'id' && key !== 'created_at') {
          merged[key] = localData[key];
        }
      });
      
      // Use the most recent updated_at timestamp
      merged.updated_at = new Date().toISOString();
      
      return merged;
      
    case ConflictResolutionStrategy.MANUAL:
    default:
      // For manual resolution, we'll return the server data but mark it for manual resolution
      // The UI will need to handle this case
      return {
        ...serverData,
        _conflictResolution: ConflictResolutionStrategy.MANUAL,
        _localData: localData,
        _serverData: serverData,
        _needsManualResolution: true
      };
  }
};

// Sync offline changes when online with enhanced conflict handling
export const syncOfflineChanges = async (entity?: 'accounts' | 'categories' | 'transactions'): Promise<void> => {
  if (!navigator.onLine) {
    console.log('Cannot sync: device is offline');
    return;
  }
  
  console.log(`Starting sync of offline changes${entity ? ` for ${entity}` : ''}...`);
  
  // Get pending items, filtered by entity if specified
  const queue = await getOfflineQueue({ 
    entity, 
    status: SyncStatus.PENDING,
    limit: 10 // Process in batches to avoid overwhelming the API
  });
  
  if (queue.length === 0) {
    console.log('No offline changes to sync');
    return;
  }
  
  console.log(`Found ${queue.length} offline changes to sync`);
  
  // Import API services dynamically to avoid circular dependencies
  const { api } = await import('./apiClient');
  
  for (const item of queue) {
    try {
      // Mark as in progress
      await updateQueueItemStatus(item.id, SyncStatus.IN_PROGRESS);
      
      // Process based on entity and action
      console.log(`Processing ${item.action} on ${item.entity}:`, item.data);
      
      let result;
      let endpoint = `/${item.entity}`;
      
      // Handle different actions
      switch (item.action) {
        case 'create':
          // For create, we need to check if the item was already created
          // This can happen if a previous sync attempt succeeded but we didn't get the response
          if (item.data._localId) {
            try {
              // Try to find by some unique criteria
              // This is just an example - you'll need to adapt to your API
              const searchParams = new URLSearchParams();
              
              if (item.entity === 'transactions') {
                // Search by amount, date, and account to find potential duplicates
                searchParams.append('amount', item.data.amount.toString());
                searchParams.append('transaction_date', item.data.transaction_date);
                searchParams.append('account_id', item.data.account_id);
              }
              
              const searchRes = await api.get(`${endpoint}?${searchParams.toString()}`);
              
              // If we find a match, assume it's our item that was already created
              if (searchRes.data && Array.isArray(searchRes.data.data) && searchRes.data.data.length > 0) {
                const potentialMatch = searchRes.data.data.find(d => 
                  d.amount == item.data.amount && 
                  d.transaction_date === item.data.transaction_date &&
                  d.account_id == item.data.account_id
                );
                
                if (potentialMatch) {
                  console.log('Found potential match for previously created item:', potentialMatch);
                  result = { data: potentialMatch };
                  break;
                }
              }
            } catch (searchError) {
              console.error('Error searching for potential duplicate:', searchError);
              // Continue with normal create if search fails
            }
          }
          
          // Normal create flow
          result = await api.post(endpoint, item.data);
          break;
          
        case 'update':
          // For update, we need to check for conflicts
          try {
            // Get the current server version
            const currentRes = await api.get(`${endpoint}/${item.data.id}`);
            const serverData = currentRes.data.data || currentRes.data;
            
            // Check if there's a conflict (server version is different from what we last saw)
            if (item.data._serverVersion && serverData.updated_at !== item.data._serverVersion) {
              console.log('Conflict detected during update');
              
              // Resolve the conflict based on the strategy
              const resolvedData = await resolveConflict(
                item.entity,
                item.data,
                serverData,
                item.conflictResolution || ConflictResolutionStrategy.NEWEST_WINS
              );
              
              // If manual resolution is needed, mark as conflict and continue to next item
              if (resolvedData._needsManualResolution) {
                await updateQueueItemStatus(item.id, SyncStatus.CONFLICT);
                continue;
              }
              
              // Update with the resolved data
              result = await api.put(`${endpoint}/${item.data.id}`, resolvedData);
            } else {
              // No conflict, proceed with normal update
              result = await api.put(`${endpoint}/${item.data.id}`, item.data);
            }
          } catch (error) {
            // If the item doesn't exist on the server, handle accordingly
            if (error.response && error.response.status === 404) {
              console.log(`Item ${item.data.id} not found on server, creating instead`);
              result = await api.post(endpoint, item.data);
            } else {
              throw error;
            }
          }
          break;
          
        case 'delete':
          try {
            result = await api.delete(`${endpoint}/${item.data.id}`);
          } catch (error) {
            // If already deleted, consider it a success
            if (error.response && error.response.status === 404) {
              console.log(`Item ${item.data.id} already deleted or not found`);
              result = { success: true };
            } else {
              throw error;
            }
          }
          break;
      }
      
      // After successful sync, update local data and remove from queue
      if (result) {
        // Update local data if needed
        if (item.action !== 'delete' && result.data) {
          const serverData = result.data.data || result.data;
          
          if (item.entity === 'transactions') {
            const db = await initDB();
            
            // For create actions with a temporary ID, we need to delete the temp record
            if (item.action === 'create' && item.data._localId) {
              await db.delete('transactions', item.data.id);
            }
            
            // Save the server version with sync flag
            serverData._synced = true;
            serverData._serverVersion = serverData.updated_at;
            serverData._lastModified = Date.now();
            
            await db.put('transactions', serverData);
          }
        }
        
        // Mark as completed and remove from queue
        await updateQueueItemStatus(item.id, SyncStatus.COMPLETED);
        await removeFromOfflineQueue(item.id);
        console.log(`Successfully synced and removed item ${item.id} from queue`);
      }
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      
      // Update status with error
      const errorMessage = error.message || 'Unknown error';
      await updateQueueItemStatus(item.id, SyncStatus.FAILED, errorMessage);
      
      // If we've tried too many times, mark as failed permanently
      if (item.attempts >= 5) {
        console.log(`Item ${item.id} has failed ${item.attempts} times, giving up`);
        // We could move it to a 'failed' store or mark it differently
      }
    }
  }
  
  // Notify listeners that sync has completed
  window.dispatchEvent(new CustomEvent('syncCompleted', { detail: { entity } }));
  
  console.log('Finished syncing offline changes');
  
  // If we have more items to sync, continue with the next batch
  const remainingCount = (await getOfflineQueue({ entity, status: SyncStatus.PENDING })).length;
  if (remainingCount > 0) {
    console.log(`${remainingCount} items remaining, continuing sync...`);
    await syncOfflineChanges(entity);
  }
};
