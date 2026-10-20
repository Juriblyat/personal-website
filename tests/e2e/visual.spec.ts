import { expect, test } from '@playwright/test';

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    test('home matches its screenshot', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`home-${colorScheme}.png`);
    });
  });
}
