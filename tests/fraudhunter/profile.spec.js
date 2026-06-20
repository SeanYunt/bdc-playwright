import { test, expect } from '@playwright/test';
import { stubBase, stubProfile, PROFILE_FRESH_FIXTURE, PROFILE_CACHED_FIXTURE } from './helpers.js';

test.describe('Profile tab', () => {
  test.beforeEach(async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
    await page.locator('#tab-profile').click();
  });

  test('profile NPI input defaults to 1598971855', async ({ page }) => {
    await expect(page.locator('#profile-npi')).toHaveValue('1598971855');
  });

  test('profile button is labelled "Generate Dossier" initially', async ({ page }) => {
    await expect(page.locator('#profile-btn')).toContainText('Generate Dossier');
  });

  test('invalid NPI (non-10-digit) triggers browser alert', async ({ page }) => {
    let dialogFired = false;
    page.once('dialog', async dialog => {
      dialogFired = true;
      await dialog.dismiss();
    });
    await page.fill('#profile-npi', '12345');
    await page.locator('#profile-btn').click();
    expect(dialogFired).toBe(true);
  });

  test.describe('fresh profile result', () => {
    test.beforeEach(async ({ page }) => {
      await stubProfile(page, PROFILE_FRESH_FIXTURE);
      await page.locator('#profile-btn').click();
      await expect(page.locator('#profile-result')).toBeVisible({ timeout: 10000 });
    });

    test('provider name is displayed', async ({ page }) => {
      await expect(page.locator('#profile-result')).toContainText('SMITH JOHN MD');
    });

    test('score is displayed as 82%', async ({ page }) => {
      await expect(page.locator('#profile-result')).toContainText('82%');
    });

    test('flag count is displayed', async ({ page }) => {
      await expect(page.locator('#profile-result')).toContainText('3');
    });

    test('red flag descriptions are displayed', async ({ page }) => {
      await expect(page.locator('#profile-result')).toContainText('revenue outlier');
    });

    test('PDF download link has correct href', async ({ page }) => {
      const pdfLink = page.locator('#profile-result a[href*=".pdf"]').first();
      await expect(pdfLink).toHaveAttribute('href', '/dossiers/dossier_1598971855_20250610.pdf');
    });

    test('profile button shows "Profile Completed" after result', async ({ page }) => {
      await expect(page.locator('#profile-btn')).toContainText('Profile Completed');
    });

    test('profile button is disabled after result', async ({ page }) => {
      await expect(page.locator('#profile-btn')).toBeDisabled();
    });
  });

  test.describe('cached profile result', () => {
    test.beforeEach(async ({ page }) => {
      await stubProfile(page, PROFILE_CACHED_FIXTURE);
      await page.locator('#profile-btn').click();
      await expect(page.locator('#profile-result')).toBeVisible({ timeout: 10000 });
    });

    test('PDF download link is present for cached result', async ({ page }) => {
      const pdfLink = page.locator('#profile-result a[href*=".pdf"]').first();
      await expect(pdfLink).toBeVisible();
      await expect(pdfLink).toHaveAttribute('href', '/dossiers/dossier_1598971855_20250610.pdf');
    });

    test('force re-run button is present for cached result', async ({ page }) => {
      const rerunBtn = page.locator('#profile-result').getByRole('button', { name: /re-run|force/i });
      await expect(rerunBtn).toBeVisible();
    });

    test('profile button shows "Profile Completed" for cached result', async ({ page }) => {
      await expect(page.locator('#profile-btn')).toContainText('Profile Completed');
    });
  });
});
