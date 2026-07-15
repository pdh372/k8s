# Section 7 — Working with APIs

## What is API

Modern web apps talk to a backend over HTTP APIs — the browser fetches/sends JSON data behind the scenes while the UI updates in response. Testing at the API layer (or controlling it during a UI test) is faster and more reliable than always driving everything through the UI, and Playwright has first-class support for both.

## Setup New Project

Playwright's `request` fixture works independently of a browser page — useful for pure API tests that never touch the UI at all:

```ts
// playwright.config.ts
export default defineConfig({
	use: {
		baseURL: 'https://api.example.com',
	},
});
```

```ts
import { test, expect } from '@playwright/test';

test('GET /users returns a list', async ({ request }) => {
	const response = await request.get('/users');
	expect(response.ok()).toBeTruthy();
	const body = await response.json();
	expect(Array.isArray(body)).toBe(true);
});
```

## Mocking API

**Mocking** intercepts a network request and returns a fake response instead of letting it reach the real backend — useful for testing UI states that are hard to reproduce with real data (an empty list, a 500 error, a specific edge case).

```ts
await page.route('**/api/products', async route => {
	await route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify([{ id: 1, name: 'Mocked Product', price: 9.99 }]),
	});
});

await page.goto('/products');
await expect(page.getByText('Mocked Product')).toBeVisible();
```

`page.route()` intercepts any request matching the URL glob pattern before it leaves the browser; `route.fulfill()` responds with whatever the test wants, without a real network call happening at all.

## Modify API Response

Instead of fully mocking, let the real request go through and then tweak the response — useful for testing "almost real" edge cases without hand-crafting an entire mock payload:

```ts
await page.route('**/api/user/profile', async route => {
	const response = await route.fetch();          // let the real request happen
	const json = await response.json();
	json.subscriptionStatus = 'expired';             // modify just one field
	await route.fulfill({ response, json });
});
```

## Perform API Request

Beyond intercepting, Playwright can actively *send* requests as part of test setup — e.g. creating test data through the API instead of clicking through the UI, which is far faster:

```ts
test('checkout with a pre-seeded cart', async ({ page, request }) => {
	// Set up state via API instead of UI clicks
	await request.post('/api/cart', {
		data: { productId: 42, quantity: 2 },
	});

	await page.goto('/cart');
	await expect(page.getByText('2 items')).toBeVisible();
});
```

## Intercept Browser API Response

Read (without modifying) requests the page makes on its own — useful for asserting the frontend actually called the right endpoint with the right payload:

```ts
const responsePromise = page.waitForResponse('**/api/orders');
await page.getByRole('button', { name: 'Place order' }).click();
const response = await responsePromise;

expect(response.status()).toBe(201);
const body = await response.json();
expect(body.status).toBe('confirmed');
```

`waitForResponse()` is the read-only counterpart to `page.route()` — it doesn't change anything, just lets the test observe and assert on real network traffic.

## Sharing Authentication State

Logging in through the UI before every single test is slow and repetitive. Playwright supports authenticating **once** and reusing that session across every test file:

```ts
// auth.setup.ts — runs once, before the real test suite
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
	await page.goto('/login');
	await page.getByLabel('Username').fill('alice');
	await page.getByLabel('Password').fill('password');
	await page.getByRole('button', { name: 'Log in' }).click();
	await page.waitForURL('/dashboard');

	await page.context().storageState({ path: 'auth.json' }); // save cookies/localStorage
});
```

```ts
// playwright.config.ts
export default defineConfig({
	use: {
		storageState: 'auth.json', // every test starts already logged in
	},
});
```

## API Authentication

For pure API tests, authentication is usually just an `Authorization` header rather than a UI login flow:

```ts
const context = await request.newContext({
	baseURL: 'https://api.example.com',
	extraHTTPHeaders: {
		Authorization: `Bearer ${process.env.API_TOKEN}`,
	},
});

const response = await context.get('/orders');
expect(response.ok()).toBeTruthy();
```

Never hardcode real tokens/credentials directly in test code — read them from environment variables (Section 8 covers configuring these properly per environment).

## Next

Continue to **Section 8 — Advanced**.
