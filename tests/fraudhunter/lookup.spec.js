import { test, expect } from '@playwright/test';
import { stubBase, stubLookup, LOOKUP_FIXTURE } from './helpers.js';

test.describe('Lookup tab', () => {
  test.beforeEach(async ({ page }) => {
    await stubBase(page);
    await page.goto('/');
    await page.locator('#tab-lookup').click();
  });

  test('lookup query input is present', async ({ page }) => {
    await expect(page.locator('#lookup-query')).toBeVisible();
  });

  test('lookup state input is present', async ({ page }) => {
    await expect(page.locator('#lookup-state')).toBeVisible();
  });

  test('lookup button is present', async ({ page }) => {
    await expect(page.locator('#lookup-btn')).toBeVisible();
  });

  test('results area is empty on load', async ({ page }) => {
    await expect(page.locator('#lookup-results')).toBeEmpty();
  });

  test.describe('after running lookup', () => {
    test.beforeEach(async ({ page }) => {
      await stubLookup(page);
      await page.fill('#lookup-query', 'SMITH');
      await page.locator('#lookup-btn').click();
      await expect(page.locator('#lookup-results')).toContainText('result', { timeout: 10000 });
    });

    test('shows result count "2 result(s)"', async ({ page }) => {
      await expect(page.locator('#lookup-results')).toContainText('2 result(s)');
    });

    test('first result name is displayed', async ({ page }) => {
      await expect(page.locator('#lookup-results')).toContainText('SMITH JOHN MD');
    });

    test('first result NPI is displayed', async ({ page }) => {
      await expect(page.locator('#lookup-results')).toContainText('1598971855');
    });

    test('first result address is displayed', async ({ page }) => {
      await expect(page.locator('#lookup-results')).toContainText('123 Main St');
    });

    test('first result taxonomy is displayed', async ({ page }) => {
      await expect(page.locator('#lookup-results')).toContainText('Internal Medicine');
    });

    test('"Profile →" button is present for each result', async ({ page }) => {
      const profileBtns = page.locator('#lookup-results').getByRole('button', { name: /Profile/i });
      await expect(profileBtns).toHaveCount(LOOKUP_FIXTURE.results.length);
    });

    test('clicking "Profile →" switches to profile tab', async ({ page }) => {
      await page.locator('#lookup-results').getByRole('button', { name: /Profile/i }).first().click();
      await expect(page.locator('#panel-profile')).not.toHaveClass(/hidden/);
    });

    test('clicking "Profile →" sets NPI in profile input', async ({ page }) => {
      await page.locator('#lookup-results').getByRole('button', { name: /Profile/i }).first().click();
      await expect(page.locator('#profile-npi')).toHaveValue(LOOKUP_FIXTURE.results[0].npi);
    });
  });

  test('Enter key triggers lookup', async ({ page }) => {
    await stubLookup(page);
    await page.fill('#lookup-query', 'SMITH');
    await page.locator('#lookup-query').press('Enter');
    await expect(page.locator('#lookup-results')).toContainText('result', { timeout: 10000 });
  });

  test('empty results show "No providers found."', async ({ page }) => {
    await stubLookup(page, { results: [] });
    await page.fill('#lookup-query', 'NOBODY');
    await page.locator('#lookup-btn').click();
    await expect(page.locator('#lookup-results')).toContainText('No providers found.', { timeout: 10000 });
  });
});
