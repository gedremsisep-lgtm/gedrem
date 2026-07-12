/* GEDREM Mobile — service worker minimo (habilita instalacao PWA / atalho na tela inicial) */
const CACHE = 'gedrem-mobile-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });

self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('fetch', (e) => {
  const req = e.request;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  // Só intercepta GET do próprio site (mesma origem).
  // Supabase (banco/fotos), qualquer POST e uploads passam DIRETO, sem interferência do SW.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(fetch(req).catch(() => caches.match(req)));
});
