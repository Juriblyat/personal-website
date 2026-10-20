// Enforces the JS weight budgets from docs/PLAN.md (see budgets.json).
//  - Initial JS: every script a page loads up front (<script src>, modulepreload), gzipped.
//  - Fonts: preloaded font files per page (count and total size).
//  - Lazy 3D: chunks matching lazy3dChunkPattern, which are only fetched via dynamic import.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { initialScriptUrls, preloadedFontUrls } from './lib/page-scripts.mjs';

const DIST = 'dist';
const budgets = JSON.parse(readFileSync('budgets.json', 'utf8'));
const lazy3d = new RegExp(budgets.lazy3dChunkPattern);

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  );
const gzipKb = (file) => gzipSync(readFileSync(file)).length / 1024;

const files = walk(DIST);
const failures = [];

for (const page of files.filter((f) => f.endsWith('.html'))) {
  const html = readFileSync(page, 'utf8');
  const urls = initialScriptUrls(html);
  const total = urls.reduce((sum, u) => sum + gzipKb(join(DIST, u)), 0);
  const label = `${relative(DIST, page)} initial JS`;
  console.log(`${label}: ${total.toFixed(1)} / ${budgets.initialJsGzipKb} KB gzip`);
  if (total > budgets.initialJsGzipKb) failures.push(label);

  const fonts = preloadedFontUrls(html);
  const fontKb = fonts.reduce((sum, u) => sum + statSync(join(DIST, u)).size / 1024, 0);
  const fontLabel = `${relative(DIST, page)} preloaded fonts`;
  console.log(
    `${fontLabel}: ${fonts.length} / ${budgets.preloadedFontFiles} files, ${fontKb.toFixed(1)} / ${budgets.preloadedFontKb} KB`,
  );
  if (fonts.length > budgets.preloadedFontFiles || fontKb > budgets.preloadedFontKb) {
    failures.push(fontLabel);
  }
}

const total3d = files
  .filter((f) => f.endsWith('.js') && lazy3d.test(f))
  .reduce((sum, f) => sum + gzipKb(f), 0);
console.log(`lazy 3D bundle: ${total3d.toFixed(1)} / ${budgets.lazy3dGzipKb} KB gzip`);
if (total3d > budgets.lazy3dGzipKb) failures.push('lazy 3D bundle');

if (failures.length) {
  console.error(`\nBundle budget exceeded: ${failures.join(', ')}`);
  process.exit(1);
}
