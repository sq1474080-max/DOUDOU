const CACHE_NAME = 'star-task-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 安装时缓存核心文件
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 网络优先，断网时使用缓存
self.addEventListener('fetch', (e) => {
  // 只缓存 GET 请求
  if (e.request.method !== 'GET') return;
  
  e.respondWith(
    fetch(e.request).then((response) => {
      // 如果请求成功，把内容存入缓存
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(e.request, response.clone());
        return response;
      });
    }).catch(() => {
      // 如果断网，从缓存读取
      return caches.match(e.request);
    })
  );
});
