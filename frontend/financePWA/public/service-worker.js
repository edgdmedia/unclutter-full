// Service Worker for FinancePWA
const CACHE_NAME = 'finance-pwa-v1';
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSETS = [
  '/offline.html',
  '/assets/offline.css',
  '/assets/offline-icon.svg'
];

// Install event - cache the offline page and assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache the offline page and assets
      await cache.addAll(OFFLINE_ASSETS);
      console.log('[ServiceWorker] Cached offline page and assets');
    })()
  );
  
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    (async () => {
      // Get all cache names
      const cacheKeys = await caches.keys();
      
      // Delete old caches
      await Promise.all(
        cacheKeys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
      
      // Take control of all clients
      await self.clients.claim();
      console.log('[ServiceWorker] Claiming clients');
    })()
  );
});

// Fetch event - handle offline requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    // For API requests, try network first, then fall back to offline handling
    event.respondWith(handleApiRequest(event));
    return;
  }
  
  // For non-API requests, use a network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(async () => {
        // If network fails, try to serve from cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, serve the offline page
        return cache.match(OFFLINE_URL);
      })
  );
});

// Handle API requests
async function handleApiRequest(event) {
  try {
    // Try network first
    const response = await fetch(event.request);
    return response;
  } catch (error) {
    console.log('[ServiceWorker] API fetch failed, returning offline response');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'You are offline. Your changes will be synced when you reconnect.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background Sync', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  } else if (event.tag === 'sync-accounts') {
    event.waitUntil(syncAccounts());
  } else if (event.tag === 'sync-categories') {
    event.waitUntil(syncCategories());
  }
});

// Sync transactions from IndexedDB to server
async function syncTransactions() {
  try {
    // Open a message channel to communicate with the client
    const allClients = await self.clients.matchAll();
    if (allClients.length === 0) return;
    
    const client = allClients[0];
    
    // Send message to client to start sync
    client.postMessage({
      type: 'SYNC_STARTED',
      entity: 'transactions'
    });
    
    // The actual sync will be handled by the client
    // This is because the service worker doesn't have direct access to IndexedDB
    // The client will listen for this message and perform the sync
    
    console.log('[ServiceWorker] Requested transaction sync from client');
  } catch (error) {
    console.error('[ServiceWorker] Error syncing transactions:', error);
  }
}

// Sync accounts from IndexedDB to server
async function syncAccounts() {
  try {
    const allClients = await self.clients.matchAll();
    if (allClients.length === 0) return;
    
    const client = allClients[0];
    
    client.postMessage({
      type: 'SYNC_STARTED',
      entity: 'accounts'
    });
    
    console.log('[ServiceWorker] Requested account sync from client');
  } catch (error) {
    console.error('[ServiceWorker] Error syncing accounts:', error);
  }
}

// Sync categories from IndexedDB to server
async function syncCategories() {
  try {
    const allClients = await self.clients.matchAll();
    if (allClients.length === 0) return;
    
    const client = allClients[0];
    
    client.postMessage({
      type: 'SYNC_STARTED',
      entity: 'categories'
    });
    
    console.log('[ServiceWorker] Requested category sync from client');
  } catch (error) {
    console.error('[ServiceWorker] Error syncing categories:', error);
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Received message:', event.data);
  
  if (event.data.type === 'SYNC_COMPLETED') {
    console.log(`[ServiceWorker] Sync completed for ${event.data.entity}`);
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received:', event);
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
    data: data.data
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event);
  
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({type: 'window'}).then((clientList) => {
      // If a window client is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow('/dashboard');
      }
    })
  );
});
