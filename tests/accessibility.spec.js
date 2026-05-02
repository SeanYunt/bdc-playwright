import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility — WCAG 2.1 AA', () => {
  test('homepage has no violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('/risk-scan/ has no violations', async ({ page }) => {
    await page.goto('/risk-scan/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('/resources/ has no violations', async ({ page }) => {
    await page.goto('/resources/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('btn-primary uses accessible green (#168060)', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('.btn-primary').first();
    const bg = await btn.evaluate(el =>
      getComputedStyle(el).backgroundColor
    );
    // rgb(22, 128, 96) = #168060 — 4.9:1 contrast with white, passes WCAG AA
    expect(bg).toBe('rgb(22, 128, 96)');
  });
});
