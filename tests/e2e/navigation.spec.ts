import { expect, test } from '@playwright/test';

test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('nav navigates, updates the title and marks the current page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Work' }).click();
  await expect(page).toHaveURL(/\/work\/?$/);
  await expect(page).toHaveTitle(/Work/);
  await expect(page.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Work');
});

test('theme toggle persists across navigation and reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch theme' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.getByRole('link', { name: 'About' }).click(); // view transition, no full reload
  await expect(page).toHaveURL(/\/about\/?$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.reload(); // saved preference applied before paint
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('navigation works and the theme toggle is hidden', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Switch theme' })).toBeHidden();
    await page.getByRole('link', { name: 'Notes' }).click();
    await expect(page).toHaveURL(/\/notes\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Notes');
  });
});
