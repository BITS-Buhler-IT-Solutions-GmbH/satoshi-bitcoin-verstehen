/*  Satoshi PWA — Service Worker
 *  Cache-first for app shell, network-first for API data
 */

const SHELL_CACHE  = 'satoshi-v46';
// shell-hash: 641ca8e55fdf  (gesetzt von scripts/sw-stamp.js — nicht von Hand ändern)
const API_CACHE    = 'satoshi-api-v2';
const API_TTL      = 5 * 60 * 1000;       // 5 minutes — serve cache without refresh
const API_STALE    = 24 * 60 * 60 * 1000; // 24h hard limit for offline fallback
const FETCH_TIMEOUT = 8000;               // 8s — abort slow API calls so SWR can serve cache

const SHELL_FILES = [
  '/',
  '/index.html',
  '/rabbit-hole.js',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png'
];

const API_ORIGINS = [
  'blockchain.info',
  'api.coingecko.com',
  'mempool.space',
  'api.alternative.me'
];

/* ── Install: pre-cache app shell ──────────────────────────────
 * No automatic skipWaiting — index.html shows an update banner
 * and posts {type:'SKIP_WAITING'} when the user accepts.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_FILES))
  );
});

/* ── Activate: purge old caches ──────────────────────────────── */
self.addEventListener('activate', (event) => {
  const keepCaches = new Set([SHELL_CACHE, API_CACHE]);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !keepCaches.has(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── Message handler: skip waiting on demand ─────────────────── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/* ── Fetch: strategy router ──────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // API calls → network-first with TTL cache
  if (API_ORIGINS.some((origin) => url.hostname === origin || url.hostname.endsWith('.' + origin))) {
    event.respondWith(networkFirstWithTTL(request));
    return;
  }

  // Eigene API-Endpunkte (z. B. /api/feed.php) → network-first mit TTL
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithTTL(request));
    return;
  }

  // Fremde Ursprünge (Embeds, Analytics) nicht cachen —
  // sonst frieren Live-Inhalte bis zum nächsten SW-Update ein.
  if (url.origin !== self.location.origin) return;

  // Eigene Shell / statische Dateien → cache-first
  event.respondWith(cacheFirst(request));
});

/* ── Cache-first strategy ────────────────────────────────────── */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline: only fall back to the app shell for navigation requests.
    // For assets (images, fonts, etc.) return a real network error so the
    // browser shows a broken-image icon instead of injecting HTML.
    if (request.mode === 'navigate') {
      return (await caches.match('/index.html')) || Response.error();
    }
    return Response.error();
  }
}

/* ── Stale-while-revalidate for API responses ────────────────────
 * - Within TTL: serve cache immediately, refresh in background.
 * - Stale but within hard limit: serve cache, refresh in background.
 * - Expired / missing: go to network; on failure, return last known
 *   value if available, else a 503.
 */
async function networkFirstWithTTL(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);
  const age = cached
    ? Date.now() - Number(cached.headers.get('sw-cache-time') || 0)
    : Infinity;

  const refresh = fetchWithTimeout(request, FETCH_TIMEOUT)
    .then(async (response) => {
      if (response.ok) await cache.put(request, await timestamp(response.clone()));
      return response;
    })
    .catch(() => null);

  if (cached && age < API_TTL) {
    refresh; // fire-and-forget; keep cache warm
    return cached;
  }
  if (cached && age < API_STALE) {
    const fresh = await refresh;
    return fresh || cached;
  }
  const fresh = await refresh;
  if (fresh) return fresh;
  if (cached) return cached;
  return new Response(JSON.stringify({ error: 'offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function timestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cache-time', Date.now().toString());
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
