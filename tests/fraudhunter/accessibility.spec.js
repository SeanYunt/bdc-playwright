import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stubBase, stubScan, stubProfile, stubLookup, stubDossiers } from './helpers.js';

async function axe(page) {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
}

test.describe('Accessibility — fraudhunter WCAG 2.1 AA', () => {
  test('homepage (scan tab) has no violations', async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
    const results = await axe(page);
    expect(results.violations).toEqual([]);
  });

  test('profile tab has no violations', async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
    await page.locator('#tab-profile').click();
    const results = await axe(page);
    expect(results.violations).toEqual([]);
  });

  test('lookup tab has no violations', async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
    await page.locator('#tab-lookup').click();
    const results = await axe(page);
    expect(results.violations).toEqual([]);
  });

  test('dossiers tab has no violations', async ({ page }) => {
    await stubBase(page);
    await stubDossiers(page);
    await page.goto('/');
    await page.locator('#tab-dossiers').click();
    await expect(page.locator('#dossiers-list')).toBeVisible({ timeout: 5000 });
    const results = await axe(page);
    expect(results.violations).toEqual([]);
  });

  test('scan results state has no violations', async ({ page }) => {
    await stubBase(page);
    await stubScan(page);
    await page.goto('/');
    await page.locator('#scan-btn').click();
    await expect(page.locator('#scan-results')).toBeVisible({ timeout: 10000 });
    const results = await axe(page);
    expect(results.violations).toEqual([]);
  });

  test('profile result state has no violations', async ({ page }) => {
    await stubBase(page);
    await stubProfile(page);
    await page.goto('/');
    await page.locator('#tab-profile').click();
    await page.locator('#profile-btn').click();
    await expect(page.locator('#profile-result')).toBeVisible({ timeout: 10000 });
    const results = await axe(page);
    expect(results.violations).toEqual([]);
  });

  test('lookup results state has no violations', async ({ page }) => {
    await stubBase(page);
    await stubLookup(page);
    await page.goto('/');
    await page.locator('#tab-lookup').click();
    await page.fill('#lookup-query', 'SMITH');
    await page.locator('#lookup-btn').click();
    await expect(page.locator('#lookup-results')).toContainText('result', { timeout: 10000 });
    const results = await axe(page);
    expect(results.violations).toEqual([]);
  });
});
