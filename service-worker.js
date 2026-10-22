const CACHE_NAME = "d-link-shell-v1";
const APP_SHELL = [
	"./D-link.html",
	"./manifest.webmanifest",
	"./dlink-icon-192.png",
	"./dlink-icon-512.png",
	"./video-library.json",
	"./deami-context.js"
];

self.addEventListener("install", event => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then(cache => cache.addAll(APP_SHELL))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener("activate", event => {
	event.waitUntil(
		caches.keys()
			.then(cacheNames => Promise.all(
				cacheNames
					.filter(cacheName => cacheName.startsWith("d-link-shell-") && cacheName !== CACHE_NAME)
					.map(cacheName => caches.delete(cacheName))
			))
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", event => {
	const request = event.request;
	const url = new URL(request.url);

	if (request.method !== "GET" || url.origin !== self.location.origin) return;

	if (request.mode === "navigate") {
		const isAppEntry = url.pathname === new URL("./D-link.html", self.registration.scope).pathname;
		event.respondWith(
			fetch(request)
				.catch(() => isAppEntry ? caches.match("./D-link.html") : Promise.reject(new Error("Page is unavailable offline.")))
		);
		return;
	}

	const shellAsset = APP_SHELL.some(path => new URL(path, self.location.href).href === url.href);
	if (!shellAsset) return;

	event.respondWith(
		caches.match(request).then(cachedResponse => cachedResponse || fetch(request))
	);
});
