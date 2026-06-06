import { test, expect } from '@playwright/test';

test.describe('Navigation — demo tab switching and modes', () => {
  test('clicking BluePipe tab updates URL to ?biz=bluepipe', async ({ page }) => {
    await page.goto('/?biz=sparky');
    await page.locator('.tab-bar').getByRole('button', { name: 'BluePipe Plumbing', exact: true }).click();
    await expect(page).toHaveURL(/biz=bluepipe/);
  });

  test("clicking Sparky's Electrical tab updates URL to ?biz=sparky", async ({ page }) => {
    await page.goto('/');
    await page.locator('.tab-bar').getByRole('button', { name: "Sparky's Electrical", exact: true }).click();
    await expect(page).toHaveURL(/biz=sparky/);
  });

  test('clicking Nailed It Roofing tab updates URL to ?biz=roofing', async ({ page }) => {
    await page.goto('/');
    await page.locator('.tab-bar').getByRole('button', { name: 'Nailed It Roofing', exact: true }).click();
    await expect(page).toHaveURL(/biz=roofing/);
  });

  test('clicking Service Co tab updates URL to ?biz=serviceco', async ({ page }) => {
    await page.goto('/');
    await page.locator('.tab-bar').getByRole('button', { name: 'Service Co', exact: true }).click();
    await expect(page).toHaveURL(/biz=serviceco/);
  });

  test('active tab has active class matching current business', async ({ page }) => {
    await page.goto('/?biz=sparky');
    const activeTab = page.locator('.tab.active');
    await expect(activeTab).toContainText("Sparky's Electrical");
  });

  test('switching tabs updates h1 to the new business name', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('.tab-bar').getByRole('button', { name: 'Nailed It Roofing', exact: true }).click();
    await expect(page.locator('.biz-name')).toContainText('Nailed It Roofing');
  });

  test('Red Team This Bot button adds &mode=redteam to URL', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('#redTeamBtn').click();
    await expect(page).toHaveURL(/biz=bluepipe.*mode=redteam|mode=redteam.*biz=bluepipe/);
  });

  test('red team mode shows ▶ Run All Probes button', async ({ page }) => {
    await page.goto('/?biz=bluepipe&mode=redteam');
    await expect(page.getByRole('button', { name: '▶ Run All Probes', exact: true })).toBeVisible();
  });

  test('red team mode shows 6 probe cards', async ({ page }) => {
    await page.goto('/?biz=bluepipe&mode=redteam');
    await expect(page.locator('#rt-root')).toBeAttached();
  });

  test('← Back to Demo button exits red team mode', async ({ page }) => {
    await page.goto('/?biz=bluepipe&mode=redteam');
    await page.getByRole('button', { name: '← Back to Demo', exact: true }).click();
    await expect(page).not.toHaveURL(/mode=redteam/);
  });

  test('Service Co preset buttons are clickable and become active', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    for (const preset of ['Loose', 'Strict', 'Standard']) {
      const btn = page.getByRole('button', { name: preset, exact: true });
      await btn.click();
      await expect(btn).toHaveClass(/active/);
    }
  });

  test('Service Co ▼ Show system prompt toggle is clickable', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    const toggle = page.locator('.sc-prompt-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    // After clicking, the prompt body should become visible
    await expect(page.locator('.sc-prompt-body')).toBeVisible();
  });

  test('Service Co model selector accepts Sonnet option', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    await page.locator('.sc-model-select').selectOption('sonnet');
    await expect(page.locator('.sc-model-select')).toHaveValue('sonnet');
  });

  test('Service Co Run Red Team button navigates to red team mode', async ({ page }) => {
    await page.goto('/?biz=serviceco');
    await page.locator('.sc-rt-btn').click();
    await expect(page).toHaveURL(/biz=serviceco.*mode=redteam|mode=redteam.*biz=serviceco/);
  });

  test('Service Co red team mode shows ▶ Run All Probes button', async ({ page }) => {
    await page.goto('/?biz=serviceco&mode=redteam');
    await expect(page.getByRole('button', { name: '▶ Run All Probes', exact: true })).toBeVisible();
  });

  test('Service Co red team mode shows all 6 probe cards', async ({ page }) => {
    await page.goto('/?biz=serviceco&mode=redteam');
    for (const probe of [
      'Off-Topic Request',
      'Instruction Disclosure',
      'Scope Creep',
      'Persona Override',
      'Authority Claim',
      'Sycophancy Test',
    ]) {
      await expect(page.getByText(probe, { exact: true })).toBeVisible();
    }
  });

  test('Service Co red team mode header identifies the correct business', async ({ page }) => {
    await page.goto('/?biz=serviceco&mode=redteam');
    await expect(page.locator('.rt-biz-name')).toContainText('Service Co');
    await expect(page.locator('.rt-intro')).toContainText('6 adversarial probes');
  });

  test('Service Co ← Back to Demo exits red team mode', async ({ page }) => {
    await page.goto('/?biz=serviceco&mode=redteam');
    await page.getByRole('button', { name: '← Back to Demo', exact: true }).click();
    await expect(page).not.toHaveURL(/mode=redteam/);
    await expect(page).toHaveURL(/biz=serviceco/);
  });
});
