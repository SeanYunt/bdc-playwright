import { test, expect } from '@playwright/test';

// Intercept window.plausible before page scripts run.
// The Plausible inline snippet uses `window.plausible = window.plausible || fn`
// so a value already set by addInitScript won't be overwritten.
// plausible-events.js captures `var p = window.plausible` at load time,
// so all event calls go to our spy regardless of later changes.
function setupSpy(page) {
  return page.addInitScript(() => {
    window.__plausibleCalls = [];
    window.plausible = function (event, options) {
      window.__plausibleCalls.push({ event, options: options || {} });
    };
  });
}

function getCalls(page) {
  return page.evaluate(() => window.__plausibleCalls);
}

function findEvent(calls, name) {
  return calls.find(c => c.event === name);
}

// Add a capture-phase listener that calls preventDefault() on matching link
// clicks — this stops browser navigation without stopping propagation, so
// plausible-events.js handlers (registered in the bubbling phase) still fire.
function preventNavigation(page, href) {
  return page.evaluate((h) => {
    document.addEventListener('click', function (e) {
      if (e.target.closest(`a[href="${h}"]`)) e.preventDefault();
    }, { capture: true });
  }, href);
}

test.describe('Analytics — Resources Filter', () => {
  test.beforeEach(async ({ page }) => {
    await setupSpy(page);
    await page.goto('/resources/');
  });

  const filterPills = [
    { label: 'Prompt injection', category: 'prompt-injection' },
    { label: 'Hallucination', category: 'hallucination' },
    { label: 'Data leakage', category: 'data-leakage' },
    { label: 'Model behavior', category: 'model-behavior' },
    { label: 'Methodology', category: 'methodology' },
  ];

  for (const { label, category } of filterPills) {
    test(`fires "Resources Filter" with category "${category}" when "${label}" pill clicked`, async ({ page }) => {
      await page.getByRole('button', { name: label, exact: true }).click();

      const calls = await getCalls(page);
      const ev = findEvent(calls, 'Resources Filter');

      expect(ev, '"Resources Filter" event should have fired').toBeDefined();
      expect(ev.options.props.category).toBe(category);
    });
  }

  test('does NOT fire "Resources Filter" when "All" pill clicked', async ({ page }) => {
    // Click a real category first, then reset spy and click All
    await page.getByRole('button', { name: 'Prompt injection', exact: true }).click();
    await page.evaluate(() => { window.__plausibleCalls = []; });

    await page.getByRole('button', { name: 'All', exact: true }).click();

    const calls = await getCalls(page);
    expect(findEvent(calls, 'Resources Filter')).toBeUndefined();
  });
});

test.describe('Analytics — CTA placement property (homepage)', () => {
  test.beforeEach(async ({ page }) => {
    await setupSpy(page);
    await page.goto('/');
  });

  // --- Risk Check CTA (anchor links — no cross-page navigation needed) ---

  test('Risk Check CTA Click fires with placement "home" from hero', async ({ page }) => {
    await page.locator('#home a[href="#risk-check"]').click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Check CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('home');
  });

  test('Risk Check CTA Click fires with placement "final-cta" from bottom CTA section', async ({ page }) => {
    await page.locator('.final-cta a[href="#risk-check"]').click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Check CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('final-cta');
  });

  // --- Risk Assessment CTA (cross-page navigation — preventDefault keeps context) ---

  test('Risk Assessment CTA Click fires with placement "home" from hero', async ({ page }) => {
    await preventNavigation(page, '/risk-assessment/');
    await page.locator('#home a[href="/risk-assessment/"]').click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Assessment CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('home');
  });

  test('Risk Assessment CTA Click fires with placement "risk-cta-wrap" from risk check result', async ({ page }) => {
    await preventNavigation(page, '/risk-assessment/');
    // The link is inside #risk-result which is also hidden, so triggering
    // visibility is complex. Dispatch a synthetic click instead — the plausible
    // listener and the capture-phase navigation blocker both fire on bubbling events.
    await page.evaluate(() => {
      document.querySelector('#risk-cta-wrap a[href="/risk-assessment/"]')
        .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Assessment CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('risk-cta-wrap');
  });

  test('Risk Assessment CTA Click fires with placement "resources" from resources preview section', async ({ page }) => {
    await preventNavigation(page, '/risk-assessment/');
    await page.locator('#resources a[href="/risk-assessment/"]').click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Assessment CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('resources');
  });

  test('Risk Assessment CTA Click fires with placement "final-cta" from bottom CTA section', async ({ page }) => {
    await preventNavigation(page, '/risk-assessment/');
    await page.locator('.final-cta a[href="/risk-assessment/"]').click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Assessment CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('final-cta');
  });

  // --- AI Assistant CTA ---

  test('AI Assistant CTA Click fires with placement "ai-assistant-teaser"', async ({ page }) => {
    await preventNavigation(page, '/ai-assistant/');
    await page.locator('#ai-assistant-teaser a[href="/ai-assistant/"]').click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'AI Assistant CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('ai-assistant-teaser');
  });
});

test.describe('Analytics — CTA placement property (/resources/)', () => {
  test.beforeEach(async ({ page }) => {
    await setupSpy(page);
    await page.goto('/resources/');
  });

  test('Risk Assessment CTA Click fires with placement "start-here" from start-here panel', async ({ page }) => {
    await preventNavigation(page, '/risk-assessment/');
    await page.locator('#start-here a[href="/risk-assessment/"]').first().click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Assessment CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('start-here');
  });

  test('Risk Assessment CTA Click fires with placement "technical-library" from library CTA', async ({ page }) => {
    await preventNavigation(page, '/risk-assessment/');
    await page.locator('#technical-library a[href="/risk-assessment/"]').first().click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Risk Assessment CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props.placement).toBe('technical-library');
  });
});

test.describe('Analytics — Assessment Form CTA (/risk-assessment/)', () => {
  test.beforeEach(async ({ page }) => {
    await setupSpy(page);
    await page.goto('/risk-assessment/');
  });

  test('Assessment Form CTA Click fires with placement prop when hero CTA clicked', async ({ page }) => {
    // The risk-assessment hero section has no id, so getPlacement() falls back to "page"
    await page.locator('a[href="#assessment-form"]').first().click();

    const calls = await getCalls(page);
    const ev = findEvent(calls, 'Assessment Form CTA Click');

    expect(ev).toBeDefined();
    expect(ev.options.props).toHaveProperty('placement');
    expect(ev.options.props.placement).toBe('page');
  });
});
