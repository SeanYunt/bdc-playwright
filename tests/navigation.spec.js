import { test, expect } from '@playwright/test';

test.describe('Navigation — links and buttons', () => {
  test('site logo navigates to homepage', async ({ page }) => {
    await page.goto('/risk-assessment/');
    await page.click('.site-logo');
    await expect(page).toHaveURL('/');
  });

  test('Services nav link updates URL to /#services', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-nav').getByRole('link', { name: 'Services', exact: true }).click();
    await expect(page).toHaveURL(/#services/);
  });

  test('Resources nav link navigates to /resources/', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-nav').getByRole('link', { name: 'Resources', exact: true }).click();
    await expect(page).toHaveURL('/resources/');
  });

  test('About nav link updates URL to /#about', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-nav').getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/#about/);
  });

  test('Free risk assessment nav CTA navigates to /risk-assessment/', async ({ page }) => {
    await page.goto('/');
    await page.click('.nav-cta');
    await expect(page).toHaveURL('/risk-assessment/');
  });

  test('homepage hero primary CTA scrolls to risk-check section', async ({ page }) => {
    await page.goto('/');
    await page.locator('a.btn-primary', { hasText: 'Take the 60-second AI risk check' }).first().click();
    await expect(page).toHaveURL(/#risk-check/);
  });

  test('homepage hero outline CTA navigates to /risk-assessment/', async ({ page }) => {
    await page.goto('/');
    await page.locator('a.btn-outline', { hasText: 'Request a free written assessment' }).click();
    await expect(page).toHaveURL('/risk-assessment/');
  });

  test('post-risk-check primary CTA navigates to /risk-assessment/', async ({ page }) => {
    await page.goto('/');
    // The visible version is the second instance — the first is inside the hidden #risk-cta-wrap
    await page.locator('a.btn-primary[href="/risk-assessment/"]').nth(1).click();
    await expect(page).toHaveURL('/risk-assessment/');
  });

  test('post-risk-check "Take the risk check again" scrolls back to form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Take the risk check again' }).click();
    await expect(page).toHaveURL(/#risk-check/);
  });

  test('risk assessment anchor CTA scrolls to form', async ({ page }) => {
    await page.goto('/risk-assessment/');
    await page.locator('a.btn-primary', { hasText: 'Request my free assessment' }).first().click();
    await expect(page).toHaveURL(/#assessment-form/);
  });

  test('resources hero primary CTA links to #start-here', async ({ page }) => {
    await page.goto('/resources/');
    await page.locator('a.btn-primary', { hasText: 'Start with the plain-English guides' }).click();
    await expect(page).toHaveURL(/#start-here/);
  });

  test('resources hero outline CTA links to #technical-library', async ({ page }) => {
    await page.goto('/resources/');
    await page.locator('a.btn-outline', { hasText: 'Browse technical research' }).click();
    await expect(page).toHaveURL(/#technical-library/);
  });

  test('resources filter pills are all clickable and become active', async ({ page }) => {
    await page.goto('/resources/');
    const pills = ['Prompt injection', 'Hallucination', 'Data leakage', 'Model behavior', 'Methodology', 'All'];
    for (const label of pills) {
      const pill = page.getByRole('button', { name: label, exact: true });
      await expect(pill).toBeVisible();
      await pill.click();
      await expect(pill).toHaveClass(/active/);
    }
  });

  test('resources article links navigate to their pages', async ({ page }) => {
    await page.goto('/resources/');
    const firstArticleLink = page.locator('#library-grid a').first();
    await expect(firstArticleLink).toBeVisible();
    const href = await firstArticleLink.getAttribute('href');
    expect(href).toMatch(/^\/resources\//);
    await firstArticleLink.click();
    await expect(page).toHaveURL(new RegExp(href));
  });

  test('resources "Request an assessment" CTA navigates to /risk-assessment/', async ({ page }) => {
    await page.goto('/resources/');
    await page.locator('a.btn-primary', { hasText: 'Request an assessment' }).click();
    await expect(page).toHaveURL('/risk-assessment/');
  });

  test('risk assessment "See an example report" link opens PDF', async ({ page }) => {
    await page.goto('/risk-assessment/');
    const link = page.getByRole('link', { name: /example report/i });
    const href = await link.getAttribute('href');
    expect(href).toMatch(/\.pdf/i);
  });
});
