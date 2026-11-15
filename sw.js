/* Service Worker for Mochi Pop! Web PWA (v0.9.0) */
const CACHE_NAME = "mochi-pop-v090";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./privacy.html",
  "./styles.css",
  "./i18n.js",
  "./monetization.js",
  "./audio.js",
  "./pet.js",
  "./puzzle.js",
  "./daily-archive.js",
  "./league-rewards.js",
  "./adventure.js",
  "./minigame.js",
  "./achievements.js",
  "./main.js",
  "./assets/sprites/manifest.js",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/mochi-ref.jpg",
  "./assets/sprites/cheer.webp",
  "./assets/sprites/cry.webp",
  "./assets/sprites/dance.webp",
  "./assets/sprites/drink.webp",
  "./assets/sprites/eat.webp",
  "./assets/sprites/fainted.webp",
  "./assets/sprites/fever_party.webp",
  "./assets/sprites/groom.webp",
  "./assets/sprites/idle.webp",
  "./assets/sprites/nervous.webp",
  "./assets/sprites/pet_1.webp",
  "./assets/sprites/pet_2.webp",
  "./assets/sprites/pet_3.webp",
  "./assets/sprites/play_pounce.webp",
  "./assets/sprites/sleep.webp",
  "./assets/sprites/sulk.webp",
  "./assets/sprites/sulk_2.webp",
  "./assets/sprites/tickle.webp",
  "./assets/sprites/track_toy.webp",
  "./assets/sprites/walk_side.webp",
  "./assets/sprites/yawn.webp",
  "./assets/sounds/bell_jingle.mp3",
  "./assets/sounds/cry.mp3",
  "./assets/sounds/eat.mp3",
  "./assets/sounds/fainted.mp3",
  "./assets/sounds/kibble_pour.mp3",
  "./assets/sounds/meow_1.mp3",
  "./assets/sounds/meow_2.mp3",
  "./assets/sounds/purr.mp3",
  "./assets/sounds/sneeze.mp3",
  "./assets/sounds/sulk.mp3",
  "./assets/sounds/toy_squeak.mp3",
  "./assets/sounds/water_lap.mp3",
  "./assets/sounds/yawn.mp3"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(CORE_ASSETS.map((asset) => cache.add(asset)))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isCodeOrHtml = (
    req.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith("version.json")
  );

  if (isCodeOrHtml) {
    event.respondWith(
      fetch(req).then((resp) => {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return resp;
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (resp && resp.status === 200 && resp.type === "basic") {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return resp;
      });
    })
  );
});
