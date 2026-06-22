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

test.describe('Forms — AI assistant (/ai-assistant/)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-assistant/');
  });

  test('required fields and submit button are present', async ({ page }) => {
    await expect(page.locator('#ai-name')).toBeVisible();
    await expect(page.locator('#ai-email')).toBeVisible();
    await expect(page.locator('#ai-business')).toBeVisible();
    await expect(page.locator('#ai-trade')).toBeVisible();
    await expect(page.locator('#ai-assist-submit')).toBeVisible();
  });

  test('optional fields are present', async ({ page }) => {
    await expect(page.locator('#ai-phone')).toBeVisible();
    await expect(page.locator('#ai-website')).toBeVisible();
  });

  test('name, email, business, and trade are required', async ({ page }) => {
    await expect(page.locator('#ai-name')).toHaveAttribute('required', '');
    await expect(page.locator('#ai-email')).toHaveAttribute('required', '');
    await expect(page.locator('#ai-business')).toHaveAttribute('required', '');
    await expect(page.locator('#ai-trade')).toHaveAttribute('required', '');
  });

  test('phone field is optional', async ({ page }) => {
    const required = await page.locator('#ai-phone').getAttribute('required');
    expect(required).toBeNull();
  });

  test('phone field type is tel', async ({ page }) => {
    await expect(page.locator('#ai-phone')).toHaveAttribute('type', 'tel');
  });

  test('email field type is email', async ({ page }) => {
    await expect(page.locator('#ai-email')).toHaveAttribute('type', 'email');
  });

  test('website field is not required', async ({ page }) => {
    const required = await page.locator('#ai-website').getAttribute('required');
    expect(required).toBeNull();
  });

  test('success message is hidden on load', async ({ page }) => {
    await expect(page.locator('#ai-assist-success')).toBeHidden();
  });

  test('form fields are interactive', async ({ page }) => {
    await page.fill('#ai-name', 'Jane Smith');
    await page.fill('#ai-email', 'jane@example.com');
    await page.fill('#ai-business', 'Mesa Kitchen');
    await page.fill('#ai-trade', 'restaurant');
    await expect(page.locator('#ai-name')).toHaveValue('Jane Smith');
    await expect(page.locator('#ai-email')).toHaveValue('jane@example.com');
    await expect(page.locator('#ai-business')).toHaveValue('Mesa Kitchen');
    await expect(page.locator('#ai-trade')).toHaveValue('restaurant');
  });

  test('submit sends request to formspree', async ({ page }) => {
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('formspree.io'), { timeout: 10000 }),
      (async () => {
        await page.fill('#ai-name', 'Jane Smith');
        await page.fill('#ai-email', 'jane@example.com');
        await page.fill('#ai-business', 'Mesa Kitchen');
        await page.fill('#ai-trade', 'restaurant');
        await page.click('#ai-assist-submit');
      })(),
    ]);
    expect(request.url()).toContain('formspree.io');
  });
});

test.describe('Forms — newsletter subscribe (resource article page)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/resources/hallucination-production-risk/');
  });

  test('subscribe form is visible on article page', async ({ page }) => {
    await expect(page.locator('#subscribe-form')).toBeVisible();
  });

  test('email field is present and required', async ({ page }) => {
    const emailInput = page.locator('#subscribe-form input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('success message is hidden on load', async ({ page }) => {
    await expect(page.locator('#subscribe-success')).toBeHidden();
  });

  test('submit POSTs to /subscribe and shows success message', async ({ page }) => {
    let capturedBody = null;
    await page.route('**/subscribe', async (route) => {
      capturedBody = JSON.parse(route.request().postData() || '{}');
      await route.fulfill({ status: 200 });
    });

    await page.fill('#subscribe-form input[type="email"]', 'test@example.com');
    await page.click('#subscribe-btn');

    await expect(page.locator('#subscribe-success')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#subscribe-form')).toBeHidden();
    expect(capturedBody?.email).toBe('test@example.com');
  });
});
