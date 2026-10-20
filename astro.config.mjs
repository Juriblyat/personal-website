// @ts-check

import svelte from '@astrojs/svelte';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  vite: {
    build: {
      // The 3D chunk is intentionally large and lazy; scripts/check-bundle-size.mjs budgets it.
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // All 3D code (our scene + three) lives in one lazy chunk named "scene", which
          // scripts/check-bundle-size.mjs budgets separately from the initial JS.
          manualChunks(id) {
            if (id.includes('/node_modules/three/') || id.includes('/src/scene/')) return 'scene';
          },
        },
      },
    },
  },
  // Geist is self-hosted by Astro at build time: subsetted, with metric-matched fallbacks (no layout shift).
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Geist',
      cssVariable: '--font-sans',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Geist Mono',
      cssVariable: '--font-mono',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
    },
  ],
});
