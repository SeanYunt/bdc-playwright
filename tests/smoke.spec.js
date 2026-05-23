import { test, expect } from '@playwright/test';

test.describe('Smoke — page loads', () => {
  test('homepage loads with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Black Diamond Consulting/);
  });

  test('homepage hero h1 is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('nav links are present', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('.site-nav');
    await expect(nav.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Resources', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Free risk assessment', exact: true })).toBeVisible();
  });

  test('mobile nav toggle button exists in DOM', async ({ page }) => {
    await page.goto('/');
    // nav-toggle is display:none on desktop; verify it's in the DOM for mobile viewports
    await expect(page.locator('.nav-toggle')).toBeAttached();
  });

  test('nav CTA links to /risk-assessment/', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-cta')).toHaveAttribute('href', '/risk-assessment/');
  });

  test('homepage has risk-check section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#risk-check')).toBeAttached();
  });

  test('homepage has services section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#services')).toBeAttached();
  });

  test('homepage has about section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#about')).toBeAttached();
  });

  test('/risk-assessment/ page loads', async ({ page }) => {
    await page.goto('/risk-assessment/');
    await expect(page).toHaveTitle(/Risk Assessment/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/risk-scan/ redirects to /risk-assessment/', async ({ page }) => {
    await page.goto('/risk-scan/');
    await expect(page).toHaveURL(/risk-assessment/);
  });

  test('/resources/ page loads', async ({ page }) => {
    await page.goto('/resources/');
    await expect(page).toHaveTitle(/Resources/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('footer copyright is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer-copy')).toContainText('Sean Yunt');
  });
});
