# bdc-playwright

Playwright end-to-end test suite for [blackdiamondconsulting.ai](https://blackdiamondconsulting.ai) — a public portfolio demo of browser automation and accessibility testing.

## What's tested

| Suite | Tests | What it covers |
|---|---|---|
| `smoke.spec.js` | 7 | Page loads, titles, nav links, CTA hrefs, footer |
| `forms.spec.js` | 6 | Field presence, required attributes, email validation, success message state |
| `accessibility.spec.js` | 4 | WCAG 2.1 AA via axe-core on all three pages + button contrast assertion |

All tests run against the live production site (`https://blackdiamondconsulting.ai`).

## Stack

- [Playwright](https://playwright.dev/) — browser automation
- [@axe-core/playwright](https://github.com/dequelabs/axe-core-npm/tree/develop/packages/playwright) — programmatic WCAG 2.1 AA assertions

## Run locally

```bash
npm install
npx playwright install chromium
npx playwright test
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

## Why this exists

I built this as a portfolio demo alongside my consulting site. It shows:

- Smoke testing a real production site
- Form validation testing without submitting (no test spam)
- Automated accessibility auditing with axe — something I advocate for as a QA professional
- Scoped locators and `exact: true` matching to avoid Playwright strict-mode violations
