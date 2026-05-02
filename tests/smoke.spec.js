import { test, expect } from '@playwright/test';

test.describe('Smoke — page loads', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Black Diamond Consulting/);
  });

  test('homepage hero h1 is visible', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('nav links are present', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('.site-nav');
    await expect(nav.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Resources', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Work with me', exact: true })).toBeVisible();
  });

  test('risk scan CTA links to /risk-scan/', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /free risk scan/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/risk-scan/');
  });

  test('/risk-scan/ page loads', async ({ page }) => {
    await page.goto('/risk-scan/');
    await expect(page).toHaveTitle(/Risk Scan/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/resources/ page loads', async ({ page }) => {
    await page.goto('/resources/');
    await expect(page).toHaveTitle(/Resources/i);
  });

  test('footer copyright is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer-copy')).toContainText('Sean Yunt');
  });
});
