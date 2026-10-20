import { expect, test } from '@playwright/test';

const mesh = (page: import('@playwright/test').Page) => page.locator('#mesh');

test('the mesh loads after the page, then runs', async ({ page }) => {
  await page.goto('/');
  await expect(mesh(page)).toHaveAttribute('data-mesh', 'running', { timeout: 20_000 });
});

test('the same canvas survives navigation and keeps running', async ({ page }) => {
  await page.goto('/');
  await expect(mesh(page)).toHaveAttribute('data-mesh', 'running', { timeout: 20_000 });
  await page.evaluate(() => {
    (document.getElementById('mesh') as HTMLCanvasElement & { __kept?: boolean }).__kept = true;
  });

  await page.getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/\/work\/?$/);

  const kept = await page.evaluate(
    () => (document.getElementById('mesh') as HTMLCanvasElement & { __kept?: boolean }).__kept,
  );
  expect(kept).toBe(true);
  await expect(mesh(page)).toHaveAttribute('data-mesh', 'running');
});

test('the render loop pauses while the tab is hidden', async ({ page }) => {
  await page.goto('/');
  await expect(mesh(page)).toHaveAttribute('data-mesh', 'running', { timeout: 20_000 });

  const setHidden = (hidden: boolean) =>
    page.evaluate((h) => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
      document.dispatchEvent(new Event('visibilitychange'));
    }, hidden);

  await setHidden(true);
  await expect(mesh(page)).toHaveAttribute('data-mesh', 'paused');
  await setHidden(false);
  await expect(mesh(page)).toHaveAttribute('data-mesh', 'running');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the 3D code is never loaded and the page stays complete', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    await expect(mesh(page)).toHaveAttribute('data-mesh', 'off');
    expect(requests.some((u) => /\/_astro\/scene\./.test(u))).toBe(false);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
