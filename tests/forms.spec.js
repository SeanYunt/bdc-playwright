import { test, expect } from '@playwright/test';

test.describe('Forms — risk assessment (/risk-assessment/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/risk-assessment/');
  });

  test('required fields and submit button are present', async ({ page }) => {
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#ai_description')).toBeVisible();
    await expect(page.locator('#risk-scan-submit')).toBeVisible();
  });

  test('optional fields are present', async ({ page }) => {
    await expect(page.locator('#company')).toBeVisible();
    await expect(page.locator('#industry')).toBeVisible();
    await expect(page.locator('#risk_check_score')).toBeVisible();
  });

  test('ai_type and concern checkbox groups are present', async ({ page }) => {
    await expect(page.locator('input[name="ai_type[]"]').first()).toBeVisible();
    await expect(page.locator('input[name="concern[]"]').first()).toBeVisible();
  });

  test('name, email, and ai_description are required', async ({ page }) => {
    await expect(page.locator('#name')).toHaveAttribute('required', '');
    await expect(page.locator('#email')).toHaveAttribute('required', '');
    await expect(page.locator('#ai_description')).toHaveAttribute('required', '');
  });

  test('email field rejects invalid format', async ({ page }) => {
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'notanemail');
    await page.fill('#ai_description', 'A test AI system description.');
    await page.click('#risk-scan-submit');
    const valid = await page.locator('#email').evaluate(el => el.validity.valid);
    expect(valid).toBe(false);
  });

  test('success message is hidden on load', async ({ page }) => {
    await expect(page.locator('#risk-scan-success')).toBeHidden();
  });

  test('ai_type checkboxes are interactive', async ({ page }) => {
    const cb = page.locator('input[name="ai_type[]"]').first();
    await cb.check();
    await expect(cb).toBeChecked();
    await cb.uncheck();
    await expect(cb).not.toBeChecked();
  });

  test('concern checkboxes are interactive', async ({ page }) => {
    const cb = page.locator('input[name="concern[]"]').first();
    await cb.check();
    await expect(cb).toBeChecked();
  });

  test('example report link is present and points to a PDF', async ({ page }) => {
    const link = page.getByRole('link', { name: /example report/i });
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/\.pdf/i);
  });

  test('submit sends request to formspree', async ({ page }) => {
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('formspree.io'), { timeout: 10000 }),
      (async () => {
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'test@example.com');
        await page.fill('#ai_description', 'A customer support chatbot that handles order inquiries.');
        await page.click('#risk-scan-submit');
      })(),
    ]);
    expect(request.url()).toContain('formspree.io');
  });
});

test.describe('Forms — homepage risk check', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('risk check form is present', async ({ page }) => {
    await expect(page.locator('#risk-check-form')).toBeAttached();
  });

  test('risk check has 10 checkboxes', async ({ page }) => {
    await expect(page.locator('#risk-check-form input[type="checkbox"]')).toHaveCount(10);
  });

  test('checkboxes are interactive', async ({ page }) => {
    const cb = page.locator('#risk-check-form input[type="checkbox"]').first();
    await cb.check();
    await expect(cb).toBeChecked();
  });

  test('post-result CTA links to /risk-assessment/', async ({ page }) => {
    const cta = page.locator('#risk-cta-wrap .btn-primary');
    await expect(cta).toHaveAttribute('href', '/risk-assessment/');
  });
});
