import { test, expect } from '@playwright/test';

test.describe('Chat — floating widget (business pages)', () => {
  test('chat widget is not visible before Open Chat is clicked', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await expect(page.locator('.chat-widget')).not.toBeVisible();
  });

  test('clicking Open Chat makes the chat widget visible', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('#openChat').click();
    await expect(page.locator('.chat-widget')).toBeVisible();
  });

  test('chat widget shows business-specific header', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('#openChat').click();
    await expect(page.locator('.chat-header')).toContainText('BluePipe');
  });

  test('chat widget header shows Claude attribution', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('#openChat').click();
    await expect(page.locator('.chat-header')).toContainText('Claude');
  });

  test('chat widget shows initial bot greeting', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('#openChat').click();
    await expect(page.locator('.chat-body .msg.bot').first()).toBeVisible();
  });

  test('chat input textbox is present and interactive', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('#openChat').click();
    const input = page.locator('.chat-input input');
    await expect(input).toBeVisible();
    await input.fill('Hello');
    await expect(input).toHaveValue('Hello');
  });

  test('chat Send button is present', async ({ page }) => {
    await page.goto('/?biz=bluepipe');
    await page.locator('#openChat').click();
    await expect(page.locator('.chat-input').getByRole('button', { name: 'Send', exact: true })).toBeVisible();
  });

  test("Sparky's Electrical chat widget shows correct header", async ({ page }) => {
    await page.goto('/?biz=sparky');
    await page.locator('#openChat').click();
    await expect(page.locator('.chat-header')).toContainText('Sparky');
  });

  test('Nailed It Roofing chat widget shows correct header', async ({ page }) => {
    await page.goto('/?biz=roofing');
    await page.locator('#openChat').click();
    await expect(page.locator('.chat-header')).toContainText('Nailed It');
  });
});

test.describe('Chat — Service Co sandbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?biz=serviceco');
  });

  test('Service Co chat area is visible without opening a widget', async ({ page }) => {
    await expect(page.locator('.sc-chat')).toBeVisible();
  });

  test('Service Co chat has message input textbox', async ({ page }) => {
    const input = page.locator('.sc-chat').getByRole('textbox');
    await expect(input).toBeVisible();
  });

  test('Service Co chat has Send button', async ({ page }) => {
    const send = page.locator('.sc-chat').getByRole('button', { name: 'Send', exact: true });
    await expect(send).toBeVisible();
  });

  test('Service Co chat input is interactive', async ({ page }) => {
    const input = page.locator('.sc-chat').getByRole('textbox');
    await input.fill('Test message');
    await expect(input).toHaveValue('Test message');
  });

  test('Service Co chat shows initial assistant greeting', async ({ page }) => {
    await expect(page.locator('.sc-chat')).toContainText('Service Co');
  });

  test('Service Co Reset button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Reset', exact: true })).toBeVisible();
  });
});
