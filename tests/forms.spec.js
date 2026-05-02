import { test, expect } from '@playwright/test';

test.describe('Forms — risk scan', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/risk-scan/');
  });

  test('all fields and submit button are present', async ({ page }) => {
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#ai_description')).toBeVisible();
    await expect(page.locator('#risk-scan-submit')).toBeVisible();
  });

  test('name and email are required', async ({ page }) => {
    await expect(page.locator('#name')).toHaveAttribute('required', '');
    await expect(page.locator('#email')).toHaveAttribute('required', '');
  });

  test('email field rejects invalid format', async ({ page }) => {
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'notanemail');
    await page.click('#risk-scan-submit');
    const valid = await page.locator('#email').evaluate(el => el.validity.valid);
    expect(valid).toBe(false);
  });

  test('success message is hidden on load', async ({ page }) => {
    await expect(page.locator('#risk-scan-success')).toBeHidden();
  });
});

test.describe('Forms — main intake', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
  });

  test('all fields and submit button are present', async ({ page }) => {
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#intake-submit')).toBeVisible();
  });

  test('success message is hidden on load', async ({ page }) => {
    await expect(page.locator('#intake-success')).toBeHidden();
  });
});
