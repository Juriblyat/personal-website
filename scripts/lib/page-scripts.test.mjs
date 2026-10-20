import { describe, expect, it } from 'vitest';
import { initialScriptUrls, preloadedFontUrls } from './page-scripts.mjs';

describe('initialScriptUrls', () => {
  it('finds script tags and modulepreload links, deduplicated', () => {
    const html = `
      <link rel="modulepreload" href="/_astro/a.js">
      <script type="module" src="/_astro/a.js"></script>
      <script type="module" src="/_astro/b.js"></script>`;
    expect(initialScriptUrls(html)).toEqual(['/_astro/a.js', '/_astro/b.js']);
  });

  it('ignores inline scripts and external origins', () => {
    const html = `<script>console.log(1)</script><script src="https://cdn.example/x.js"></script>`;
    expect(initialScriptUrls(html)).toEqual([]);
  });
});

describe('preloadedFontUrls', () => {
  it('finds preloaded fonts only', () => {
    const html = `
      <link rel="preload" href="/_astro/fonts/a.woff2" as="font" type="font/woff2" crossorigin>
      <link rel="preload" href="/hero.avif" as="image">
      <link rel="stylesheet" href="/x.css">`;
    expect(preloadedFontUrls(html)).toEqual(['/_astro/fonts/a.woff2']);
  });
});
