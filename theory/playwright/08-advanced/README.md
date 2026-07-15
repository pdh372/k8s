# Section 8 — Advanced

## NPM Scripts and CLI Commands

Wrapping common Playwright commands as `npm` scripts keeps them short and consistent across a team:

```json
{
	"scripts": {
		"test": "playwright test",
		"test:headed": "playwright test --headed",
		"test:ui": "playwright test --ui",
		"test:debug": "playwright test --debug",
		"report": "playwright show-report"
	}
}
```

```bash
npm test
npm run test:ui
```

## Test Data Generator

Hardcoding the same test data everywhere makes tests brittle and easy to accidentally collide (two tests both create a user named `"testuser"`). A library like **Faker** generates realistic, randomized data on demand:

```ts
import { faker } from '@faker-js/faker';

const email = faker.internet.email();
const name = faker.person.fullName();
const productPrice = faker.commerce.price();

await page.getByLabel('Email').fill(email);
```

Randomized data also has a side benefit: it surfaces bugs that only show up with certain input shapes (long names, special characters) instead of always testing the same happy-path values.

## Test Retries

A test can be told to automatically re-run on failure — a pragmatic safety net for occasional environment flakiness, though it should never be a substitute for fixing a genuinely flaky test:

```ts
// playwright.config.ts
export default defineConfig({
	retries: process.env.CI ? 2 : 0, // retry in CI, not locally (fail fast while developing)
});
```

```ts
// Per-test override
test('flaky-prone test', async ({ page }) => {
	test.info().annotations.push({ type: 'retries', description: 'known intermittent' });
	// ...
});
```

## Parallel Execution

Playwright runs test **files** in parallel workers by default — each worker gets its own isolated browser context, so tests don't interfere with each other's cookies/storage:

```ts
export default defineConfig({
	fullyParallel: true,   // also run tests WITHIN a file in parallel, not just across files
	workers: process.env.CI ? 4 : undefined, // undefined = auto-detect based on CPU cores
});
```

```bash
npx playwright test --workers=4
```

Parallelization is a major reason Playwright test suites stay fast even as the number of tests grows — unlike tools that require a paid add-on for this.

## Screenshots and Videos

```ts
// playwright.config.ts
export default defineConfig({
	use: {
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
});
```

```ts
// Manual capture inside a test, e.g. for debugging or a visual record
await page.screenshot({ path: 'screenshot.png', fullPage: true });
```

`only-on-failure`/`retain-on-failure` avoid wasting disk space recording every passing test — only the runs that actually need investigating keep their artifacts.

## Environment Variables

Tests typically need different base URLs/credentials per environment (local, staging, production) without hardcoding any of them into the test files:

```bash
# .env
BASE_URL=https://staging.example.com
API_TOKEN=secret-token-here
```

```ts
// playwright.config.ts
import 'dotenv/config';

export default defineConfig({
	use: {
		baseURL: process.env.BASE_URL,
	},
});
```

`.env` files should always be excluded from version control (`.gitignore`) — they routinely hold real credentials/tokens.

## Configuration File

`playwright.config.ts` is the single place that governs how the whole suite runs — browsers, timeouts, retries, reporters, and more, so tests themselves don't need to repeat this setup:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	timeout: 30_000,
	retries: 1,
	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } },
	],
});
```

`projects` is how a single test suite runs against multiple browsers (or device emulations, see below) without duplicating any test code.

## Fixtures

**Fixtures** are Playwright's dependency-injection mechanism — `page`, `request`, and `context` (used throughout this course) are all built-in fixtures. Custom fixtures let a test declare exactly what setup it needs, without repeating that setup manually in every test:

```ts
// fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login.page';

type MyFixtures = {
	loginPage: LoginPage;
	loggedInPage: Page;
};

export const test = base.extend<MyFixtures>({
	loginPage: async ({ page }, use) => {
		await use(new LoginPage(page));
	},
	loggedInPage: async ({ page }, use) => {
		await page.goto('/login');
		await page.getByLabel('Username').fill('alice');
		await page.getByRole('button', { name: 'Log in' }).click();
		await use(page); // the test receives an already-logged-in page
	},
});
```

```ts
test('dashboard shows the user name', async ({ loggedInPage }) => {
	await expect(loggedInPage.getByText('Welcome, alice')).toBeVisible();
});
```

## Project Setup and Teardown

A **project**-level setup/teardown (distinct from `test.beforeAll`) runs once for an entire `project` entry in the config — commonly used for the authentication flow from Section 7:

```ts
export default defineConfig({
	projects: [
		{ name: 'setup', testMatch: /auth\.setup\.ts/ },
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], storageState: 'auth.json' },
			dependencies: ['setup'], // runs 'setup' project first
		},
	],
});
```

## Global Setup and Teardown

For work that must run exactly once before/after the *entire* test run (seeding a database, starting a mock server), independent of any individual project:

```ts
// global-setup.ts
async function globalSetup() {
	console.log('Seeding test database...');
	// ...
}
export default globalSetup;
```

```ts
export default defineConfig({
	globalSetup: require.resolve('./global-setup'),
	globalTeardown: require.resolve('./global-teardown'),
});
```

## Test Tags

Tags let you run a meaningful subset of a large suite instead of everything:

```ts
test('checkout flow @smoke @critical', async ({ page }) => { /* ... */ });
```

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @slow
```

Common uses: a `@smoke` tag for a fast subset run on every commit, versus the full suite reserved for a nightly/pre-release run.

## Mobile Device Emulator

Playwright ships presets that emulate real device viewports, user agents, and touch input:

```ts
import { devices } from '@playwright/test';

export default defineConfig({
	projects: [
		{ name: 'Mobile Chrome', use: { ...devices['Pixel 7'] } },
		{ name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
	],
});
```

This runs the exact same test suite against mobile viewport/UA combinations — no separate test code needed for responsive checks.

## Reporting

```ts
export default defineConfig({
	reporter: [
		['html', { open: 'never' }],
		['json', { outputFile: 'results.json' }],
		['github'],   // annotates PRs directly in GitHub Actions
	],
});
```

```bash
npx playwright show-report
```

The built-in HTML reporter is the most commonly used locally — a browsable report with pass/fail status, traces, screenshots, and videos per test, generated automatically after every run.

## Visual Testing

**Visual regression testing** compares a screenshot against a previously-approved baseline image, catching unintended visual changes that functional assertions can't see (a misaligned button, a broken layout):

```ts
await expect(page).toHaveScreenshot('homepage.png');
```

The first run saves the baseline; every run after that fails if the new screenshot differs beyond a small pixel tolerance — the diff is included in the HTML report for review. Approve a legitimate visual change by regenerating the baseline:

```bash
npx playwright test --update-snapshots
```

## Playwright with Docker Container

Running tests inside Docker guarantees the exact same browser binaries/OS libraries in every environment (a developer's laptop, CI) — eliminating "works on my machine" flakiness caused by browser version drift:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

CMD ["npx", "playwright", "test"]
```

```bash
docker build -t playwright-tests .
docker run --rm playwright-tests
```

Microsoft publishes official Playwright images with the matching browser versions pre-installed for every release — always pin the image tag to the same Playwright version used in `package.json`.

## GitHub Actions and Argos CI

A typical CI workflow installs dependencies, installs browsers, and runs the suite on every push/PR:

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**Argos CI** (and similar visual-testing services) integrate with this pipeline specifically for the visual-regression screenshots above — instead of comparing against a baseline stored in the repo, screenshots are uploaded to the service, which tracks approved baselines over time and posts a visual diff review directly on the pull request.

## Next

That's the full curriculum. From here: build a small real project end to end — Page Objects for a real app, a CI pipeline running on every push, and a handful of visual regression checks — that's where these pieces actually click together.
