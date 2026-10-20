import { expect, test } from '@playwright/test';

test('home matches its screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png');
});
