/**
 * HoangNgoc Professional Theme v2.0
 * Service Worker for Performance Optimization
 */

const CACHE_NAME = 'hoangngoc-theme-v2.0';
const CACHE_VERSION = '2.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `${CACHE_NAME}-images-${CACHE_VERSION}`;

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/Themes/HoangNgoc/css/hoangngoc-theme.css',
    '/Themes/HoangNgoc/css/hoangngoc-responsive.css',
    '/Themes/HoangNgoc/css/hoangngoc-advanced.css',
    '/Themes/HoangNgoc/css/hoangngoc-performance.css',
    '/Themes/HoangNgoc/js/hoangngoc-theme.js',
    '/Themes/HoangNgoc/js/hoangngoc-advanced.js',
    '/Themes/HoangNgoc/js/hoangngoc-performance.js',
    '/favicon.ico',
    '/apple-touch-icon.png'
];

// External resources to cache
const EXTERNAL_ASSETS = [
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap'
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only'
};

// Route patterns and their cache strategies
const ROUTE_CACHE_CONFIG = [
    {
        pattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cache: IMAGE_CACHE,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 100
    },
    {
        pattern: /\.(?:css|js)$/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cache: STATIC_CACHE,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 50
    },
    {
        pattern: /^https:\/\/fonts\.googleapis\.com/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cache: STATIC_CACHE,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 10
    },
    {
        pattern: /^https:\/\/fonts\.gstatic\.com/,
        strategy: CACHE_STRATEGIES.CACHE_FIRST,
        cache: STATIC_CACHE,
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        maxEntries: 20
    },
    {
        pattern: /^https:\/\/cdn\.jsdelivr\.net/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cache: STATIC_CACHE,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 20
    },
    {
        pattern: /^https:\/\/cdnjs\.cloudflare\.com/,
        strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
        cache: STATIC_CACHE,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 20
    }
];

// ===================================
// Service Worker Event Handlers
// ===================================

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            cacheStaticAssets(),
            cacheExternalAssets()
        ]).then(() => {
            console.log('Service Worker installed successfully');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        cleanupOldCaches().then(() => {
            console.log('Service Worker activated successfully');
            return self.clients.claim();
        })
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', event => {
    const request = event.request;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Find matching cache strategy
    const cacheConfig = findCacheConfig(request.url);
    
    if (cacheConfig) {
        event.respondWith(
            handleRequest(request, cacheConfig)
        );
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// Push notifications
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: data.icon || '/apple-touch-icon.png',
                badge: '/favicon.ico',
                data: data.data
            })
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            self.clients.openWindow(event.notification.data.url)
        );
    }
});

// ===================================
// Cache Management Functions
// ===================================

async function cacheStaticAssets() {
    const cache = await caches.open(STATIC_CACHE);
    return cache.addAll(STATIC_ASSETS);
}

async function cacheExternalAssets() {
    const cache = await caches.open(STATIC_CACHE);
    
    // Cache external assets with error handling
    const cachePromises = EXTERNAL_ASSETS.map(async url => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        } catch (error) {
            console.warn(`Failed to cache external asset: ${url}`, error);
        }
    });
    
    return Promise.all(cachePromises);
}

async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
        name.startsWith(CACHE_NAME) && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE
    );
    
    return Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
}

function findCacheConfig(url) {
    return ROUTE_CACHE_CONFIG.find(config => config.pattern.test(url));
}

// ===================================
// Cache Strategy Implementations
// ===================================

async function handleRequest(request, config) {
    switch (config.strategy) {
        case CACHE_STRATEGIES.CACHE_FIRST:
            return cacheFirst(request, config);
        case CACHE_STRATEGIES.NETWORK_FIRST:
            return networkFirst(request, config);
        case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
            return staleWhileRevalidate(request, config);
        case CACHE_STRATEGIES.NETWORK_ONLY:
            return fetch(request);
        case CACHE_STRATEGIES.CACHE_ONLY:
            return cacheOnly(request, config);
        default:
            return fetch(request);
    }
}

async function cacheFirst(request, config) {
    const cache = await caches.open(config.cache);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse && !isExpired(cachedResponse, config.maxAge)) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
            await cleanupCache(config.cache, config.maxEntries);
        }
        return networkResponse;
    } catch (error) {
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

async function networkFirst(request, config) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(config.cache);
            await cache.put(request, networkResponse.clone());
            await cleanupCache(config.cache, config.maxEntries);
        }
        return networkResponse;
    } catch (error) {
        const cache = await caches.open(config.cache);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

async function staleWhileRevalidate(request, config) {
    const cache = await caches.open(config.cache);
    const cachedResponse = await cache.match(request);
    
    // Start network request in background
    const networkPromise = fetch(request).then(async response => {
        if (response.ok) {
            await cache.put(request, response.clone());
            await cleanupCache(config.cache, config.maxEntries);
        }
        return response;
    }).catch(error => {
        console.warn('Network request failed:', error);
    });
    
    // Return cached response immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Wait for network response if no cache
    return networkPromise;
}

async function cacheOnly(request, config) {
    const cache = await caches.open(config.cache);
    return cache.match(request);
}

// ===================================
// Utility Functions
// ===================================

function isExpired(response, maxAge) {
    if (!maxAge) return false;
    
    const dateHeader = response.headers.get('date');
    if (!dateHeader) return false;
    
    const responseTime = new Date(dateHeader).getTime();
    const now = Date.now();
    
    return (now - responseTime) > maxAge;
}

async function cleanupCache(cacheName, maxEntries) {
    if (!maxEntries) return;
    
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
        const keysToDelete = keys.slice(0, keys.length - maxEntries);
        await Promise.all(
            keysToDelete.map(key => cache.delete(key))
        );
    }
}

async function handleBackgroundSync() {
    // Handle offline actions when back online
    console.log('Background sync triggered');
    
    // Example: sync offline form submissions
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
        try {
            await fetch(action.url, {
                method: action.method,
                headers: action.headers,
                body: action.body
            });
            
            // Remove successful action from offline storage
            await removeOfflineAction(action.id);
        } catch (error) {
            console.warn('Failed to sync offline action:', error);
        }
    }
}

async function getOfflineActions() {
    // Implementation would depend on your offline storage strategy
    // This is a placeholder
    return [];
}

async function removeOfflineAction(actionId) {
    // Implementation would depend on your offline storage strategy
    // This is a placeholder
}

// ===================================
// Performance Monitoring
// ===================================

// Monitor cache hit rates
let cacheHits = 0;
let cacheMisses = 0;

function trackCacheHit() {
    cacheHits++;
    if ((cacheHits + cacheMisses) % 100 === 0) {
        const hitRate = (cacheHits / (cacheHits + cacheMisses)) * 100;
        console.log(`Cache hit rate: ${hitRate.toFixed(2)}%`);
    }
}

function trackCacheMiss() {
    cacheMisses++;
}

// ===================================
// Error Handling
// ===================================

self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

// ===================================
// Debug Information
// ===================================

console.log(`Service Worker loaded: ${CACHE_NAME} v${CACHE_VERSION}`);
console.log('Cache strategies configured:', ROUTE_CACHE_CONFIG.length);
console.log('Static assets to cache:', STATIC_ASSETS.length);
console.log('External assets to cache:', EXTERNAL_ASSETS.length);