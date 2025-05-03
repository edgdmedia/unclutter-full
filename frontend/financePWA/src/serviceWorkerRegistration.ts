// Service Worker Registration

// This function registers the service worker
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = '/service-worker.js';
      
      registerValidSW(swUrl);
      
      // Add listener for online/offline events to trigger sync
      window.addEventListener('online', () => {
        console.log('App is back online, triggering sync');
        navigator.serviceWorker.ready.then(registration => {
          // Register for background sync when we come back online
          if ('SyncManager' in window) {
            registration.sync.register('sync-transactions');
            registration.sync.register('sync-accounts');
            registration.sync.register('sync-categories');
          }
        });
      });
    });
  }
}

// Register the service worker
function registerValidSW(swUrl: string) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      // Check for updates on page load
      registration.update();
      
      // Set up periodic checks for updates
      setInterval(() => {
        registration.update();
        console.log('Checking for service worker updates');
      }, 1000 * 60 * 60); // Check every hour
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log('New content is available and will be used when all tabs for this page are closed.');
              
              // Show notification to user
              if ('Notification' in window && Notification.permission === 'granted') {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification('App Update Available', {
                    body: 'New features are available. Close all tabs to update.',
                    icon: '/assets/icon-192x192.png'
                  });
                });
              }
            } else {
              // At this point, everything has been precached.
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
      
      console.log('ServiceWorker registered successfully');
      
      // Register for background sync if supported
      if ('SyncManager' in window) {
        registration.sync.register('sync-transactions')
          .then(() => console.log('Background sync registered for transactions'))
          .catch(error => console.error('Background sync registration failed:', error));
          
        registration.sync.register('sync-accounts')
          .then(() => console.log('Background sync registered for accounts'))
          .catch(error => console.error('Background sync registration failed:', error));
          
        registration.sync.register('sync-categories')
          .then(() => console.log('Background sync registered for categories'))
          .catch(error => console.error('Background sync registration failed:', error));
      } else {
        console.log('Background sync not supported');
      }
      
      // Set up message listener for service worker communication
      navigator.serviceWorker.addEventListener('message', event => {
        console.log('Received message from service worker:', event.data);
        
        // Handle sync messages
        if (event.data.type === 'SYNC_STARTED') {
          const { entity } = event.data;
          console.log(`Service worker requested sync for ${entity}`);
          
          // Import dynamically to avoid circular dependencies
          import('./services/dbService').then(dbService => {
            dbService.syncOfflineChanges(entity).then(() => {
              // Notify service worker that sync is complete
              navigator.serviceWorker.controller?.postMessage({
                type: 'SYNC_COMPLETED',
                entity
              });
            });
          });
        }
      });
    })
    .catch(error => {
      console.error('Error during service worker registration:', error);
    });
}

// Unregister the service worker
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}

// Request notification permission
export function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      }
    });
  }
}
