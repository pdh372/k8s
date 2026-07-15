import type { Lab } from '../lib/types';

/**
 * Real-world code exercises: each frames a scenario, gives you the task,
 * then shows a reference solution to compare against. Unlike the K8s labs
 * (run commands against a live cluster), there's no cluster to tear down —
 * "cleanup" here just means removing the file if you don't want to keep it.
 */
export const PLAYWRIGHT_LABS: Lab[] = [
	{
		id: 'first-e2e-test',
		title: 'Write Your First End-to-End Test',
		scenario:
			'Test a login form: fill in valid credentials, submit, and confirm the user lands on the dashboard.',
		difficulty: 'basic',
		minutes: 20,
		tags: ['Locators', 'Assertions', 'Fundamentals'],
		prerequisites: [
			'Node.js installed',
			'A Playwright project scaffolded (`npm init playwright@latest`)',
		],
		whatYouLearn: [
			'Structuring a test() block',
			'Using getByLabel/getByRole locators over CSS selectors',
			'Asserting on the resulting URL after a navigation',
		],
		interviewAngle:
			'Writing a clean first test from a plain-English scenario is one of the most common live-coding prompts — it checks that you reach for the recommended locators and an auto-retrying assertion by default, not brittle CSS or a manual sleep.',
		steps: [
			{
				title: 'The scenario',
				body: 'Given a login page with an email field, a password field, and a "Log in" button, a user entering valid credentials should be redirected to /dashboard.',
			},
			{
				title: 'Your task',
				body: 'Write a test that: navigates to /login, fills in the email and password fields by their labels, clicks the submit button, and asserts the page URL is /dashboard.',
			},
			{
				title: 'Reference solution',
				code: `import { test, expect } from '@playwright/test';

test('logs in with valid credentials', async ({ page }) => {
	await page.goto('/login');

	await page.getByLabel('Email').fill('alice@example.com');
	await page.getByLabel('Password').fill('correct-password');
	await page.getByRole('button', { name: 'Log in' }).click();

	await expect(page).toHaveURL('/dashboard');
});`,
				lang: 'typescript',
			},
			{
				title: 'Common mistakes to check your solution against',
				body: 'Did you use getByLabel/getByRole instead of CSS classes or IDs? Did you await every action? Did you assert on the URL rather than just assuming navigation succeeded?',
			},
		],
		verify: [
			'`npx playwright test first-e2e-test` passes',
			'Temporarily typing the wrong password makes the test fail at the toHaveURL assertion, not earlier',
		],
		cleanup:
			'No cleanup needed — delete the test file if you don\'t want to keep it in your project.',
	},
	{
		id: 'locators-and-waiting',
		title: 'Locators and Auto-Waiting in Practice',
		scenario:
			'A "Add to cart" button is disabled until a product\'s stock check finishes loading (simulated by a short delay). Test that the button only becomes clickable once it\'s actually enabled.',
		difficulty: 'basic',
		minutes: 25,
		tags: ['Locators', 'Auto-Waiting', 'Assertions'],
		prerequisites: ['Completed "Write Your First End-to-End Test"'],
		whatYouLearn: [
			'Why explicit sleeps are unnecessary for this kind of timing',
			'Asserting on element state before acting (toBeEnabled)',
			'Scoping a locator to avoid matching the wrong element',
		],
		interviewAngle:
			'This is a deliberate trap: the intuitive-but-wrong answer is to add a manual wait/sleep before the click. The correct answer is that Playwright already waits for the button to become enabled — the exercise checks you know that, and can prove it with an explicit assertion.',
		steps: [
			{
				title: 'The scenario',
				body: 'On page load, "Add to cart" is disabled. After ~800ms (simulating a stock check), it becomes enabled. Clicking it while enabled adds the item and shows a "1 item in cart" badge.',
			},
			{
				title: 'Your task',
				body: 'Write a test that clicks "Add to cart" and asserts the cart badge updates — without adding any manual sleep/wait call.',
			},
			{
				title: 'Reference solution',
				code: `import { test, expect } from '@playwright/test';

test('cart updates once stock check completes', async ({ page }) => {
	await page.goto('/product/42');

	const addToCart = page.getByRole('button', { name: 'Add to cart' });

	// No manual wait needed — click() auto-waits for the button to be
	// enabled before acting.
	await addToCart.click();

	await expect(page.getByText('1 item in cart')).toBeVisible();
});`,
				lang: 'typescript',
			},
			{
				title: 'Bonus: assert the disabled state explicitly',
				body: 'Add an assertion that the button is disabled immediately after page.goto(), before the stock check finishes, to prove the timing is real and not a coincidence.',
				code: `await expect(addToCart).toBeDisabled();
await expect(addToCart).toBeEnabled(); // waits for it to become true`,
				lang: 'typescript',
			},
		],
		verify: [
			'The test passes without any sleep()/waitForTimeout() call in it',
			'Temporarily removing the auto-wait (e.g. testing against a version of the page where the button is enabled from the start) still passes — proving the assertion is robust either way',
		],
		cleanup:
			'No cleanup needed — delete the test file if you don\'t want to keep it in your project.',
	},
	{
		id: 'refactor-to-pom',
		title: 'Refactor to the Page Object Model',
		scenario:
			'You\'re given a working but repetitive test file with three tests that all fill in the same login form using raw locators copy-pasted in each test. Refactor it into a LoginPage page object.',
		difficulty: 'intermediate',
		minutes: 30,
		tags: ['Page Object Model', 'Refactoring'],
		prerequisites: ['Completed "Write Your First End-to-End Test"'],
		whatYouLearn: [
			'Extracting locators and actions into a page object class',
			'Keeping test files readable and free of raw selectors',
			'Instantiating a page object from the page fixture',
		],
		interviewAngle:
			'Interviewers frequently hand you messy, working test code and ask you to clean it up — this tests whether you recognize duplication as a maintainability problem and know the standard fix (POM), not just whether you can write a passing test from scratch.',
		steps: [
			{
				title: 'The starting point (before refactor)',
				body: 'Three tests, each repeating the same fill/click sequence with raw locators:',
				code: `test('valid login redirects to dashboard', async ({ page }) => {
	await page.goto('/login');
	await page.locator('#email').fill('alice@example.com');
	await page.locator('#password').fill('correct-password');
	await page.locator('button[type="submit"]').click();
	await expect(page).toHaveURL('/dashboard');
});

test('invalid password shows an error', async ({ page }) => {
	await page.goto('/login');
	await page.locator('#email').fill('alice@example.com');
	await page.locator('#password').fill('wrong-password');
	await page.locator('button[type="submit"]').click();
	await expect(page.locator('.error-message')).toBeVisible();
});`,
				lang: 'typescript',
			},
			{
				title: 'Your task',
				body: 'Create a LoginPage class with a login(email, password) method and an errorMessage locator, then rewrite both tests to use it. Also switch the raw CSS selectors to getByLabel/getByRole while you\'re there.',
			},
			{
				title: 'Reference solution — pages/login.page.ts',
				code: `import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
	readonly page: Page;
	readonly errorMessage: Locator;

	constructor(page: Page) {
		this.page = page;
		this.errorMessage = page.getByText(/invalid|error/i);
	}

	async goto() {
		await this.page.goto('/login');
	}

	async login(email: string, password: string) {
		await this.page.getByLabel('Email').fill(email);
		await this.page.getByLabel('Password').fill(password);
		await this.page.getByRole('button', { name: 'Log in' }).click();
	}
}`,
				lang: 'typescript',
			},
			{
				title: 'Reference solution — the refactored tests',
				code: `import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('valid login redirects to dashboard', async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.login('alice@example.com', 'correct-password');

	await expect(page).toHaveURL('/dashboard');
});

test('invalid password shows an error', async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.login('alice@example.com', 'wrong-password');

	await expect(loginPage.errorMessage).toBeVisible();
});`,
				lang: 'typescript',
			},
		],
		verify: [
			'Both tests still pass after the refactor',
			'No CSS class/ID selectors remain in the test files — only in the page object, if at all',
			'A third test can be added for a new login scenario without repeating the fill/click sequence',
		],
		cleanup:
			'No cleanup needed — delete the files if you don\'t want to keep them in your project.',
	},
	{
		id: 'mock-empty-state',
		title: 'Mock an API for an Edge Case',
		scenario:
			'The product list page is nearly impossible to test in an "empty" state against the real backend (there\'s always at least one product). Use page.route() to force an empty response and test the empty-state UI.',
		difficulty: 'intermediate',
		minutes: 25,
		tags: ['API Mocking', 'page.route()'],
		prerequisites: ['Completed "Write Your First End-to-End Test"'],
		whatYouLearn: [
			'Intercepting a request with page.route()',
			'Returning a fully fake response with route.fulfill()',
			'Testing UI states that are hard/impossible to reproduce with real data',
		],
		interviewAngle:
			'This tests whether you reach for mocking specifically when it\'s the *right* tool — an empty-state UI is a textbook case where driving real data into that state would be slow or flaky, but mocking makes it trivial and deterministic.',
		steps: [
			{
				title: 'The scenario',
				body: 'GET /api/products normally returns a non-empty array. The page shows an "empty-state" message and an illustration only when the array is empty — a state you can\'t reliably reach with real seeded data.',
			},
			{
				title: 'Your task',
				body: 'Intercept the /api/products request, force it to return an empty array, then assert the empty-state message appears.',
			},
			{
				title: 'Reference solution',
				code: `import { test, expect } from '@playwright/test';

test('shows the empty state when there are no products', async ({ page }) => {
	await page.route('**/api/products', async route => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify([]),
		});
	});

	await page.goto('/products');

	await expect(page.getByText('No products found')).toBeVisible();
	await expect(page.getByRole('listitem')).toHaveCount(0);
});`,
				lang: 'typescript',
			},
			{
				title: 'Bonus: also test the error state',
				body: 'Add a second test that mocks a 500 response instead, and asserts an error banner appears — same technique, different fulfill() status.',
				code: `test('shows an error banner when the request fails', async ({ page }) => {
	await page.route('**/api/products', route =>
		route.fulfill({ status: 500 }),
	);

	await page.goto('/products');

	await expect(page.getByText(/something went wrong/i)).toBeVisible();
});`,
				lang: 'typescript',
			},
		],
		verify: [
			'Both the empty-state and error-state tests pass',
			'Temporarily removing page.route() (letting the real request through) makes the empty-state assertion fail — proving the mock is what created that state',
		],
		cleanup:
			'No cleanup needed — delete the test file if you don\'t want to keep it in your project.',
	},
	{
		id: 'ship-a-ci-pipeline',
		title: 'Ship a CI Pipeline',
		scenario:
			'The test suite only runs on developers\' laptops so far. Add a GitHub Actions workflow that runs it automatically on every push and pull request, and keeps the HTML report even when tests fail.',
		difficulty: 'advanced',
		minutes: 20,
		tags: ['CI/CD', 'GitHub Actions'],
		prerequisites: [
			'A GitHub repository with a working local Playwright suite',
		],
		whatYouLearn: [
			'Writing a GitHub Actions workflow for Playwright',
			'Installing browsers correctly in a CI environment',
			'Uploading the HTML report as a downloadable artifact, even on failure',
		],
		interviewAngle:
			'"Make this run in CI" is a very common practical ask once a suite exists locally — it tests whether you know the CI-specific gotchas (installing browser deps, keeping artifacts on failure) that don\'t show up when running locally.',
		steps: [
			{
				title: 'Your task',
				body: 'Create .github/workflows/playwright.yml that: triggers on push and pull_request, installs dependencies with npm ci, installs browsers with OS deps, runs the suite, and uploads the HTML report as an artifact even if the run fails.',
			},
			{
				title: 'Reference solution — .github/workflows/playwright.yml',
				code: `name: Playwright Tests
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
          retention-days: 30`,
				lang: 'yaml',
			},
			{
				title: 'Why `if: always()` matters here',
				body: 'Without it, the upload step is skipped whenever the previous step (running the tests) fails — which is exactly when the report, traces, and screenshots are most needed for debugging.',
			},
		],
		verify: [
			'Pushing a branch triggers the workflow in the Actions tab',
			'Intentionally breaking a test and pushing still produces a downloadable "playwright-report" artifact on the failed run',
		],
		cleanup:
			'No cleanup needed — the workflow file can stay in the repo permanently once it works.',
	},
];

export const PLAYWRIGHT_LAB_TAGS = Array.from(
	new Set(PLAYWRIGHT_LABS.flatMap(l => l.tags)),
).sort();

export function getPlaywrightLab(id: string): Lab | undefined {
	return PLAYWRIGHT_LABS.find(l => l.id === id);
}
