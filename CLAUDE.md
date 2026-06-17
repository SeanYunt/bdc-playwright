# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

End-to-end Playwright test suite for [blackdiamondconsulting.ai](https://blackdiamondconsulting.ai) and its demo site. Tests run against the **live production site** by default — no local server needed. The repo also includes PDF generation scripts for producing styled report documents.

## Commands

```bash
# Install dependencies and browser
npm install
npx playwright install chromium

# Run all tests (production site)
npx playwright test

# Run a single test file
npx playwright test tests/smoke.spec.js
npx playwright test tests/forms.spec.js
npx playwright test tests/navigation.spec.js
npx playwright test tests/accessibility.spec.js
npx playwright test tests/analytics.spec.js

# Run demo-site tests only
npx playwright test tests/demo/

# Run a single test by name
npx playwright test -g "homepage loads with correct title"

# Open HTML report after a run
npx playwright show-report

# Override the target URL (e.g. for a local Hugo server)
BASE_URL=http://localhost:1313 npx playwright test
```

## Architecture

### Playwright projects (`playwright.config.js`)

| Project | `baseURL` | Matches |
|---|---|---|
| `chromium` | `https://blackdiamondconsulting.ai` (or `BASE_URL`) | `tests/*.spec.js` |
| `demo-chromium` | `https://demo.blackdiamondconsulting.ai` | `tests/demo/*.spec.js` |

- Chromium only, HTML reporter, trace on first retry
- CI mode: `retries: 2`, `workers: 1`, `forbidOnly: true`

### Test files

| File | Scope |
|---|---|
| `tests/smoke.spec.js` | Page loads, titles, hero sections, nav links, CTAs, footer |
| `tests/forms.spec.js` | Field presence, required attributes, email validation, Formspree integration |
| `tests/navigation.spec.js` | Logo, nav links, anchor sections, resource filter pills, CTA routing |
| `tests/accessibility.spec.js` | WCAG 2.1 AA audit via `@axe-core/playwright` on all four pages |
| `tests/analytics.spec.js` | Plausible CE event tracking: filter pills, CTA placement property, form CTAs |
| `tests/demo/*.spec.js` | Smoke, navigation, chat, and accessibility for the demo chatbot site |

Pages under test (production): `/`, `/risk-assessment/`, `/resources/`, `/ai-assistant/`

### Locator conventions

- Scope to a container before querying: `page.locator('.site-nav').getByRole('link', ...)`
- Use `exact: true` to avoid strict-mode violations when similar elements exist
- Anchor sections: `#risk-check`, `#get-started`, `#roi`, etc.
- Form fields: `#name`, `#email`, `#ai_description`, etc.
- Formspree submissions validated via `page.route()` / `page.waitForRequest()`

### Analytics tests (`tests/analytics.spec.js`)

The site's `plausible-events.js` captures `var p = window.plausible` at load time. Tests intercept it with two helpers:

**`setupSpy(page)`** — must be called before `page.goto()`. Uses `page.addInitScript()` to install `window.plausible` before any page scripts run. The Plausible inline snippet uses `window.plausible = window.plausible || fn`, so a pre-set value is preserved and all event calls go to the spy.

**`preventNavigation(page, href)`** — must be called before clicking a cross-page link. Registers a capture-phase `addEventListener` that calls `e.preventDefault()` without stopping propagation. This keeps the page context alive for `page.evaluate()` while still allowing the plausible handler (registered in the bubbling phase) to fire. **Do not use `page.route()` abort for this** — it races with `page.evaluate()` and causes "Execution context was destroyed" errors.

For links inside hidden ancestor elements (e.g. `#risk-cta-wrap` which lives inside a hidden result container), use a synthetic click instead of a real one — visibility checks can't be bypassed reliably:

```js
await page.evaluate(() => {
  document.querySelector('#risk-cta-wrap a[href="/risk-assessment/"]')
    .dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
});
```

**`getPlacement()` logic** (defined in `plausible-events.js`):
- `.final-cta` ancestor → `'final-cta'` (class check fires before id check)
- nearest ancestor `[id]` → that id (e.g. `'home'`, `'resources'`, `'risk-cta-wrap'`)
- `nav` ancestor → `'nav'`, `footer` ancestor → `'footer'`
- fallback → `'page'` (e.g. risk-assessment hero, which has no ancestor with an id)

### PDF generation scripts

`make-pdf.js` reads a Markdown file with YAML frontmatter, renders it to styled HTML, and uses Playwright to export a PDF. Supports `<!-- PAGE -->` comments for manual page breaks. Output path comes from the frontmatter `output` field.

```bash
node make-pdf.js <path-to-report.md>
```

`gen-pdf.js`, `gen-airline-pdf.js`, and `debug-pdf.js` are one-off/debugging variants.
