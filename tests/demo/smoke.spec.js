import { test, expect } from '@playwright/test';

const businesses = [
  { slug: 'bluepipe', title: 'BluePipe Plumbing — Bot Demo', h1: 'BluePipe Plumbing' },
  { slug: 'sparky',   title: "Sparky's Electrical Services — Bot Demo", h1: "Sparky's Electrical Services" },
  { slug: 'roofing',  title: 'Nailed It Roofing — Bot Demo', h1: 'Nailed It Roofing' },
  { slug: 'serviceco', title: 'Service Co — Bot Demo', h1: 'Service Co' },
];

test.describe('Smoke — demo site loads', () => {
  test('default URL redirects to BluePipe tab', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/biz=bluepipe/);
    await expect(page).toHaveTitle('BluePipe Plumbing — Bot Demo');
  });

  test('all four business tabs are present', async ({ page }) => {
    await page.goto('/');
    const bar = page.locator('.tab-bar');
    await expect(bar.getByRole('button', { name: 'BluePipe Plumbing', exact: true })).toBeVisible();
    await expect(bar.getByRole('button', { name: "Sparky's Electrical", exact: true })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Nailed It Roofing', exact: true })).toBeVisible();
    await expect(bar.getByRole('button', { name: 'Service Co', exact: true })).toBeVisible();
  });

  for (const biz of businesses) {
    test(`/${biz.slug} loads with correct title and h1`, async ({ page }) => {
      await page.goto(`/?biz=${biz.slug}`);
      await expect(page).toHaveTitle(biz.title);
      await expect(page.locator('.biz-name')).toContainText(biz.h1);
    });
  }

  test('business pages show tagline below h1', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await expect(page.locator('.biz-tagline')).toBeVisible();
    await expect(page.locator('.biz-tagline')).not.toBeEmpty();
  });

  test('business pages have About section', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await expect(page.getByRole('heading', { name: 'About', exact: true })).toBeVisible();
    await expect(page.locator('.biz-about')).toBeVisible();
  });

  test('business pages have Demo area section', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await expect(page.getByRole('heading', { name: 'Demo area', exact: true })).toBeVisible();
  });

  test('Open Chat button is present on business pages', async ({ page }) => {
    for (const biz of ['bluepipe', 'sparky', 'roofing']) {
      await page.goto(`/?biz=${biz}`);
      await expect(page.locator('#openChat')).toBeVisible();
    }
  });

  test('Red Team This Bot button is present on business pages', async ({ page }) => {
    for (const biz of ['bluepipe', 'sparky', 'roofing']) {
      await page.goto(`/?biz=${biz}`);
      await expect(page.locator('#redTeamBtn')).toBeVisible();
    }
  });

  test('Service Co page shows System Prompt Sandbox panel', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    await expect(page.locator('.sc-panel')).toBeVisible();
    await expect(page.locator('.sc-title')).toContainText('System Prompt Sandbox');
  });

  test('Service Co has Loose / Standard / Strict preset buttons', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    await expect(page.getByRole('button', { name: 'Loose', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Standard', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Strict', exact: true })).toBeVisible();
  });

  test('Service Co has model selector with Haiku and Sonnet options', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    const select = page.locator('.sc-model-select');
    await expect(select).toBeVisible();
    await expect(select.locator('option', { hasText: 'Haiku (fast)' })).toHaveCount(1);
    await expect(select.locator('option', { hasText: 'Sonnet (smart)' })).toHaveCount(1);
  });

  test('Service Co has Run Red Team button', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    await expect(page.locator('.sc-rt-btn')).toBeVisible();
  });
});
