import type { InterviewQuestion, QuizQuestion } from '../lib/types';

/** Flashcard-style interview questions grouped by topic. */
export const PLAYWRIGHT_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
	// Fundamentals
	{
		id: 'pw-fund-1',
		topic: 'Fundamentals',
		difficulty: 'basic',
		question: 'What is Playwright, in one sentence?',
		answer: 'An open-source browser automation framework that drives real Chromium, Firefox, and WebKit browsers from code, for end-to-end testing.',
	},
	{
		id: 'pw-fund-2',
		topic: 'Fundamentals',
		difficulty: 'basic',
		question: "What's Playwright's biggest advantage over Cypress?",
		answer: 'True cross-browser support (including WebKit/Safari), multi-language bindings, native multi-tab support, and free built-in test parallelization.',
	},
	{
		id: 'pw-fund-3',
		topic: 'Fundamentals',
		difficulty: 'intermediate',
		question: 'Why does nearly every Playwright test function need to be async?',
		answer: "Because almost every Playwright API call (navigation, clicks, assertions) returns a Promise that must be awaited — forgetting await is one of the most common sources of flaky tests.",
	},
	// Locators & Actions
	{
		id: 'pw-loc-1',
		topic: 'Locators & Actions',
		difficulty: 'basic',
		question: 'Why is getByRole() the recommended way to locate elements?',
		answer: 'It finds elements the way a real user or a screen reader would — by role and accessible name — so it survives markup/class changes and doubles as a lightweight accessibility check.',
	},
	{
		id: 'pw-loc-2',
		topic: 'Locators & Actions',
		difficulty: 'intermediate',
		question: 'Does a Locator hold a reference to a specific DOM element?',
		answer: "No — it holds a description of how to find the element. Every action re-queries the live DOM fresh, which is exactly why a Locator stays valid even after the page re-renders.",
	},
	{
		id: 'pw-loc-3',
		topic: 'Locators & Actions',
		difficulty: 'intermediate',
		question: 'How do you act on one specific row of a table containing a known value?',
		answer: "page.locator('table tbody tr').filter({ hasText: 'value' }) — scope to the row first, then call an action within that scoped locator.",
	},
	// Assertions & Waiting
	{
		id: 'pw-wait-1',
		topic: 'Assertions & Waiting',
		difficulty: 'basic',
		question: 'What makes Playwright assertions "auto-retrying"?',
		answer: 'expect() matchers like toBeVisible() poll the condition repeatedly for a timeout window instead of checking once — this is what makes tests resilient to normal UI timing without manual sleeps.',
	},
	{
		id: 'pw-wait-2',
		topic: 'Assertions & Waiting',
		difficulty: 'intermediate',
		question: 'Name the 5 conditions Playwright checks before considering an element actionable.',
		answer: 'Attached to the DOM, visible, stable (not animating), enabled, and not obscured by another element receiving pointer events.',
	},
	{
		id: 'pw-wait-3',
		topic: 'Assertions & Waiting',
		difficulty: 'advanced',
		question: 'What is the difference between the test timeout, the expect timeout, and an action timeout?',
		answer: 'Test timeout bounds the entire test; expect timeout bounds how long an assertion keeps retrying; action timeout bounds how long a single action (click, fill) waits for actionability.',
	},
	// UI Components
	{
		id: 'pw-ui-1',
		topic: 'UI Components',
		difficulty: 'basic',
		question: 'How do you interact with an element inside an <iframe>?',
		answer: "page.locator() only searches the main document — you must go through page.frameLocator('<iframe selector>') first to get a scoped locator API for that frame.",
	},
	{
		id: 'pw-ui-2',
		topic: 'UI Components',
		difficulty: 'intermediate',
		question: 'How do you drive a custom slider widget that has no direct "set value" API?',
		answer: 'Simulate a physical drag using mouse.move/down/move/up with coordinates from the element\'s boundingBox(), or use arrow keys if the widget is keyboard-accessible (often more reliable).',
	},
	// Page Object Model
	{
		id: 'pw-pom-1',
		topic: 'Page Object Model',
		difficulty: 'basic',
		question: 'What problem does the Page Object Model solve?',
		answer: 'Without it, the same selectors get copy-pasted across many test files; when the UI changes, every file needs fixing. POM centralizes locators and actions per page into one class, so there\'s one place to update.',
	},
	{
		id: 'pw-pom-2',
		topic: 'Page Object Model',
		difficulty: 'intermediate',
		question: 'What does a PageManager add on top of individual page objects?',
		answer: 'It instantiates every page object once and exposes them as properties, so a test only constructs one thing instead of `new`-ing up several page object classes individually.',
	},
	{
		id: 'pw-pom-3',
		topic: 'Page Object Model',
		difficulty: 'advanced',
		question: 'When would you reach for a StatefulSet-style base class (BasePage) in a POM suite?',
		answer: 'When multiple page objects share common logic (a load-wait helper, a generic click-by-text helper) — put it once in a BasePage that every page object extends, instead of repeating it.',
	},
	// API Testing
	{
		id: 'pw-api-1',
		topic: 'API Testing',
		difficulty: 'basic',
		question: 'What does page.route() let a test do?',
		answer: 'Intercept any request matching a URL pattern before it leaves the browser — the test can then fully mock it (route.fulfill), modify a real response (route.fetch + fulfill), or let it through unchanged (route.continue).',
	},
	{
		id: 'pw-api-2',
		topic: 'API Testing',
		difficulty: 'intermediate',
		question: 'How do you avoid logging in through the UI before every single test?',
		answer: 'Authenticate once in a setup project/fixture, save the session with context.storageState({ path }), then configure storageState in playwright.config.ts so every test starts already logged in.',
	},
	{
		id: 'pw-api-3',
		topic: 'API Testing',
		difficulty: 'advanced',
		question: 'What\'s the difference between page.route() and page.waitForResponse()?',
		answer: 'page.route() actively intercepts and can change what happens (mock, modify, block); page.waitForResponse() is read-only — it observes real traffic without altering it, used purely for assertions.',
	},
	// Advanced & CI
	{
		id: 'pw-adv-1',
		topic: 'Advanced & CI',
		difficulty: 'intermediate',
		question: 'Why prefer npm ci over npm install in a CI pipeline?',
		answer: 'npm ci installs strictly from the lockfile and fails if package.json and the lockfile are out of sync, guaranteeing identical dependency versions on every run — npm install can silently update the lockfile instead.',
	},
	{
		id: 'pw-adv-2',
		topic: 'Advanced & CI',
		difficulty: 'intermediate',
		question: 'What is a Playwright fixture?',
		answer: "Playwright's dependency-injection mechanism — page, request, and context are built-in fixtures. Custom fixtures provide pre-built setup (like an already-logged-in page) to any test that requests it.",
	},
	{
		id: 'pw-adv-3',
		topic: 'Advanced & CI',
		difficulty: 'advanced',
		question: 'Why run tests in Docker for CI instead of directly on the runner?',
		answer: "It guarantees the exact same browser binaries and OS libraries across every environment, eliminating flakiness caused by browser version drift between a developer's machine and CI.",
	},
];

/** Multiple-choice quiz questions grouped by topic. */
export const PLAYWRIGHT_QUIZ_QUESTIONS: QuizQuestion[] = [
	// Fundamentals
	{
		id: 'pwq-1',
		topic: 'Fundamentals',
		question: 'Which browser engines does Playwright support?',
		options: [
			'Chromium only',
			'Chromium and Firefox only',
			'Chromium, Firefox, and WebKit',
			'Only whichever browser is installed on the OS',
		],
		correct: 2,
		explanation: 'Playwright ships and controls its own builds of Chromium, Firefox, and WebKit — true cross-browser coverage, including Safari\'s engine.',
	},
	{
		id: 'pwq-2',
		topic: 'Fundamentals',
		question: 'What does `npx playwright install --with-deps` do?',
		options: [
			'Installs the @playwright/test npm package',
			'Downloads browser binaries plus the OS-level libraries they need',
			'Installs project dependencies from package.json',
			'Installs a VS Code extension',
		],
		correct: 1,
		explanation: '--with-deps additionally installs OS-level libraries the browsers need to launch — essential on a minimal CI runner that doesn\'t have them by default.',
	},
	{
		id: 'pwq-3',
		topic: 'Fundamentals',
		question: 'In `test(\'name\', async ({ page }) => {...})`, where does `page` come from?',
		options: [
			'A global variable',
			'A built-in Playwright fixture',
			'You must create it manually with new Page()',
			'It is imported from @playwright/test',
		],
		correct: 1,
		explanation: '`page` is a built-in fixture — Playwright automatically provides a fresh, isolated page for every test.',
	},
	{
		id: 'pwq-4',
		topic: 'Fundamentals',
		question: 'What does === check that == does not, in JavaScript?',
		options: [
			'Whether both operands are defined',
			'Type, without coercion',
			'Whether both operands are objects',
			'Nothing — they are identical',
		],
		correct: 1,
		explanation: '=== is strict equality (no type coercion); == is loose equality and coerces types, which is a common source of subtle bugs.',
	},
	// Locators & Actions
	{
		id: 'pwq-5',
		topic: 'Locators & Actions',
		question: 'Which locator is generally the MOST resilient to markup changes?',
		options: [
			"page.locator('.btn-primary-v2')",
			"page.locator('#submit-btn-42')",
			"page.getByRole('button', { name: 'Submit' })",
			"page.locator('div > div > button')",
		],
		correct: 2,
		explanation: 'getByRole matches by accessible role and name, which tends to survive styling/markup refactors far better than CSS classes, IDs, or DOM structure.',
	},
	{
		id: 'pwq-6',
		topic: 'Locators & Actions',
		question: 'What happens if a locator\'s selector matches 3 elements and you call .click() on it directly?',
		options: [
			'It clicks the first match automatically',
			'It clicks all 3 matches',
			'It throws a strict-mode violation error',
			'It clicks the last match',
		],
		correct: 2,
		explanation: 'Playwright refuses to guess — a strict-mode violation is thrown unless you narrow it with .first(), .nth(), or a more specific locator.',
	},
	{
		id: 'pwq-7',
		topic: 'Locators & Actions',
		question: 'How do you scope a locator search to only descendants of a specific parent?',
		options: [
			'page.locator(\'.card\').locator(\'h2\')',
			'page.locator(\'.card h2\', { scope: true })',
			'page.scope(\'.card\').find(\'h2\')',
			'There is no way to scope locators',
		],
		correct: 0,
		explanation: 'Chaining .locator() on an existing locator scopes the search to its descendants — avoids accidentally matching an identical element elsewhere on the page.',
	},
	{
		id: 'pwq-8',
		topic: 'Locators & Actions',
		question: 'Which selects a native <select> option by its visible label rather than its value attribute?',
		options: [
			"selectOption('CA')",
			"selectOption({ label: 'Canada' })",
			"selectOption({ index: 0 })",
			"getByLabel('Canada')",
		],
		correct: 1,
		explanation: "selectOption({ label: ... }) matches by the option's visible text; the plain string form matches by the value attribute instead.",
	},
	// Assertions & Waiting
	{
		id: 'pwq-9',
		topic: 'Assertions & Waiting',
		question: 'Why do Playwright actions rarely need an explicit sleep()/wait() call?',
		options: [
			'Because the test runner adds a fixed delay between every action',
			'Because Playwright auto-waits for the target element to become actionable before acting',
			'Because Playwright disables animations on the page automatically',
			'Because assertions run before actions, guaranteeing order',
		],
		correct: 1,
		explanation: 'Before every action, Playwright polls the target element until it is attached, visible, stable, enabled and unobstructed — eliminating the need for manual waits.',
	},
	{
		id: 'pwq-10',
		topic: 'Assertions & Waiting',
		question: 'What does `expect(locator).toHaveCount(5)` do if the page currently has 3 matching elements but a 4th and 5th appear shortly after?',
		options: [
			'Fails immediately since the count was 3 at the time of the call',
			'Retries the check until the count is 5 or the timeout elapses, then passes',
			'Always fails — toHaveCount cannot retry',
			'Silently ignores the mismatch',
		],
		correct: 1,
		explanation: 'Like other expect() matchers, toHaveCount is auto-retrying — it keeps checking until it\'s true or the assertion timeout runs out.',
	},
	{
		id: 'pwq-11',
		topic: 'Assertions & Waiting',
		question: 'An element is visible on screen but has the `disabled` attribute. Will `locator.click()` proceed?',
		options: [
			'Yes, visibility is the only requirement',
			'No — it keeps waiting for the element to become enabled, then times out if it never does',
			'It clicks anyway and Playwright ignores the disabled state',
			'It throws a syntax error',
		],
		correct: 1,
		explanation: 'Enabled is one of Playwright\'s required actionability checks alongside attached/visible/stable/unobstructed — a disabled element blocks the action until it becomes enabled.',
	},
	// UI Components
	{
		id: 'pwq-12',
		topic: 'UI Components',
		question: 'What is the correct way to fill a payment field inside an embedded <iframe>?',
		options: [
			"page.locator('#card-number').fill(...)",
			"page.frameLocator('#payment-iframe').getByLabel('Card number').fill(...)",
			'It is impossible to interact with iframe content',
			"page.iframe('#payment-iframe').fill(...)",
		],
		correct: 1,
		explanation: 'page.locator() only searches the main document — elements inside an <iframe> require page.frameLocator() first to get a scoped API for that frame.',
	},
	{
		id: 'pwq-13',
		topic: 'UI Components',
		question: 'For native browser dialogs (window.confirm), when must you register the dialog handler?',
		options: [
			'After clicking the button that triggers it',
			'Before triggering the action that opens the dialog',
			'It does not matter, order is irrelevant',
			'Native dialogs cannot be handled by Playwright',
		],
		correct: 1,
		explanation: "page.on('dialog', ...) must be registered before the triggering action — native dialogs block the page and must be handled via the event listener set up in advance.",
	},
	// Page Object Model
	{
		id: 'pwq-14',
		topic: 'Page Object Model',
		question: 'In a well-structured Page Object Model, where should raw CSS/role selectors live?',
		options: [
			'Directly in every test file',
			'Inside page object classes, not in test files',
			'In a single global constants file imported everywhere',
			'Selectors should never be reused',
		],
		correct: 1,
		explanation: 'Keeping selectors inside page objects means a UI change only requires updating one class, not every test file that happened to reference that element.',
	},
	{
		id: 'pwq-15',
		topic: 'Page Object Model',
		question: 'What is the main benefit of a PageManager class?',
		options: [
			'It replaces the need for fixtures entirely',
			'It centralizes instantiating every page object so tests construct one thing instead of many',
			'It automatically generates page objects from HTML',
			'It runs tests in parallel',
		],
		correct: 1,
		explanation: 'Without a PageManager, every test repeats `new LoginPage(page)`, `new NavPage(page)`, etc. — the manager wires all of that up once.',
	},
	// API Testing
	{
		id: 'pwq-16',
		topic: 'API Testing',
		question: 'Which call fully replaces a network response with test-authored data, never touching the real backend?',
		options: [
			'route.continue()',
			'route.fulfill()',
			'route.fetch()',
			'page.waitForResponse()',
		],
		correct: 1,
		explanation: 'route.fulfill() responds immediately with whatever the test provides — the real backend is never contacted at all.',
	},
	{
		id: 'pwq-17',
		topic: 'API Testing',
		question: 'How would you verify the frontend called an endpoint with the correct payload, without changing the response?',
		options: [
			'page.route() with route.fulfill()',
			'page.waitForResponse(), a read-only observer',
			'It cannot be done without mocking',
			'context.newPage()',
		],
		correct: 1,
		explanation: 'waitForResponse() lets a test observe and assert on real network traffic without intercepting or altering it — the read-only counterpart to page.route().',
	},
	{
		id: 'pwq-18',
		topic: 'API Testing',
		question: 'What is the recommended way to authenticate in a pure API test (no browser UI involved)?',
		options: [
			'Log in through the UI first, every time',
			'Pass an Authorization header via request.newContext({ extraHTTPHeaders })',
			'Store the password in the test file directly',
			'API tests cannot be authenticated',
		],
		correct: 1,
		explanation: 'For pure API tests, authentication is typically just an Authorization/Bearer header set on the request context — no UI login flow needed.',
	},
	// Advanced & CI
	{
		id: 'pwq-19',
		topic: 'Advanced & CI',
		question: 'What does `fullyParallel: true` in playwright.config.ts change?',
		options: [
			'Runs every browser project simultaneously',
			'Runs tests within a single file in parallel too, not just across files',
			'Disables retries',
			'Forces headed mode',
		],
		correct: 1,
		explanation: 'By default Playwright parallelizes across files; fullyParallel additionally parallelizes tests within the same file.',
	},
	{
		id: 'pwq-20',
		topic: 'Advanced & CI',
		question: 'Why set `retries: 0` locally but `retries: 2` in CI?',
		options: [
			'Retries are not supported locally',
			'To fail fast while developing, but tolerate occasional CI environment flakiness',
			'CI runners are always more reliable so more retries make sense',
			'There is no meaningful reason to differ',
		],
		correct: 1,
		explanation: 'Local development benefits from immediate, honest failures; CI runs benefit from a safety net against occasional infrastructure flakiness — though retries should never mask a genuinely flaky test.',
	},
	{
		id: 'pwq-21',
		topic: 'Advanced & CI',
		question: 'What triggers a Playwright trace to be recorded with `trace: \'on-first-retry\'`?',
		options: [
			'Every single test, always',
			'Only tests that fail and then get retried',
			'Only tests tagged @trace',
			'Traces are recorded on-demand only via the CLI',
		],
		correct: 1,
		explanation: '"on-first-retry" records a trace only when a test is retried after failing — capturing debugging evidence exactly when it\'s needed, without the overhead of tracing every passing test.',
	},
	{
		id: 'pwq-22',
		topic: 'Advanced & CI',
		question: 'What does a visual regression test (`toHaveScreenshot()`) actually compare?',
		options: [
			'The DOM structure against a saved HTML snapshot',
			'A new screenshot against a previously-approved baseline image, pixel by pixel',
			'The page load time against a threshold',
			'The accessibility tree against WCAG rules',
		],
		correct: 1,
		explanation: 'It compares a freshly captured screenshot against a stored baseline image, failing if the difference exceeds a small pixel tolerance — catching unintended visual regressions functional assertions can\'t see.',
	},
];

export const PLAYWRIGHT_QUIZ_TOPICS = Array.from(
	new Set(PLAYWRIGHT_QUIZ_QUESTIONS.map(q => q.topic)),
);
export const PLAYWRIGHT_INTERVIEW_TOPICS = Array.from(
	new Set(PLAYWRIGHT_INTERVIEW_QUESTIONS.map(q => q.topic)),
);
