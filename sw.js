/* GEDREM Mobile — service worker minimo (habilita instalacao PWA / atalho na tela inicial) */
const CACHE = 'gedrem-mobile-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (e) => {
  // network-first: sempre tenta a rede (app usa dados ao vivo do Supabase);
  // se estiver offline, tenta responder do cache.
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
