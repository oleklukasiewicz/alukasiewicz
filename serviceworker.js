const cacheName = "v-s-0-0-1-9";
const serviceWorkerVersion = "03-12-21-v1";
const networkOnlyResources =
    [
        "/v1/"
    ];
const alwaysFreshResources =
    [
        "/item/"
    ];
const itemResources =
    [
        "/resources/"
    ];
const isAlwaysFreshResource = (req) => alwaysFreshResources.find((resource) => req.includes(resource));
const isNetworkOnlyResource = (req) => networkOnlyResources.find((resource) => req.includes(resource));
const isItemResource = (req) => itemResources.find((resource) => req.includes(resource));
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
const cacheResource = (resource) => caches.open(cacheName).then((cache) => caches.match(resource, { ignoreVary: true }).then((res) => !res ? cache.add(resource) : null));
const removeResourceFromCache = (resource) => caches.open(cacheName).then((cache) => cache.delete(resource, { ignoreVary: true, ignoreSearch: true, ignoreMethod: true }));
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
const fetchNetworkFailToCacheIfCached = function (event) {
    event.respondWith(
        caches.open(cacheName).then((cache) =>
            fetch(event.request).then(async (response) => {
                const isCached = await cache.match(event.request, { ignoreVary: true });
                if (isCached)
                    cache.put(event.request, response.clone());
                return response;
            }).catch(() => caches.match(event.request, { ignoreVary: true }))
        )
    );
}
self.addEventListener('install', event => {
    console.log("Service Worker installed");
    caches.open(cacheName).then((cache) => cache.addAll(staticResources));
});
self.addEventListener('fetch', function (event) {
    if (isNetworkOnlyResource(event.request.url)) {
        fetchNetworkOnly(event);
    } else {
        if (isAlwaysFreshResource(event.request.url)) {
            if (isItemResource(event.request.url))
                fetchNetworkFailToCacheIfCached(event);
            else
                fetchNetworkFailToCache(event);
        } else
            fetchStaleWhenRevalidate(event, true);
    }
});
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((keyList) =>
    Promise.all(keyList.map((key) => {
        if (key !== cacheName) return caches.delete(key);
    }))))
);
if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/serviceworker.js', { scope: '/' });