import type { Diagram } from '../lib/types';

/**
 * Playwright test architecture. Coordinates live in a 960x680 viewBox.
 * Top region: what you author (config, test file, fixtures). Middle region:
 * what Playwright actually drives (browser, context, page). Bottom region:
 * how you interact with the page (locators, auto-retrying assertions).
 */
const TEST_ARCHITECTURE_DIAGRAM: Diagram = {
	id: 'test-architecture',
	title: 'Test Architecture',
	subtitle:
		'What you write vs. what Playwright drives underneath it. Click a component to dig in.',
	viewBox: '0 0 960 680',
	defaultSelected: 'page',
	groups: {
		authoring: { color: '#38bdf8', label: 'Authoring' },
		browser: { color: '#5B8DEF', label: 'Browser Layer' },
		interaction: { color: '#34d399', label: 'Interaction' },
	},
	boxes: [
		{
			x: 40,
			y: 40,
			w: 880,
			h: 180,
			label: 'What you author',
			variant: 'solid',
		},
		{
			x: 40,
			y: 260,
			w: 880,
			h: 180,
			label: 'What Playwright drives (per test)',
			variant: 'solid',
		},
		{
			x: 40,
			y: 480,
			w: 880,
			h: 160,
			label: 'How you interact with the page',
			variant: 'ghost',
			labelAlign: 'center',
		},
	],
	nodes: [
		{
			id: 'playwright-config',
			label: 'playwright.config.ts',
			group: 'authoring',
			x: 64,
			y: 88,
			w: 220,
			h: 76,
			tagline: 'The one place global behavior is set',
			details:
				'Declares browsers/projects to run against, base URL, timeouts, retries, and reporters. Every test in the suite inherits these defaults unless it explicitly overrides them.',
			questions: [
				{
					q: 'How do you run the same suite against Chromium, Firefox, and WebKit?',
					a: 'Define one `projects` entry per browser in the config — Playwright runs every test file against each project automatically, no test code duplication needed.',
				},
				{
					q: 'Where do global timeout and retry defaults live?',
					a: 'In `playwright.config.ts` — the `timeout`, `expect.timeout`, and `retries` top-level options, overridable per-test if a specific case needs different behavior.',
				},
			],
		},
		{
			id: 'test-file',
			label: 'Test File (.spec.ts)',
			group: 'authoring',
			x: 370,
			y: 88,
			w: 220,
			h: 76,
			tagline: 'Describes user behavior, not implementation',
			details:
				'Contains `test()` blocks (optionally grouped in `test.describe()`), each an async function that drives the app and asserts on the result. Reads like a script of what a user does.',
			questions: [
				{
					q: 'Why does every test callback have to be async?',
					a: "Because nearly every Playwright API call (navigation, clicks, assertions) returns a Promise — the test needs to await each step, or actions could race ahead of the browser's actual state.",
				},
				{
					q: "What's the difference between test.describe and a plain function grouping tests?",
					a: "test.describe is Playwright's own grouping construct — it shows up as a named suite in the report/UI mode and lets you scope hooks (beforeEach) to just that group.",
				},
			],
		},
		{
			id: 'fixtures',
			label: 'Fixtures',
			group: 'authoring',
			x: 676,
			y: 88,
			w: 220,
			h: 76,
			tagline: "Playwright's dependency injection",
			details:
				'Provide everything a test needs — page, request, context — already set up before the test body runs. Custom fixtures compose setup logic (e.g. an already-logged-in page) without repeating it in every test.',
			questions: [
				{
					q: 'Where does the `page` argument in `test(\'...\', async ({ page }) => {})` come from?',
					a: "It's a built-in fixture — Playwright creates a fresh, isolated page (and browser context) for the test automatically, no manual setup required.",
				},
				{
					q: 'Why write a custom fixture instead of a beforeEach hook?',
					a: 'A fixture is declared once and only runs for tests that actually request it, can build on other fixtures, and is strongly typed — beforeEach always runs for every test in scope, even ones that don\'t need that setup.',
				},
			],
		},
		{
			id: 'browser',
			label: 'Browser',
			group: 'browser',
			x: 64,
			y: 308,
			w: 200,
			h: 76,
			tagline: 'One real browser process',
			details:
				'A single Chromium, Firefox, or WebKit process launched by Playwright — potentially shared across many tests/workers for speed, since launching a browser is the most expensive part of a test run.',
			questions: [
				{
					q: 'Is a new Browser launched for every single test?',
					a: 'No — Playwright typically launches one Browser per worker process and reuses it across many tests, creating a fresh BrowserContext (not a fresh Browser) for isolation between tests.',
				},
				{
					q: 'Headless vs. headed — what actually differs?',
					a: 'The same browser engine runs either way; headed just renders an actual window so a human can watch. Headless is the default and faster, used in CI.',
				},
			],
		},
		{
			id: 'browser-context',
			label: 'BrowserContext',
			group: 'browser',
			x: 330,
			y: 308,
			w: 260,
			h: 76,
			tagline: 'An isolated, incognito-like session',
			details:
				"Its own cookies, localStorage, and cache — completely isolated from every other context, even within the same Browser process. This is what makes tests independent without needing a fresh browser launch each time.",
			questions: [
				{
					q: 'How does Playwright keep tests from leaking state into each other?',
					a: 'Each test typically gets its own BrowserContext (via the `page` fixture), so cookies/storage from one test never bleed into the next — no manual cleanup needed.',
				},
				{
					q: 'How would you reuse a logged-in session across many tests without re-logging-in every time?',
					a: 'Save the authenticated context with `storageState()` once, then load it via `storageState` in the config so every new context starts already signed in.',
				},
			],
		},
		{
			id: 'page',
			label: 'Page',
			group: 'browser',
			x: 656,
			y: 308,
			w: 200,
			h: 76,
			tagline: 'A single tab',
			details:
				"The object almost every test interacts with directly — navigate (`goto`), find elements (`locator`), and read state from it. A BrowserContext can hold multiple Pages (tabs/popups) at once.",
			questions: [
				{
					q: 'Can one test drive two browser tabs at the same time?',
					a: 'Yes — call `context.newPage()` for a second tab within the same BrowserContext, e.g. to test a flow that opens a new window.',
				},
				{
					q: 'Does closing a Page end the test?',
					a: "No, but any further action on that Page will fail since it no longer exists — the test controls the Page's lifecycle explicitly.",
				},
			],
		},
		{
			id: 'locator',
			label: 'Locator',
			group: 'interaction',
			x: 180,
			y: 528,
			w: 260,
			h: 76,
			tagline: 'A lazy description of an element',
			details:
				"Doesn't find an element immediately — it's re-resolved fresh every time you act on it. This is what makes actions auto-wait: Playwright keeps re-querying the DOM until the described element becomes actionable.",
			questions: [
				{
					q: 'Why prefer `page.getByRole()` over a raw CSS selector?',
					a: 'It matches the way a real user (or a screen reader) identifies an element — by role and accessible name — so it survives markup/class changes and doubles as a lightweight accessibility check.',
				},
				{
					q: 'Does a Locator hold a reference to a specific DOM node?',
					a: 'No — it holds a description (the selector). Every action re-queries the live DOM, which is exactly why a Locator stays valid even after the page re-renders.',
				},
			],
		},
		{
			id: 'expect',
			label: 'expect()',
			group: 'interaction',
			x: 520,
			y: 528,
			w: 260,
			h: 76,
			tagline: 'Auto-retrying assertions',
			details:
				"Playwright's assertion matchers (toBeVisible, toHaveText, ...) poll the condition for a timeout window instead of checking once — this is what lets tests avoid manual sleeps for normal UI timing like a fade-in or async data load.",
			questions: [
				{
					q: 'Why can `expect(locator).toBeVisible()` pass even if the element wasn\'t visible the instant the line executed?',
					a: "It retries the check internally until the element becomes visible or the assertion timeout elapses — it only fails if the condition is never true within that window.",
				},
				{
					q: "What's the risk of using a plain `if` check on a locator's state instead of an expect matcher?",
					a: "A plain check runs once, immediately — it doesn't wait, so it can flakily fail on state that would have become true a moment later. expect() matchers exist specifically to avoid that.",
				},
			],
		},
	],
	edges: [
		{ from: 'playwright-config', to: 'test-file' },
		{ from: 'test-file', to: 'fixtures' },
		{ from: 'fixtures', to: 'page', dashed: true },
		{ from: 'browser', to: 'browser-context' },
		{ from: 'browser-context', to: 'page' },
		{ from: 'page', to: 'locator' },
		{ from: 'locator', to: 'expect' },
	],
};

/**
 * Locator resolution & auto-waiting. Coordinates live in a 960x460 viewBox.
 * A linear pipeline with a dashed self-loop (check -> query) representing
 * the retry poll, ending in a success/failure split.
 */
const LOCATOR_RESOLUTION_DIAGRAM: Diagram = {
	id: 'locator-resolution',
	title: 'Locator Resolution & Auto-Waiting',
	subtitle:
		"What actually happens between calling locator.click() and the click landing. Click a step to dig in.",
	viewBox: '0 0 960 460',
	defaultSelected: 'check-actionable',
	groups: {
		trigger: { color: '#38bdf8', label: 'Trigger' },
		engine: { color: '#5B8DEF', label: 'Resolution Engine' },
		success: { color: '#34d399', label: 'Success' },
		failure: { color: '#fb7185', label: 'Failure' },
	},
	boxes: [
		{
			x: 40,
			y: 40,
			w: 880,
			h: 260,
			label: 'On every action (click, fill, check, ...)',
			variant: 'solid',
		},
	],
	nodes: [
		{
			id: 'locator-call',
			label: 'locator.click()',
			group: 'trigger',
			x: 64,
			y: 88,
			w: 200,
			h: 68,
			tagline: 'The action a test asks for',
			details:
				"The entry point — a test calls an action on a Locator. Nothing happens to the page yet; this just kicks off the resolution process below.",
			questions: [
				{
					q: "Does calling locator.click() find the element immediately?",
					a: "No — it starts a resolution loop that repeatedly queries the DOM until the element is actionable, rather than acting on a single snapshot.",
				},
				{
					q: 'Is this behavior different for `fill`, `check`, or `hover`?',
					a: 'No — every Playwright action (click, fill, check, hover, selectOption, ...) goes through this same query-and-wait cycle before acting.',
				},
			],
		},
		{
			id: 'query-dom',
			label: 'Query the DOM',
			group: 'engine',
			x: 340,
			y: 88,
			w: 220,
			h: 68,
			tagline: "Re-run the locator's selector",
			details:
				"Playwright re-evaluates the Locator's selector against the live DOM right now — not a cached reference from when the Locator was created. This is why a Locator stays valid across re-renders.",
			questions: [
				{
					q: "Why re-query instead of caching the element handle from the first match?",
					a: "A cached handle can go stale the instant React/Vue re-renders the DOM. Re-querying every time guarantees the action always targets whatever is currently on screen.",
				},
				{
					q: 'What happens if the selector matches more than one element?',
					a: "The action throws a strict-mode violation error immediately — Playwright refuses to guess which one you meant, unless you narrow it with .first(), .nth(), or a more specific locator.",
				},
			],
		},
		{
			id: 'check-actionable',
			label: 'Actionability Checks',
			group: 'engine',
			x: 640,
			y: 88,
			w: 240,
			h: 68,
			tagline: 'Attached, visible, stable, enabled, unobstructed',
			details:
				"Playwright verifies the element is attached to the DOM, visible, not still animating (stable), enabled, and not covered by another element receiving pointer events — all before considering it safe to interact with.",
			questions: [
				{
					q: 'What does "stable" mean in this checklist?',
					a: "The element's bounding box hasn't changed between two consecutive animation frames — it protects against clicking a button mid-transition/animation and missing.",
				},
				{
					q: "An element is visible but disabled — does the click proceed?",
					a: "No — enabled is one of the required checks. The action keeps waiting (and eventually times out) until the element becomes enabled, or fails immediately if it can prove the element will never be enabled.",
				},
			],
		},
		{
			id: 'perform-action',
			label: 'Perform the Action',
			group: 'success',
			x: 220,
			y: 320,
			w: 240,
			h: 68,
			tagline: 'All checks passed',
			details:
				"Once every actionability condition is true, Playwright dispatches the real browser input event (a real mouse click, real keystrokes) — not a synthetic DOM event — so the page reacts exactly as it would to a human.",
			questions: [
				{
					q: 'Why does Playwright use real input events instead of dispatching a synthetic click event?',
					a: "Some apps listen for genuine pointer/keyboard events specifically (or behave differently for synthetic ones) — real input guarantees the same code path a real user triggers.",
				},
			],
		},
		{
			id: 'timeout-error',
			label: 'Timeout Exceeded',
			group: 'failure',
			x: 560,
			y: 320,
			w: 240,
			h: 68,
			tagline: "Never became actionable in time",
			details:
				"If the actionability checks never all pass within the action (or test) timeout, Playwright fails with a specific, readable error naming exactly which check never passed — e.g. \"element is not visible\" — instead of a generic timeout.",
			questions: [
				{
					q: 'Why is a specific "element is not visible" error more useful than a generic timeout?',
					a: "It tells you exactly which actionability condition failed, pointing straight at the bug (a hidden element, a covering overlay) instead of leaving you to guess why the action never completed.",
				},
			],
		},
	],
	edges: [
		{ from: 'locator-call', to: 'query-dom' },
		{ from: 'query-dom', to: 'check-actionable' },
		{ from: 'check-actionable', to: 'query-dom', dashed: true },
		{ from: 'check-actionable', to: 'perform-action' },
		{ from: 'check-actionable', to: 'timeout-error', dashed: true },
	],
};

/**
 * Page Object Model structure. Coordinates live in a 960x520 viewBox.
 */
const PAGE_OBJECT_MODEL_DIAGRAM: Diagram = {
	id: 'page-object-model',
	title: 'Page Object Model Structure',
	subtitle:
		'How a test, a page manager, individual page objects, and a shared base class fit together. Click a component to dig in.',
	viewBox: '0 0 960 520',
	defaultSelected: 'page-manager',
	groups: {
		test: { color: '#38bdf8', label: 'Test' },
		manager: { color: '#a78bfa', label: 'Manager' },
		page: { color: '#5B8DEF', label: 'Page Objects' },
		base: { color: '#94a3b8', label: 'Shared Base' },
	},
	boxes: [
		{
			x: 300,
			y: 260,
			w: 620,
			h: 180,
			label: 'One class per page/component',
			variant: 'ghost',
			labelAlign: 'center',
		},
	],
	nodes: [
		{
			id: 'spec-file',
			label: 'Test File (.spec.ts)',
			group: 'test',
			x: 40,
			y: 40,
			w: 220,
			h: 68,
			tagline: 'Reads like user behavior',
			details:
				"Instantiates the PageManager once and calls high-level methods on it — no CSS selectors or raw page.locator() calls should appear directly in the test file itself.",
			questions: [
				{
					q: 'Why should a test file avoid raw selectors entirely?',
					a: "Selectors belong to page objects. Keeping them out of test files means a UI change only ever requires updating one page object method, not every test that happens to touch that element.",
				},
			],
		},
		{
			id: 'page-manager',
			label: 'PageManager',
			group: 'manager',
			x: 40,
			y: 260,
			w: 220,
			h: 76,
			tagline: 'One place that owns every page object',
			details:
				"Instantiates every page object once and exposes them as properties, so a test only ever constructs one thing (`new PageManager(page)`) instead of `new`-ing up half a dozen page object classes individually.",
			questions: [
				{
					q: 'What problem does a PageManager solve that plain page objects alone don\'t?',
					a: 'Without it, every test file repeats the same block of `new LoginPage(page)`, `new NavPage(page)`, etc. The manager centralizes that wiring once.',
				},
			],
		},
		{
			id: 'login-page',
			label: 'LoginPage',
			group: 'page',
			x: 340,
			y: 300,
			w: 170,
			h: 60,
			tagline: 'Locators + actions for one page',
			details:
				"Owns the locators and user-facing methods (login()) for exactly one page. Its methods describe intent (\"log in\"), hiding the individual fill/click calls underneath.",
			questions: [
				{
					q: 'Should LoginPage expose its raw locators to tests, or only methods like login()?',
					a: "Prefer exposing behavior methods (login(username, password)) over raw locators — it keeps the test readable and means the page object owns the full workflow, not just element references.",
				},
			],
		},
		{
			id: 'nav-page',
			label: 'NavigationPage',
			group: 'page',
			x: 540,
			y: 300,
			w: 170,
			h: 60,
			tagline: 'Site-wide menu, shared by every test',
			details:
				"Centralizes the top navigation bar, since almost every test needs to move between pages. Avoids duplicating 'click the Products link' logic across dozens of files.",
			questions: [],
		},
		{
			id: 'product-page',
			label: 'ProductPage',
			group: 'page',
			x: 740,
			y: 300,
			w: 170,
			h: 60,
			tagline: 'Locators + actions for the product page',
			details:
				"Same pattern as LoginPage, scoped to the product listing/detail page — its own locators, its own methods (addToCart, filterByCategory).",
			questions: [],
		},
		{
			id: 'base-page',
			label: 'BasePage',
			group: 'base',
			x: 400,
			y: 420,
			w: 480,
			h: 60,
			tagline: 'Shared helpers every page object inherits',
			details:
				"A parent class holding logic common to every page (waitForLoad, generic click-by-text helpers). Every concrete page object extends BasePage instead of repeating this boilerplate.",
			questions: [
				{
					q: 'What kind of logic belongs in BasePage vs. an individual page object?',
					a: "Anything truly page-agnostic (a load-wait helper, a generic error-toast reader) belongs in BasePage. Anything tied to one specific page's markup belongs in that page's own class.",
				},
			],
		},
	],
	edges: [
		{ from: 'spec-file', to: 'page-manager' },
		{ from: 'page-manager', to: 'login-page' },
		{ from: 'page-manager', to: 'nav-page' },
		{ from: 'page-manager', to: 'product-page' },
		{ from: 'login-page', to: 'base-page', dashed: true },
		{ from: 'nav-page', to: 'base-page', dashed: true },
		{ from: 'product-page', to: 'base-page', dashed: true },
	],
};

/**
 * API mocking & interception. Coordinates live in a 960x460 viewBox.
 */
const API_MOCKING_DIAGRAM: Diagram = {
	id: 'api-mocking',
	title: 'API Mocking & Interception',
	subtitle:
		'Every request a page makes passes through page.route() first — click a step to see what it can do there.',
	viewBox: '0 0 960 460',
	defaultSelected: 'page-route',
	groups: {
		browser: { color: '#38bdf8', label: 'Browser' },
		intercept: { color: '#fbbf24', label: 'Interception' },
		backend: { color: '#34d399', label: 'Real Backend' },
	},
	boxes: [],
	nodes: [
		{
			id: 'page-request',
			label: 'Page requests /api/...',
			group: 'browser',
			x: 40,
			y: 196,
			w: 220,
			h: 68,
			tagline: 'The app under test calls its backend',
			details:
				"The frontend code being tested makes a normal fetch/XHR call — it has no idea Playwright exists or that the request might be intercepted.",
			questions: [],
		},
		{
			id: 'page-route',
			label: 'page.route()',
			group: 'intercept',
			x: 340,
			y: 196,
			w: 220,
			h: 68,
			tagline: 'Every matching request stops here first',
			details:
				"Registered before navigation, this intercepts any request whose URL matches the given glob pattern — the test now fully controls what happens next: mock it, modify it, or let it through untouched.",
			questions: [
				{
					q: 'Does page.route() see requests that were already in flight before it was registered?',
					a: "No — register routes before triggering the navigation/action that causes the request, otherwise the request may already be sent before the interception is set up.",
				},
			],
		},
		{
			id: 'mock-fulfill',
			label: 'route.fulfill()',
			group: 'intercept',
			x: 640,
			y: 60,
			w: 260,
			h: 68,
			tagline: 'Fully mocked — no real network call',
			details:
				"Responds immediately with test-authored data. The real backend is never contacted at all — ideal for testing edge cases (empty states, errors) that are hard to reproduce with real data.",
			questions: [
				{
					q: 'When is a fully mocked response the wrong choice?',
					a: "When the test's goal is to verify real integration with the backend (e.g. a contract test) — full mocking proves the frontend handles a shape of data correctly, not that the real API actually returns that shape.",
				},
			],
		},
		{
			id: 'modify-response',
			label: 'fetch() + tweak + fulfill()',
			group: 'intercept',
			x: 640,
			y: 196,
			w: 260,
			h: 68,
			tagline: "Real request, edited response",
			details:
				"Lets the real request go through via route.fetch(), then changes just one or two fields in the response before returning it — useful for near-real edge cases without hand-building an entire mock payload.",
			questions: [],
		},
		{
			id: 'route-continue',
			label: 'route.continue()',
			group: 'backend',
			x: 640,
			y: 332,
			w: 260,
			h: 68,
			tagline: 'Pass through completely unmodified',
			details:
				"The request proceeds exactly as the app sent it, and the response is returned exactly as the backend sent it — used when the test only needs to observe/assert on real traffic, not change it.",
			questions: [
				{
					q: 'If a test only wants to assert a request was sent with the right payload, does it need route.fulfill()?',
					a: "No — page.waitForResponse() (read-only) or route.continue() after inspecting the request is enough; fulfill() is only needed when the test wants to change what comes back.",
				},
			],
		},
	],
	edges: [
		{ from: 'page-request', to: 'page-route' },
		{ from: 'page-route', to: 'mock-fulfill', dashed: true },
		{ from: 'page-route', to: 'modify-response', dashed: true },
		{ from: 'page-route', to: 'route-continue' },
	],
};

/**
 * CI/CD pipeline flow. Coordinates live in a 960x300 viewBox — a single
 * left-to-right chain, the simplest diagram shape in this set.
 */
const CI_CD_PIPELINE_DIAGRAM: Diagram = {
	id: 'ci-cd-pipeline',
	title: 'CI/CD Pipeline Flow',
	subtitle:
		'What a typical GitHub Actions workflow does on every push. Click a step to dig in.',
	viewBox: '0 0 960 300',
	defaultSelected: 'run-tests',
	groups: {
		trigger: { color: '#38bdf8', label: 'Trigger' },
		setup: { color: '#5B8DEF', label: 'Setup' },
		test: { color: '#a78bfa', label: 'Test' },
		artifact: { color: '#34d399', label: 'Artifacts' },
	},
	boxes: [],
	nodes: [
		{
			id: 'git-push',
			label: 'git push / PR',
			group: 'trigger',
			x: 20,
			y: 116,
			w: 150,
			h: 68,
			tagline: 'The workflow trigger',
			details:
				"Defined by the `on:` block in the workflow YAML — typically every push and every pull request, so regressions are caught before merge.",
			questions: [],
		},
		{
			id: 'install-deps',
			label: 'npm ci',
			group: 'setup',
			x: 200,
			y: 116,
			w: 150,
			h: 68,
			tagline: 'Reproducible install from the lockfile',
			details:
				"Installs exactly the versions recorded in package-lock.json — unlike `npm install`, it never modifies the lockfile, which is exactly what a CI run should guarantee.",
			questions: [
				{
					q: 'Why use npm ci instead of npm install in a CI workflow?',
					a: "npm ci installs strictly from the lockfile and fails if package.json and the lockfile are out of sync, guaranteeing the exact same dependency versions every run — npm install can silently update the lockfile instead.",
				},
			],
		},
		{
			id: 'install-browsers',
			label: 'playwright install --with-deps',
			group: 'setup',
			x: 380,
			y: 116,
			w: 200,
			h: 68,
			tagline: "Downloads the browser binaries CI needs",
			details:
				"CI runners don't come with browsers pre-installed. This downloads Chromium/Firefox/WebKit plus (`--with-deps`) the OS-level libraries they need to actually launch on a bare Linux runner.",
			questions: [
				{
					q: 'Why is --with-deps specifically needed in CI but often skipped locally?',
					a: "A developer's machine usually already has the OS libraries browsers need (from normal desktop use); a minimal CI container typically doesn't, so they must be installed explicitly.",
				},
			],
		},
		{
			id: 'run-tests',
			label: 'npx playwright test',
			group: 'test',
			x: 610,
			y: 116,
			w: 180,
			h: 68,
			tagline: 'The actual test run',
			details:
				"Runs the full suite, in parallel across workers, against every configured project (browser). Config flags like `retries` are typically higher here than during local development.",
			questions: [],
		},
		{
			id: 'upload-artifact',
			label: 'actions/upload-artifact',
			group: 'artifact',
			x: 820,
			y: 116,
			w: 200,
			h: 68,
			tagline: 'Keep the report even after the runner is gone',
			details:
				"Uploads the HTML report (traces, screenshots, videos) so it's downloadable from the workflow run — without this, all that debugging evidence disappears the moment the ephemeral CI runner shuts down.",
			questions: [
				{
					q: 'Why use `if: always()` on the upload-artifact step?',
					a: "Without it, the step is skipped whenever a prior step (the test run) fails — which is exactly when you need the report most. `if: always()` runs it regardless of pass/fail.",
				},
			],
		},
	],
	edges: [
		{ from: 'git-push', to: 'install-deps' },
		{ from: 'install-deps', to: 'install-browsers' },
		{ from: 'install-browsers', to: 'run-tests' },
		{ from: 'run-tests', to: 'upload-artifact' },
	],
};

export const PLAYWRIGHT_DIAGRAMS: Diagram[] = [
	TEST_ARCHITECTURE_DIAGRAM,
	LOCATOR_RESOLUTION_DIAGRAM,
	PAGE_OBJECT_MODEL_DIAGRAM,
	API_MOCKING_DIAGRAM,
	CI_CD_PIPELINE_DIAGRAM,
];

export function getPlaywrightDiagram(id: string): Diagram | undefined {
	return PLAYWRIGHT_DIAGRAMS.find(d => d.id === id);
}
