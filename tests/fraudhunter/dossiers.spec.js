import { test, expect } from '@playwright/test';
import { stubBase, stubDossiers, DOSSIERS_FIXTURE } from './helpers.js';

test.describe('Dossiers tab', () => {
  test.beforeEach(async ({ page }) => {
    await stubBase(page);
    await stubDossiers(page);
    await page.goto('/');
    await page.locator('#tab-dossiers').click();
    await expect(page.locator('#dossiers-list')).toBeVisible({ timeout: 5000 });
  });

  test('table header shows NPI column', async ({ page }) => {
    await expect(page.locator('#dossiers-list')).toContainText('NPI');
  });

  test('table header shows Filename column', async ({ page }) => {
    await expect(page.locator('#dossiers-list')).toContainText('Filename');
  });

  test('table header shows Size column', async ({ page }) => {
    await expect(page.locator('#dossiers-list')).toContainText('Size');
  });

  test('table header shows Actions column', async ({ page }) => {
    await expect(page.locator('#dossiers-list')).toContainText('Actions');
  });

  test('first dossier NPI is displayed', async ({ page }) => {
    await expect(page.locator('#dossiers-list')).toContainText('1598971855');
  });

  test('first dossier filename is displayed', async ({ page }) => {
    await expect(page.locator('#dossiers-list')).toContainText('dossier_1598971855_20250610.pdf');
  });

  test('first dossier size is displayed as 44.6 KB', async ({ page }) => {
    await expect(page.locator('#dossiers-list')).toContainText('44.6 KB');
  });

  test('PDF download link has correct href', async ({ page }) => {
    const pdfLink = page.locator('#dossiers-list a[href*="dossier_1598971855_20250610.pdf"]').first();
    await expect(pdfLink).toHaveAttribute('href', '/dossiers/dossier_1598971855_20250610.pdf');
  });

  test('PDF download link text contains "↓ PDF"', async ({ page }) => {
    const pdfLink = page.locator('#dossiers-list a[href*="dossier_1598971855_20250610.pdf"]').first();
    await expect(pdfLink).toContainText('↓ PDF');
  });

  test('"Re-run →" button is present for first dossier', async ({ page }) => {
    const rerunBtn = page.locator('#dossiers-list').getByRole('button', { name: /Re-run/i }).first();
    await expect(rerunBtn).toBeVisible();
  });

  test('"↺ Refresh" button is present', async ({ page }) => {
    const refreshBtn = page.getByRole('button', { name: /Refresh/i });
    await expect(refreshBtn).toBeVisible();
  });

  test('clicking "Re-run →" switches to profile tab', async ({ page }) => {
    const rerunBtn = page.locator('#dossiers-list').getByRole('button', { name: /Re-run/i }).first();
    await rerunBtn.click();
    await expect(page.locator('#panel-profile')).not.toHaveClass(/hidden/);
  });

  test('clicking "Re-run →" sets NPI in profile input', async ({ page }) => {
    const rerunBtn = page.locator('#dossiers-list').getByRole('button', { name: /Re-run/i }).first();
    await rerunBtn.click();
    await expect(page.locator('#profile-npi')).toHaveValue(DOSSIERS_FIXTURE.dossiers[0].npi);
  });
});

test.describe('Dossiers tab — empty state', () => {
  test('shows "No dossiers generated yet." when list is empty', async ({ page }) => {
    await stubBase(page);
    await stubDossiers(page, { dossiers: [] });
    await page.goto('/');
    await page.locator('#tab-dossiers').click();
    await expect(page.locator('#dossiers-list')).toContainText('No dossiers generated yet.', { timeout: 5000 });
  });
});
