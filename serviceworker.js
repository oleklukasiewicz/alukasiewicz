const cacheName = "v-s-0-0-1-8";
const serviceWorkerVersion = "01-06-21-v1";
const networkOnlyFolder = "/download/";
const firebaseFolder = "/v1/"
const noCacheResources = ["/item/items.js"];
const staticResources = [
    "/",
    "/index.html",
    "/firebase.js",
    "/serviceworker.js",
    "/manifest.webmanifest",
    "/css/global.css",
    "/item/items.js",
    "/js/prerender.js",
    "/js/postrender.js",
    "/js/config.js",
    "/font/micon_nb.svg",
    "/font/micon_nb.woff2",
    "/img/image_error.webp",
    "/img/profile.webp",
    "/img/profile-dark.webp",
    "/icon/favicon-32x32.png"
];
const isnetworkOnly = (url) => url.includes(networkOnlyFolder) || url.includes(firebaseFolder);
const isDynamic = (res) => noCacheResources.find((item) => (location.origin + item) == res)
const cacheIfRequired = (resource) => caches.open(cacheName).then((cache) => caches.match(resource, { ignoreVary: true }).then((res) => !res ? cache.add(resource) : null));
const removeFromCache = (resource) => caches.open(cacheName).then((cache) => cache.delete(resource, { ignoreVary: true, ignoreSearch: true, ignoreMethod: true }));
const fetchNetworkFailToCache = function (event) {
    event.respondWith(
        caches.open(cacheName).then((cache) =>
            fetch(event.request).then((response) => {
                cache.put(event.request, response.clone());
                return response;
            }).catch(() => caches.match(event.request, { ignoreVary: true }))
        )
    );
}
const fetchStaleWhenRevalidate = function (event, putInCache = true) {
    event.respondWith(async function () {
        const cache = await caches.open(cacheName);
        const cachedResponsePromise = await cache.match(event.request, { ignoreVary: true });
        const networkResponsePromise = fetch(event.request).catch(() => console.log("Loaded from cache: " + event.request.url))
        event.waitUntil(async function () {
            const networkResponse = await networkResponsePromise;
            if (networkResponse && (putInCache == true || (putInCache == "only-if-cache" && cachedResponsePromise)))
                await cache.put(event.request, networkResponse.clone())
        }())
        return cachedResponsePromise || networkResponsePromise;
    }())
}
const fetchNetworkOnly = (event) => event.respondWith(fetch(event.request));
self.addEventListener('install', event => {
    console.log("Service Worker installed");
    caches.open(cacheName).then((cache) => cache.addAll(staticResources));
});
self.addEventListener('fetch', function (event) {
    if (!isnetworkOnly(event.request.url)) {
        if (isDynamic(event.request.url))
            fetchNetworkFailToCache(event);
        else
            fetchStaleWhenRevalidate(event, true);
    } else
        fetchStaleWhenRevalidate(event, "only-if-cache");
});
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((keyList) =>
    Promise.all(keyList.map((key) => {
        if (key !== cacheName) return caches.delete(key);
    }))))
);
if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/serviceworker.js', { scope: '/' });