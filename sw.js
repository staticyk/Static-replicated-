importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.bundle.js');
importScripts('https://cdn.jsdelivr.net/npm/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.config.js');

if (typeof UVServiceWorker !== 'undefined') {
  const uv = new UVServiceWorker();
  self.addEventListener('fetch', (event) => {
    if (event.request.url.startsWith(self.location.origin + '/service/')) {
      event.respondWith(uv.fetch(event));
    }
  });
}
