import { test, expect } from '@playwright/test';
import { stubBase, stubScan, SCAN_FIXTURE } from './helpers.js';

test.describe('Scan tab', () => {
  test.beforeEach(async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
  });

  test('threshold input defaults to 0.5', async ({ page }) => {
    await expect(page.locator('#scan-threshold')).toHaveValue('0.5');
  });

  test('top input defaults to 20', async ({ page }) => {
    await expect(page.locator('#scan-top')).toHaveValue('20');
  });

  test('state input defaults to WY', async ({ page }) => {
    await expect(page.locator('#scan-state')).toHaveValue('WY');
  });

  test('run scan button is present and labelled "Run Scan"', async ({ page }) => {
    await expect(page.locator('#scan-btn')).toBeVisible();
    await expect(page.locator('#scan-btn')).toContainText('Run Scan');
  });

  test('results table is not visible before running scan', async ({ page }) => {
    await expect(page.locator('#scan-results')).toBeHidden();
  });

  test.describe('after running scan', () => {
    test.beforeEach(async ({ page }) => {
      await stubScan(page);
      await page.locator('#scan-btn').click();
      await expect(page.locator('#scan-results')).toBeVisible({ timeout: 10000 });
    });

    test('results table shows correct total count', async ({ page }) => {
      await expect(page.locator('#scan-results')).toContainText('3');
    });

    test('first result NPI is displayed', async ({ page }) => {
      await expect(page.locator('#scan-results')).toContainText('1234567890');
    });

    test('first result score is displayed as 82%', async ({ page }) => {
      await expect(page.locator('#scan-results')).toContainText('82%');
    });

    test('first result flag count is displayed', async ({ page }) => {
      await expect(page.locator('#scan-results')).toContainText('3');
    });

    test('first result flag types are displayed', async ({ page }) => {
      await expect(page.locator('#scan-results')).toContainText('revenue_outlier');
    });

    test('"Profile →" button is present in results', async ({ page }) => {
      const profileBtn = page.locator('#scan-results').getByRole('button', { name: /Profile/i }).first();
      await expect(profileBtn).toBeVisible();
    });

    test('clicking "Profile →" button switches to profile tab', async ({ page }) => {
      const profileBtn = page.locator('#scan-results').getByRole('button', { name: /Profile/i }).first();
      await profileBtn.click();
      await expect(page.locator('#panel-profile')).not.toHaveClass(/hidden/);
      await expect(page.locator('#panel-scan')).toHaveClass(/hidden/);
    });

    test('clicking "Profile →" button sets NPI in profile input', async ({ page }) => {
      const profileBtn = page.locator('#scan-results').getByRole('button', { name: /Profile/i }).first();
      await profileBtn.click();
      await expect(page.locator('#profile-npi')).toHaveValue(SCAN_FIXTURE.providers[0].npi);
    });
  });

  test('empty state shows message when no results', async ({ page }) => {
    await stubScan(page, { total: 0, providers: [], params: { threshold: 0.5, top: 20, state: 'WY' } });
    await page.locator('#scan-btn').click();
    await expect(page.locator('#scan-results')).toContainText('No providers found above threshold.', { timeout: 10000 });
  });
});
