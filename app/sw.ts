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
  navigationPreload: true,
  runtimeCaching: [
    // Cache pages with NetworkFirst - try network, fallback to cache when offline
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response?.status === 200 ? response : null;
            },
          },
        ],
      }),
    },
    // Cache Next.js data requests
    {
      matcher: ({ url }) => url.pathname.startsWith('/_next/data/'),
      handler: new NetworkFirst({
        cacheName: 'next-data-cache',
        networkTimeoutSeconds: 3,
      }),
    },
    // Cache static assets (JS, CSS, images) - CacheFirst for speed
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
