import { expect, test } from '@playwright/test';

test('home renders and logs no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto('/');

  await expect(page).toHaveTitle(/Joeri Naegels/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
});
