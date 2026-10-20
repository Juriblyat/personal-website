import { expect, test } from '@playwright/test';

// A cascade layer's priority is set by where it first appears. If any @layer block precedes the
// order statement, component styles silently lose to base styles. See LayerOrder.astro.
test('the cascade layer order statement comes before any layer block', async ({ page }) => {
  await page.goto('/');
  const first = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSLayerStatementRule) return [...rule.nameList].join(',');
        if (rule instanceof CSSLayerBlockRule) return `block:${rule.name}`;
      }
    }
    return null;
  });
  expect(first).toBe('reset,tokens,base,components,utilities');
});
