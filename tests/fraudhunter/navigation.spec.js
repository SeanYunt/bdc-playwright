import { test, expect } from '@playwright/test';
import { stubBase, stubDossiers } from './helpers.js';

test.describe('Navigation — tab switching', () => {
  test.beforeEach(async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
  });

  test('scan panel is visible on load', async ({ page }) => {
    await expect(page.locator('#panel-scan')).not.toHaveClass(/hidden/);
  });

  test('profile, lookup, dossiers panels are hidden on load', async ({ page }) => {
    await expect(page.locator('#panel-profile')).toHaveClass(/hidden/);
    await expect(page.locator('#panel-lookup')).toHaveClass(/hidden/);
    await expect(page.locator('#panel-dossiers')).toHaveClass(/hidden/);
  });

  test('clicking profile tab shows profile panel and hides scan panel', async ({ page }) => {
    await page.locator('#tab-profile').click();
    await expect(page.locator('#panel-profile')).not.toHaveClass(/hidden/);
    await expect(page.locator('#panel-scan')).toHaveClass(/hidden/);
  });

  test('clicking lookup tab shows lookup panel', async ({ page }) => {
    await page.locator('#tab-lookup').click();
    await expect(page.locator('#panel-lookup')).not.toHaveClass(/hidden/);
    await expect(page.locator('#panel-scan')).toHaveClass(/hidden/);
  });

  test('active scan tab has border-blue-500 class', async ({ page }) => {
    await expect(page.locator('#tab-scan')).toHaveClass(/border-blue-500/);
  });

  test('active scan tab has text-blue-400 class', async ({ page }) => {
    await expect(page.locator('#tab-scan')).toHaveClass(/text-blue-400/);
  });

  test('inactive profile tab has border-transparent class', async ({ page }) => {
    await expect(page.locator('#tab-profile')).toHaveClass(/border-transparent/);
  });

  test('after clicking profile tab it gains active classes', async ({ page }) => {
    await page.locator('#tab-profile').click();
    await expect(page.locator('#tab-profile')).toHaveClass(/border-blue-500/);
    await expect(page.locator('#tab-profile')).toHaveClass(/text-blue-400/);
  });

  test('after clicking profile tab, scan tab loses active classes', async ({ page }) => {
    await page.locator('#tab-profile').click();
    await expect(page.locator('#tab-scan')).toHaveClass(/border-transparent/);
  });

  test('clicking dossiers tab triggers loadDossiers() API call', async ({ page }) => {
    await stubDossiers(page);
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/api/dossiers')),
      page.locator('#tab-dossiers').click(),
    ]);
    expect(request.url()).toContain('/api/dossiers');
  });
});
