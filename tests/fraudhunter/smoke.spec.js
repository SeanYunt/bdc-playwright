import { test, expect } from '@playwright/test';
import { stubBase } from './helpers.js';

test.describe('Smoke — fraudhunter.blackdiamondconsulting.ai', () => {
  test.beforeEach(async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
  });

  test('page title is "Medicaid Fraud Hunter"', async ({ page }) => {
    await expect(page).toHaveTitle('Medicaid Fraud Hunter');
  });

  test('h1 contains "Medicaid Fraud Hunter"', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Medicaid Fraud Hunter');
  });

  test('subtitle contains "CMS claims anomaly detection"', async ({ page }) => {
    await expect(page.locator('body')).toContainText('CMS claims anomaly detection');
  });

  test('status dot turns green (bg-green-500) after status loads', async ({ page }) => {
    await expect(page.locator('#status-dot')).toHaveClass(/bg-green-500/, { timeout: 5000 });
  });

  test('status text updates to "Ready"', async ({ page }) => {
    await expect(page.locator('#status-text')).toContainText('Ready', { timeout: 5000 });
  });

  test('all 4 tab buttons are present', async ({ page }) => {
    await expect(page.locator('#tab-scan')).toBeVisible();
    await expect(page.locator('#tab-profile')).toBeVisible();
    await expect(page.locator('#tab-lookup')).toBeVisible();
    await expect(page.locator('#tab-dossiers')).toBeVisible();
  });

  test('footer link points to blackdiamondconsulting.ai', async ({ page }) => {
    const link = page.getByRole('link', { name: /blackdiamondconsulting\.ai/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', 'https://blackdiamondconsulting.ai/');
  });

  test('footer link opens in new tab', async ({ page }) => {
    const link = page.getByRole('link', { name: /blackdiamondconsulting\.ai/i });
    await expect(link).toHaveAttribute('target', '_blank');
  });
});
