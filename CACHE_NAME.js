const CACHE_NAME = 'hotel-argana-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './demande.html', 
  './styles.css',
  './script.js',
  './manifest.json',
  './offline.html',
  './icons/icon-192x192.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

         
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                if (event.request.url.includes('/api/') ||
                  !event.request.url.startsWith(self.location.origin)) {
                  return;
                }
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        } else if (event.request.destination === 'image') {
          return caches.match('./icons/icon-192x192.svg');
        }
      })
  );
});
self.addEventListener('sync', event => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncRequests());
  }
});

async function syncRequests() {
  try {
    const db = await openDB();
    const pendingRequests = await db.getAll('pending-requests');

    for (const request of pendingRequests) {
      try {
        
        console.log('Syncing request:', request);
        
        await db.delete('pending-requests', request.id);
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Error during sync:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hotel-argana-db', 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-requests')) {
        db.createObjectStore('pending-requests', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = event => resolve({
      db: event.target.result,
      getAll: storeName => {
        return new Promise((resolve, reject) => {
          const transaction = event.target.result.transaction(storeName, 'readonly');
          const store = transaction.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
      add: (storeName, data) => {
        return new Promise((resolve, reject) => {
          const transaction = event.target.result.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.add(data);

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      },
      delete: (storeName, id) => {
        return new Promise((resolve, reject) => {
          const transaction = event.target.result.transaction(storeName, 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.delete(id);

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    });

    request.onerror = () => reject(request.error);
  });
}

self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: './icons/icon-192x192.svg',
    badge: './icons/badge-72x72.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './index.html'
    },
    actions: [
      {
        action: 'view',
        title: 'Voir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        const url = event.notification.data.url;

        
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }

        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});
