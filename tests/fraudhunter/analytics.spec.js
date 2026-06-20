import { test, expect } from '@playwright/test';
import {
  stubBase, stubScan, stubProfile, stubLookup, stubDossiers,
  setupSpy, getCalls, findEvent,
  PROFILE_FRESH_FIXTURE, PROFILE_CACHED_FIXTURE,
} from './helpers.js';

test.describe('Analytics — Scan Run event', () => {
  test('fires "Scan Run" with state "WY" after scan completes', async ({ page }) => {
    setupSpy(page);
    await stubBase(page);
    await stubScan(page);
    await page.goto('/');

    await page.locator('#scan-btn').click();
    await expect(page.locator('#scan-results')).toBeVisible({ timeout: 10000 });

    await page.waitForFunction(() =>
      window.__plausibleCalls.some(c => c.event === 'Scan Run')
    );

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Scan Run');
    expect(ev).toBeDefined();
    expect(ev.options.props.state).toBe('WY');
  });
});

test.describe('Analytics — Lookup Search event', () => {
  test('fires "Lookup Search" (no props) when lookup is triggered', async ({ page }) => {
    setupSpy(page);
    await stubBase(page);
    await stubLookup(page);
    await page.goto('/');

    await page.locator('#tab-lookup').click();
    await page.fill('#lookup-query', 'SMITH');
    await page.locator('#lookup-btn').click();

    await expect(page.locator('#lookup-results')).toContainText('result', { timeout: 10000 });

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Lookup Search');
    expect(ev).toBeDefined();
  });
});

test.describe('Analytics — Profile Built event', () => {
  test('fires "Profile Built" with score "82%" after fresh profile completes', async ({ page }) => {
    setupSpy(page);
    await stubBase(page);
    await stubProfile(page, PROFILE_FRESH_FIXTURE);
    await page.goto('/');

    await page.locator('#tab-profile').click();
    await page.locator('#profile-btn').click();
    await expect(page.locator('#profile-result')).toBeVisible({ timeout: 10000 });

    await page.waitForFunction(() =>
      window.__plausibleCalls.some(c => c.event === 'Profile Built')
    );

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Profile Built');
    expect(ev).toBeDefined();
    expect(ev.options.props.score).toBe('82%');
  });
});

test.describe('Analytics — Profile View event', () => {
  test('fires "Profile View" with cached:"true" for cached result', async ({ page }) => {
    setupSpy(page);
    await stubBase(page);
    await stubProfile(page, PROFILE_CACHED_FIXTURE);
    await page.goto('/');

    await page.locator('#tab-profile').click();
    await page.locator('#profile-btn').click();
    await expect(page.locator('#profile-result')).toBeVisible({ timeout: 10000 });

    await page.waitForFunction(() =>
      window.__plausibleCalls.some(c => c.event === 'Profile View')
    );

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Profile View');
    expect(ev).toBeDefined();
    expect(ev.options.props.cached).toBe('true');
  });
});

test.describe('Analytics — Dossier Download event from profile result', () => {
  test('fires "Dossier Download" when PDF link clicked in profile result', async ({ page }) => {
    setupSpy(page);
    await stubBase(page);
    await stubProfile(page, PROFILE_FRESH_FIXTURE);
    await page.goto('/');

    await page.locator('#tab-profile').click();
    await page.locator('#profile-btn').click();
    await expect(page.locator('#profile-result')).toBeVisible({ timeout: 10000 });

    // Suppress the new tab that opens when the PDF link is clicked
    page.on('popup', async popup => popup.close());

    const pdfLink = page.locator('#profile-result a[href*=".pdf"]').first();
    await pdfLink.click();

    await page.waitForFunction(() =>
      window.__plausibleCalls.some(c => c.event === 'Dossier Download')
    );

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Dossier Download');
    expect(ev).toBeDefined();
  });
});

test.describe('Analytics — Dossier Download event from dossiers list', () => {
  test('fires "Dossier Download" when PDF link clicked in dossiers list', async ({ page }) => {
    setupSpy(page);
    await stubBase(page);
    await stubDossiers(page);
    await page.goto('/');

    await page.locator('#tab-dossiers').click();
    await expect(page.locator('#dossiers-list')).toBeVisible({ timeout: 5000 });

    page.on('popup', async popup => popup.close());

    const pdfLink = page.locator('#dossiers-list a[href*=".pdf"]').first();
    await pdfLink.click();

    await page.waitForFunction(() =>
      window.__plausibleCalls.some(c => c.event === 'Dossier Download')
    );

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Dossier Download');
    expect(ev).toBeDefined();
  });
});
