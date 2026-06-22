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
    await expect(nav.getByRole('link', { name: 'Demo', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'What clients get', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Resources', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Become a partner', exact: true })).toBeVisible();
  });

  test('mobile nav toggle button exists in DOM', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-toggle')).toBeAttached();
  });

  test('nav CTA links to /#get-started', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.nav-cta')).toHaveAttribute('href', '/#get-started');
  });

  test('homepage has demo section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#demo')).toBeAttached();
  });

  test('homepage has partner section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#partner')).toBeAttached();
  });

  test('homepage has about section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#about')).toBeAttached();
  });

  test('homepage has get-started section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#get-started')).toBeAttached();
  });

  test('homepage has how-it-works section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#how-it-works')).toBeAttached();
  });

  test('/risk-assessment/ page loads', async ({ page }) => {
    await page.goto('/risk-assessment/');
    await expect(page).toHaveTitle(/Risk Assessment/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/resources/ page loads', async ({ page }) => {
    await page.goto('/resources/');
    await expect(page).toHaveTitle(/Resources/i);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/ai-assistant/ page loads', async ({ page }) => {
    await page.goto('/ai-assistant/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/ai-assistant/ has get-started section', async ({ page }) => {
    await page.goto('/ai-assistant/');
    await expect(page.locator('#get-started')).toBeAttached();
  });

  test('/ai-assistant/ has contact form', async ({ page }) => {
    await page.goto('/ai-assistant/');
    await expect(page.locator('#ai-assist-form')).toBeAttached();
  });

  test('footer copyright is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.footer-copy')).toContainText('Sean Yunt');
  });

  test('/thank-you/ page loads with correct heading', async ({ page }) => {
    await page.goto('/thank-you/');
    await expect(page).toHaveTitle(/Thank you/i);
    await expect(page.locator('h1')).toContainText("Thanks. I'll be in touch.");
    await expect(page.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  test('/subscribe-confirmed/ page loads with correct heading', async ({ page }) => {
    await page.goto('/subscribe-confirmed/');
    await expect(page).toHaveTitle(/subscription confirmed/i);
    await expect(page.locator('h1')).toContainText("You're subscribed.");
    await expect(page.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  test('/resources/llm-attack-taxonomy/ loads with taxonomy content', async ({ page }) => {
    await page.goto('/resources/llm-attack-taxonomy/');
    await expect(page.locator('h1')).toContainText('LLM Attack Taxonomy');
    await expect(page.locator('.tax-summary')).toBeVisible();
    await expect(page.locator('.tax-category').first()).toBeVisible();
    await expect(page.locator('#tax-search')).toBeVisible();
    await expect(page.locator('.back-link')).toBeVisible();
  });

  test('resource article page has correct structure', async ({ page }) => {
    await page.goto('/resources/hallucination-production-risk/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.back-link')).toContainText('All articles');
    await expect(page.locator('.resource-tag')).toBeVisible();
    await expect(page.locator('.article-meta')).toBeVisible();
    await expect(page.locator('#subscribe-form')).toBeAttached();
  });
});
