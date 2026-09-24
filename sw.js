importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.bundle.js');
importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.config.js');

const uv = typeof UVServiceWorker !== 'undefined' ? new UVServiceWorker() : null;

self.addEventListener('fetch', (event) => {
  if (uv && event.request.url.startsWith(self.location.origin + '/service/')) {
    event.respondWith(uv.fetch(event));
  }
});
