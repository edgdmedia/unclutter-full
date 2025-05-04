// Service Worker for FinancePWA
const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `finance-pwa-cache-${CACHE_VERSION}`;
const STATIC_CACHE_NAME = `finance-pwa-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `finance-pwa-dynamic-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';
const OFFLINE_ASSETS = [
  '/offline.html',
  '/assets/offline.css',
  '/assets/offline-icon.svg'
];

// Install event - cache the offline page and static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install version:', CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      // Cache offline assets
      const offlineCache = await caches.open(CACHE_NAME);
      await offlineCache.addAll(OFFLINE_ASSETS);
      console.log('[ServiceWorker] Cached offline assets');
      
      // Cache static assets (app shell)
      const staticCache = await caches.open(STATIC_CACHE_NAME);
      await staticCache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/version.json',
        '/assets/icons/icon-192x192.png',
        '/assets/icons/icon-512x512.png'
        // Add other important static assets here
      ]);
      console.log('[ServiceWorker] Cached static assets');
    })()
  );
  
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches and handle version updates
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate version:', CACHE_VERSION);
  
  event.waitUntil(
    (async () => {
      // Get all cache names
      const cacheKeys = await caches.keys();
      
      // Delete old caches
      await Promise.all(
        cacheKeys
          .filter(key => {
            // Keep current version caches
            return !key.includes(CACHE_VERSION) && 
                   (key.startsWith('finance-pwa-cache') || 
                    key.startsWith('finance-pwa-static') || 
                    key.startsWith('finance-pwa-dynamic'));
          })
          .map(key => {
            console.log('[ServiceWorker] Deleting old cache:', key);
            return caches.delete(key);
          })
      );
      
      // Take control of all clients
      await self.clients.claim();
      console.log('[ServiceWorker] Claiming clients');
      
      // Notify clients about the update
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATED',
          version: CACHE_VERSION
        });
      });
    })()
  );
});

// Fetch event - handle requests with appropriate caching strategies
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Special handling for version.json to avoid caching
  if (event.request.url.includes('/version.json')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Handle API requests differently
  if (event.request.url.includes('/api/')) {
    // For API requests, try network first, then fall back to offline handling
    event.respondWith(handleApiRequest(event));
    return;
  }
  
  // For static assets, use a cache-first strategy
  if (isStaticAsset(event.request.url)) {
    event.respondWith(handleStaticAsset(event));
    return;
  }
  
  // For HTML pages, use a network-first strategy
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(handleHtmlRequest(event));
    return;
  }
  
  // For all other requests, use a stale-while-revalidate strategy
  event.respondWith(handleDynamicRequest(event));
});

// Check if the URL is for a static asset
function isStaticAsset(url) {
  const staticAssetPatterns = [
    /\.(?:js|css|woff2?|ttf|otf|eot)$/,
    /\/assets\//,
    /\/icons\//,
    /manifest\.json$/
  ];
  
  return staticAssetPatterns.some(pattern => pattern.test(url));
}

// Handle static assets with a cache-first strategy
async function handleStaticAsset(event) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(event.request);
  
  if (cachedResponse) {
    // Return cached response immediately
    // Refresh cache in the background
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
      })
      .catch(() => {});
    
    return cachedResponse;
  }
  
  // If not in cache, fetch from network and cache
  try {
    const response = await fetch(event.request);
    if (response.ok) {
      cache.put(event.request, response.clone());
    }
    return response;
  } catch (error) {
    // If network fails and not in cache, serve the offline page
    const offlineCache = await caches.open(CACHE_NAME);
    return offlineCache.match(OFFLINE_URL);
  }
}

// Handle HTML requests with a network-first strategy
async function handleHtmlRequest(event) {
  try {
    // Try network first
    const response = await fetch(event.request);
    return response;
  } catch (error) {
    // If network fails, try to serve from cache
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(event.request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, serve the offline page
    const offlineCache = await caches.open(CACHE_NAME);
    return offlineCache.match(OFFLINE_URL);
  }
}

// Handle dynamic requests with a stale-while-revalidate strategy
async function handleDynamicRequest(event) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  // Try to get from cache first
  const cachedResponse = await cache.match(event.request);
  
  // Fetch from network to update cache (regardless of whether we have a cached version)
  const fetchPromise = fetch(event.request)
    .then(response => {
      // Only cache valid responses
      if (response.ok) {
        cache.put(event.request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // If network fails and we don't have a cached response, serve offline page
      if (!cachedResponse) {
        return caches.open(CACHE_NAME).then(cache => cache.match(OFFLINE_URL));
      }
    });
  
  // Return cached response if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

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
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    data: data.data,
    vibrate: [100, 50, 100],
    badge: '/assets/icons/badge-72x72.png',
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/assets/icons/android-launchericon-96-96.png'
      }
    ]
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
