// Refresh screenshot baselines from a CI run (CI's renderer is the source of truth, not your machine).
//   pnpm baselines <run-id>     (run-id from `gh run list`; the run must have failed on screenshots)
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const runId = process.argv[2];
if (!runId) {
  console.error('usage: pnpm baselines <run-id>');
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), 'baselines-'));
execFileSync('gh', ['run', 'download', runId, '-n', 'playwright-report', '-D', tmp], {
  stdio: 'inherit',
});

const walk = (dir) =>
  readdirSync(dir).flatMap((n) =>
    statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)],
  );

let count = 0;
for (const file of walk(tmp).filter((f) => f.endsWith('-actual.png'))) {
  // .../visual-<test>-<project>/<name>-actual.png  ->  __screenshots__/<spec>/<name>-<project>.png
  const dir = file.split('/').at(-2);
  const spec = dir.split('-')[0];
  const project = dir.match(/(mobile-360|desktop-1440)$/)?.[1];
  if (!project) continue;
  const name = file.split('/').at(-1).replace('-actual.png', '');
  const outDir = join('tests/e2e/__screenshots__', `${spec}.spec.ts`);
  mkdirSync(outDir, { recursive: true });
  copyFileSync(file, join(outDir, `${name}-${project}.png`));
  count++;
}
console.log(`Updated ${count} baseline(s). Review with git diff, then commit.`);
