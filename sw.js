/* GEDREM Mobile — service worker
   Objetivo: (1) funcionar OFFLINE (regiões sem rede) e (2) manter o app SEMPRE atualizado quando há internet.
   Estratégia: network-first com cache de fallback.
     • Online  -> busca a versão nova na rede e atualiza o cache  (auto-atualização)
     • Offline -> serve a última versão guardada no cache          (funciona sem rede)
   O banco de dados (IndexedDB) e o Supabase (POST/fotos) NÃO passam pelo cache. */
const CACHE = 'gedrem-mobile-v2';
const CORE = [
  'GEDREM_Mobile.html',
  'manifest.webmanifest',
  'gedrem-192.png',
  'gedrem-512.png',
  'gedrem-180.png',
  'gedrem-maskable-512.png',
  'gedrem-32.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => {}))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  // Só intercepta GET do próprio site. Supabase (banco/fotos), POST e uploads passam DIRETO.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    try {
      // ONLINE: tenta a rede primeiro (garante versão mais nova) e atualiza o cache.
      const net = await fetch(req);
      if (net && net.ok) {
        const c = await caches.open(CACHE);
        c.put(req, net.clone()).catch(() => {});
      }
      return net;
    } catch (err) {
      // OFFLINE: serve do cache (ignorando ?v= para casar qualquer versão guardada).
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit) return hit;
      const home = await caches.match('GEDREM_Mobile.html', { ignoreSearch: true });
      if (home) return home;
      throw err;
    }
  })());
});
