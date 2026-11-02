// Aura service worker — intentionally minimal.
//
// It exists so the app is installable as a PWA. It does NOT cache app files
// or API responses (so you always get the latest version and live data);
// it only shows a friendly page when a navigation fails while offline.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Aura — Offline</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;
background:#f7f7f5;color:#0c0c0d;text-align:center;padding:24px}
@media (prefers-color-scheme:dark){body{background:#080809;color:#f4f4f2}}
h1{font-family:Georgia,serif;font-weight:400;font-size:40px;margin:0 0 8px}p{opacity:.6;margin:0 0 24px}
button{font:inherit;padding:12px 22px;border-radius:14px;border:0;background:currentColor}
button span{color:#f7f7f5;mix-blend-mode:difference}</style></head>
<body><div><h1>You're offline</h1><p>Check your connection, then try again.</p>
<button onclick="location.reload()"><span>Try again</span></button></div></body></html>`;

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return; // let the network handle everything else
  event.respondWith(
    fetch(event.request).catch(() => new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }))
  );
});
