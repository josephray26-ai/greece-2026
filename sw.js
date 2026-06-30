// Greece 2026 — offline service worker
// Precaches the app shell + displayed images so the app works offline after
// the first online visit. Audio/video stream (not precached). The unused
// full-size day itinerary PNGs are intentionally excluded.
const CACHE = 'greece-2026-v112';
const PRECACHE = [
  "./",
  "index.html",
  "manifest.json",
  "assets/cta-athens.jpg",
  "assets/cta-cruise.jpg",
  "assets/cta-santorini.jpg",
  "assets/day0-info.jpg",
  "assets/day1-info.jpg",
  "assets/cruise-details.pdf",
  "assets/day1-map-aegean.jpg",
  "assets/day10-info.png",
  "assets/day2-infographic.jpg",
  "assets/day3-infographic.jpg",
  "assets/day4-infographic.jpg",
  "assets/day5-infographic.jpg",
  "assets/day6-infographic.jpg",
  "assets/day7-bible.png",
  "assets/day7-info.jpg",
  "assets/day8-infographic.jpg",
  "assets/day8-map-philippi.jpg",
  "assets/day8-map-thessaloniki.jpg",
  "assets/day9-info.jpg",
  "assets/hero-1.jpg",
  "assets/hero-10.jpg",
  "assets/hero-2.jpg",
  "assets/hero-3.jpg",
  "assets/hero-4.jpg",
  "assets/hero-5.jpg",
  "assets/hero-6.jpg",
  "assets/hero-7.jpg",
  "assets/hero-8.jpg",
  "assets/hero-9.jpg",
  "assets/hero-logo.png",
  "assets/home-aerial.jpg",
  "assets/icon-192.png",
  "assets/icon-512.png"
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(PRECACHE.map((url) =>
        cache.add(url).catch((err) => console.warn('[sw] precache skip', url, err))
      ))
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (/\.(m4a|mp3|mp4|mov)$/i.test(url.pathname)) return;

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
