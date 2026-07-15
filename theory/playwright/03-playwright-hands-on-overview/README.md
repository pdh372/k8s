# Section 3 — Playwright Hands-On Overview

## Playwright Installation

```bash
npm init playwright@latest
```

This scaffolds a project: installs `@playwright/test`, downloads the browser binaries (Chromium, Firefox, WebKit), and generates a starter `playwright.config.ts` plus an example test in `tests/`.

```bash
npx playwright install          # (re)download/update browser binaries
npx playwright install --with-deps   # also install OS-level dependencies (useful in CI)
```

## Test Execution with CLI

```bash
npx playwright test                       # run every test, headless, in all configured browsers
npx playwright test tests/login.spec.ts   # run one file
npx playwright test -g "should log in"    # run tests matching a name pattern
npx playwright test --headed              # show the actual browser window while running
npx playwright test --project=chromium    # run against a single configured browser/project
npx playwright test --debug               # step through a test line by line
```

## Test Execution with UI

```bash
npx playwright test --ui
```

Opens the **Playwright UI Mode** — an interactive test explorer: run individual tests, watch them execute step by step with a live DOM snapshot at each action, time-travel through past runs, and re-run just the failing tests. This is usually the fastest feedback loop while writing new tests.

## Trace View and Debug

A **trace** is a recorded, replayable timeline of a test run — DOM snapshots, network requests, console logs, and screenshots at every step — essential for debugging a failure that only reproduces in CI, where you can't just watch the browser live.

```ts
// playwright.config.ts
export default defineConfig({
	use: {
		trace: 'on-first-retry', // record a trace only when a test is retried after failing
	},
});
```

```bash
npx playwright show-trace trace.zip
```

Opens the trace viewer — a visual, scrubbable timeline of the entire test, including a DOM snapshot for every action and full network activity, making it possible to see exactly what the page looked like at the moment something went wrong.

## Tests Structure

```ts
import { test, expect } from '@playwright/test';

test.describe('Login page', () => {
	test('shows an error for invalid credentials', async ({ page }) => {
		await page.goto('/login');
		await page.fill('#username', 'wrong');
		await page.fill('#password', 'wrong');
		await page.click('#login-button');

		await expect(page.locator('.error-message')).toBeVisible();
	});
});
```

| Construct           | Purpose                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `test.describe()`     | Groups related tests into a named suite (optional, but keeps output organized).      |
| `test()`               | A single test case — takes a name and an async callback.                            |
| `{ page }`             | A **fixture** — Playwright automatically provides a fresh, isolated browser page for every test. |
| `expect()`             | Playwright's assertion function, with built-in auto-retrying matchers like `toBeVisible()`. |

Each test file typically maps to one feature or page of the application under test.

## Hooks and Flow Control

```ts
test.beforeEach(async ({ page }) => {
	await page.goto('/login');   // runs before every test in this file/describe block
});

test.afterEach(async ({ page }) => {
	// cleanup, e.g. logging out
});

test.beforeAll(async () => {
	// runs once before all tests in the file — e.g. seeding shared test data
});

test.afterAll(async () => {
	// runs once after all tests in the file
});
```

| Hook             | Runs                                            |
| ------------------- | ---------------------------------------------------- |
| `beforeEach`        | Before every individual test                          |
| `afterEach`          | After every individual test                            |
| `beforeAll`          | Once, before the first test in the file/block           |
| `afterAll`            | Once, after the last test in the file/block               |

`beforeEach` is by far the most common — it keeps each test starting from the same known state (e.g. already on the login page) without repeating setup code in every test.

## Next

Continue to **Section 4 — Interaction with Web Elements**.
