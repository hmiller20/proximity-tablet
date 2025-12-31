/// <reference lib="webworker" />

import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false, // Disabled for better mobile browser compatibility
  runtimeCaching: [
    // Cache RSC requests (App Router client-side navigation)
    {
      matcher: ({ request }) => request.headers.get('Rsc') === '1',
      handler: new NetworkFirst({
        cacheName: 'rsc-cache',
        networkTimeoutSeconds: 3,
      }),
    },
    // Cache page navigations (hard refreshes)
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3,
      }),
    },
    // Cache static assets - CacheFirst for speed
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/_next/static/') ||
        /\.(js|css|woff2?|png|jpe?g|svg|gif|webp|ico)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: 'static-assets-cache',
      }),
    },
    // Cache all other same-origin requests
    {
      matcher: ({ sameOrigin }) => sameOrigin,
      handler: new StaleWhileRevalidate({
        cacheName: 'runtime-cache',
      }),
    },
  ],
});

serwist.addEventListeners();
