// 玄鉴 AI · Service Worker
// 策略：
//  - 静态资源（_next/static、图标、manifest、字体）→ Cache First
//  - 页面导航（HTML）→ Network First（登录后页面可离线查看；未登录不缓存）
//  - 绝不预缓存 '/'（受登录守卫保护，未登录时会 302，缓存会失败）
const CACHE_NAME = 'xj-app-cache-v2';
const OFFLINE_URL = '/offline.html';
const ASSETS = [
  '/manifest.json',
  '/logo.svg',
  '/offline.html',
  '/icon-192.png',
  '/icon-192-maskable.png',
  '/icon-512.png',
  '/maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // 仅处理同源请求
  if (url.origin !== self.location.origin) return

  // API 请求不缓存（登录/鉴权/数据接口必须实时）
  if (url.pathname.startsWith('/api/')) return

  // 导航请求（HTML 页面）→ Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)),
        ),
    )
    return
  }

  // 静态资源 → Cache First（离线可用）
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))
          return response
        })
        .catch(() => caches.match(OFFLINE_URL))
    }),
  )
})
