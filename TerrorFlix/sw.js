const cacheName = "terrorflix-files";
const assets = [
    "/",
    "index.html",
    "detalles.html",
    "index.js",
    "style.css",
    "stylechico.css",
    "sw.js"
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                cache.addAll(assets)
            })
    )
})

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(res => {
                return res || fetch(event.request);
            })
    )
})

self.addEventListener('activate', (event) => {
    console.log('sw activado');
})


