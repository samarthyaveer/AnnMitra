// AnnMitra Service Worker - Complete PWA Implementation
// Version 1.0 - Handles caching, offline functionality, and push notifications

const CACHE_NAME = 'annmitra-v1.0.0';
const STATIC_CACHE_NAME = 'annmitra-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'annmitra-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
  // Add critical CSS and JS files here
];

// Routes that should work offline
const OFFLINE_FALLBACK_PAGES = [
  '/',
  '/dashboard',
  '/browse',
  '/profile',
  '/offline.html'
];

// API routes that can be cached
const CACHEABLE_API_ROUTES = [
  '/api/users',
  '/api/listings',
  '/api/notifications'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Cache static assets
        const staticCache = await caches.open(STATIC_CACHE_NAME);
        await staticCache.addAll(STATIC_ASSETS);
        
        console.log('[SW] Static assets cached successfully');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('[SW] Failed to cache static assets:', error);
      }
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(name => 
            name.startsWith('annmitra-') && 
            ![STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME].includes(name)
          )
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          });
        
        await Promise.all(deletePromises);
        
        // Take control of all pages
        await self.clients.claim();
        
        console.log('[SW] Service worker activated successfully');
      } catch (error) {
        console.error('[SW] Failed to activate service worker:', error);
      }
    })()
  );
});

// Fetch event - handle network requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  try {
    // Strategy 1: Network First for API calls (fresh data preferred)
    if (pathname.startsWith('/api/')) {
      return await networkFirstStrategy(request);
    }
    
    // Strategy 2: Stale While Revalidate for static assets
    if (pathname.includes('.')) {
      return await staleWhileRevalidateStrategy(request);
    }
    
    // Strategy 3: Network First with offline fallback for pages
    return await networkFirstWithFallbackStrategy(request);
    
  } catch (error) {
    console.error('[SW] Fetch handler error:', error);
    return await offlinePageFallback(request);
  }
}

// Network First Strategy - Try network first, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Update cache with fresh data
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate Strategy - Serve cache immediately, update in background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch fresh version in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => {
    // Network failed, ignore
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Don't wait for background update
    fetchPromise;
    return cachedResponse;
  }
  
  // No cache, wait for network
  return await fetchPromise;
}

// Network First with Fallback Strategy
async function networkFirstWithFallbackStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await offlinePageFallback(request);
    }
    
    throw error;
  }
}

// Offline page fallback
async function offlinePageFallback(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    return await cache.match('/offline.html') || new Response(
      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  } catch (error) {
    return new Response('Offline', { status: 200, statusText: 'OK' });
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);
  
  let notificationData = {
    title: 'AnnMitra',
    body: 'New notification from AnnMitra',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'annmitra-notification',
    requireInteraction: false,
    actions: []
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data,
        icon: data.icon || notificationData.icon,
        badge: data.badge || notificationData.badge,
        image: data.image,
        actions: data.actions || [
          { action: 'open', title: 'Open App', icon: '/icon-72.png' },
          { action: 'close', title: 'Close', icon: '/icon-72.png' }
        ]
      };
    } catch (error) {
      console.error('[SW] Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      actions: notificationData.actions,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      silent: false
    })
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const action = event.action;
  const notificationData = event.notification.data || {};
  
  if (action === 'close') {
    return;
  }
  
  // Determine the URL to open
  let urlToOpen = '/';
  
  if (action === 'open' || !action) {
    if (notificationData.url) {
      urlToOpen = notificationData.url;
    } else if (notificationData.type) {
      // Route based on notification type
      switch (notificationData.type) {
        case 'listing_claimed':
        case 'pickup_confirmed':
        case 'pickup_ready':
        case 'pickup_completed':
          urlToOpen = '/dashboard';
          break;
        case 'new_listing':
          urlToOpen = '/browse';
          break;
        default:
          urlToOpen = '/dashboard';
      }
    }
  }
  
  event.waitUntil(
    (async () => {
      try {
        // Try to focus existing window first
        const windowClients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });
        
        // Check if app is already open
        for (const client of windowClients) {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin) {
            // Navigate to the desired URL
            if ('navigate' in client) {
              await client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
        
        // No existing window, open new one
        return self.clients.openWindow(urlToOpen);
      } catch (error) {
        console.error('[SW] Error handling notification click:', error);
        return self.clients.openWindow('/');
      }
    })()
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      (async () => {
        try {
          // Handle offline actions when back online
          // This could include syncing offline form submissions, etc.
          console.log('[SW] Background sync completed');
        } catch (error) {
          console.error('[SW] Background sync failed:', error);
        }
      })()
    );
  }
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    // Force cache update
    event.waitUntil(
      caches.delete(DYNAMIC_CACHE_NAME).then(() => {
        console.log('[SW] Dynamic cache cleared');
      })
    );
  }
});

console.log('[SW] Service worker script loaded successfully');
