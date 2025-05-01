// src/services/storageService.js
import { openDB } from 'idb';

const DB_NAME = 'unclutter_db';
const DB_VERSION = 1;

class StorageService {
    constructor() {
        this.db = null;
        this.init();
    }

    async init() {
        try {
            this.db = await openDB(DB_NAME, DB_VERSION, {
                upgrade(db) {
                    // Journal Store
                    if (!db.objectStoreNames.contains('journal')) {
                        const journalStore = db.createObjectStore('journal', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        journalStore.createIndex('userId', 'userId');
                        journalStore.createIndex('date', 'date');
                        journalStore.createIndex('syncStatus', 'syncStatus');
                    }

                    // Mood Store
                    if (!db.objectStoreNames.contains('mood')) {
                        const moodStore = db.createObjectStore('mood', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        moodStore.createIndex('userId', 'userId');
                        moodStore.createIndex('date', 'date');
                        moodStore.createIndex('syncStatus', 'syncStatus');
                    }

                    // Check-in Store
                    if (!db.objectStoreNames.contains('checkin')) {
                        const checkinStore = db.createObjectStore('checkin', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                        checkinStore.createIndex('userId', 'userId');
                        checkinStore.createIndex('date', 'date');
                        checkinStore.createIndex('type', 'type');
                        checkinStore.createIndex('syncStatus', 'syncStatus');
                    }

                    // Offline Queue Store
                    if (!db.objectStoreNames.contains('offlineQueue')) {
                        db.createObjectStore('offlineQueue', {
                            keyPath: 'id',
                            autoIncrement: true
                        });
                    }
                }
            });

            console.log('IndexedDB initialized successfully');
        } catch (error) {
            console.error('Error initializing IndexedDB:', error);
            throw error;
        }
    }

    // Generic CRUD Operations
    async add(storeName, data) {
        if (!this.db) await this.init();
        try {
            const newData = {
                ...data,
                syncStatus: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const id = await this.db.add(storeName, newData);
            return { id, ...newData };
        } catch (error) {
            console.error(`Error adding data to ${storeName}:`, error);
            throw error;
        }
    }

    async get(storeName, id) {
        if (!this.db) await this.init();
        try {
            return await this.db.get(storeName, id);
        } catch (error) {
            console.error(`Error getting data from ${storeName}:`, error);
            throw error;
        }
    }

    async getAll(storeName, indexName = null, query = null) {
        if (!this.db) await this.init();
        try {
            if (indexName && query) {
                return await this.db.getAllFromIndex(storeName, indexName, query);
            }
            return await this.db.getAll(storeName);
        } catch (error) {
            console.error(`Error getting all data from ${storeName}:`, error);
            throw error;
        }
    }

    async update(storeName, id, data) {
        if (!this.db) await this.init();
        try {
            const existing = await this.get(storeName, id);
            if (!existing) throw new Error('Record not found');

            const updatedData = {
                ...existing,
                ...data,
                syncStatus: 'pending',
                updatedAt: new Date().toISOString()
            };

            await this.db.put(storeName, updatedData);
            return updatedData;
        } catch (error) {
            console.error(`Error updating data in ${storeName}:`, error);
            throw error;
        }
    }

    async delete(storeName, id) {
        if (!this.db) await this.init();
        try {
            await this.db.delete(storeName, id);
            return true;
        } catch (error) {
            console.error(`Error deleting data from ${storeName}:`, error);
            throw error;
        }
    }

    // Offline Queue Management
    async addToOfflineQueue(operation) {
        if (!this.db) await this.init();
        try {
            const queueItem = {
                operation,
                timestamp: new Date().toISOString(),
                retryCount: 0
            };
            await this.db.add('offlineQueue', queueItem);
        } catch (error) {
            console.error('Error adding to offline queue:', error);
            throw error;
        }
    }

    // Network Status Monitoring
    initNetworkMonitoring() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    }

    handleOnline() {
        console.log('Application is online. Starting sync...');
        this.processOfflineQueue();
    }

    handleOffline() {
        console.log('Application is offline. Operations will be queued.');
    }

    async processOfflineQueue() {
        if (!this.db) await this.init();
        try {
            const queue = await this.getAll('offlineQueue');
            for (const item of queue) {
                try {
                    // Process queue item based on operation type
                    // This will be implemented when we set up the API sync
                    console.log('Processing queue item:', item);
                    await this.db.delete('offlineQueue', item.id);
                } catch (error) {
                    console.error('Error processing queue item:', error);
                    // Update retry count
                    await this.update('offlineQueue', item.id, {
                        retryCount: (item.retryCount || 0) + 1,
                        lastError: error.message
                    });
                }
            }
        } catch (error) {
            console.error('Error processing offline queue:', error);
        }
    }
}

// Create and export a single instance
export const storageService = new StorageService();
export default storageService;