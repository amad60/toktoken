const CACHE_NAME = 'toktok-v1';
const OFFLINE_URL = '/';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

const _scheduledTimers = {};

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_TIMER') {
    const { activityId, activityName, delayMs } = event.data;
    if (_scheduledTimers[activityId]) clearTimeout(_scheduledTimers[activityId]);
    _scheduledTimers[activityId] = setTimeout(() => {
      self.registration.showNotification('⏰ Time is up!', {
        body: activityName + ' timer has finished!',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: 'timer-' + activityId,
        renotify: true,
        requireInteraction: true,
      });
      delete _scheduledTimers[activityId];
    }, delayMs);
  }
  if (event.data?.type === 'CANCEL_TIMER') {
    const { activityId } = event.data;
    if (_scheduledTimers[activityId]) {
      clearTimeout(_scheduledTimers[activityId]);
      delete _scheduledTimers[activityId];
    }
  }
});
