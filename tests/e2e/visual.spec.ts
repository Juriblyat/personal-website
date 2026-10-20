import { expect, test } from '@playwright/test';

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });

    test('home matches its screenshot', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      // The copyright year changes with the build date, so it is masked rather than baselined.
      await expect(page).toHaveScreenshot(`home-${colorScheme}.png`, {
        mask: [page.locator('footer p').first()],
      });
    });
  });
}
