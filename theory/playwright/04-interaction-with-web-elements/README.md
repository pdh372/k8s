# Section 4 — Interaction with Web Elements

## DOM Terminology

The **DOM (Document Object Model)** is the browser's in-memory tree representation of an HTML page — every tag is a node, nested inside its parent tag. Playwright locators are, fundamentally, a way of describing a path to one (or more) nodes in that tree.

```html
<div class="card">          <!-- parent -->
	<h2>Title</h2>            <!-- child -->
	<button>Buy</button>      <!-- sibling of h2 -->
</div>
```

## Locator Syntax Rules

A **Locator** describes how to find an element — it doesn't find it immediately; it's re-evaluated fresh every time you interact with it, which is core to Playwright's auto-waiting behavior (see below).

```ts
page.locator('button');                 // CSS selector
page.locator('#submit');                // CSS id
page.locator('.btn-primary');           // CSS class
page.locator('button[type="submit"]');  // CSS attribute selector
page.locator('text=Sign in');           // Playwright's text-content selector
```

Locators can be chained and filtered:

```ts
page.locator('.card').filter({ hasText: 'Playwright' });
page.locator('.card').nth(2);           // the 3rd match (0-indexed)
page.locator('.card').first();
page.locator('.card').last();
```

## User-Facing Locators

Playwright's **recommended** locators find elements the way a real user (or an accessibility tool) would identify them — by visible text, label, or role — rather than by brittle CSS classes/IDs that change with every refactor:

```ts
page.getByRole('button', { name: 'Submit' });
page.getByLabel('Email address');
page.getByPlaceholder('Enter your email');
page.getByText('Welcome back');
page.getByTestId('login-button');   // for elements with a data-testid attribute
```

`getByRole` is the most resilient of these — it matches on accessible role and name, so it survives styling/markup changes and doubles as a lightweight accessibility check (if `getByRole` can't find your button, a screen reader may not be able to either).

## Child Elements

```ts
const card = page.locator('.card');
const title = card.locator('h2');           // descendant, any depth
const directChild = card.locator('> button'); // direct child only
```

Scoping a locator to a parent first (`card.locator(...)`) avoids accidentally matching an identical element that appears elsewhere on the page.

## Parent Elements

```ts
// Find an element, then its ancestor matching a selector
page.locator('button:has-text("Delete")').locator('xpath=ancestor::div[@class="card"]');

// More commonly: locate the parent directly, then filter to the one containing the target
page.locator('.card').filter({ has: page.locator('button:has-text("Delete")') });
```

`filter({ has: ... })` is the idiomatic Playwright way to say "the card that *contains* this specific element" — far more readable than XPath's `ancestor::`.

## Reusing Locators

Rather than repeating the same selector string across many tests, define it once (typically as a Page Object property, Section 6):

```ts
class LoginPage {
	constructor(private page: Page) {}

	usernameInput = this.page.getByLabel('Username');
	passwordInput = this.page.getByLabel('Password');
	submitButton = this.page.getByRole('button', { name: 'Log in' });
}
```

If the markup changes later, there's exactly one place to update.

## Extracting Values

```ts
const text = await page.locator('.price').textContent();
const value = await page.locator('#quantity').inputValue();
const href = await page.locator('a.nav-link').getAttribute('href');
const count = await page.locator('.card').count();
```

All of these are async — every read from the live page goes through the browser, so it returns a Promise that must be `await`ed.

## Assertions

Playwright's `expect()` matchers are **auto-retrying** — they poll the condition for a timeout window instead of checking once and failing immediately, which is what makes them resilient to normal UI timing (an element fading in, data loading):

```ts
await expect(page.locator('.error-message')).toBeVisible();
await expect(page.locator('.error-message')).toHaveText('Invalid credentials');
await expect(page.locator('#quantity')).toHaveValue('3');
await expect(page.locator('.card')).toHaveCount(5);
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveTitle('Dashboard');
```

## Auto-Waiting

Before performing an action (`click`, `fill`, `check`, ...), Playwright automatically waits for the target element to be **actionable**: attached to the DOM, visible, stable (not still animating), enabled, and not obscured by another element — all without any explicit `sleep()`/`wait()` call from the test author.

```ts
// No manual wait needed — Playwright waits for the button to become
// clickable before clicking it.
await page.getByRole('button', { name: 'Submit' }).click();
```

This is the single biggest reason Playwright tests are less flaky than older Selenium-style tests, which historically needed manual `sleep()` calls or explicit wait conditions sprinkled everywhere.

## Timeouts

Auto-waiting still has a limit — if an element never becomes actionable, the action eventually times out and fails with a clear error.

```ts
// Global default (playwright.config.ts)
export default defineConfig({
	timeout: 30_000,          // max time for an entire test
	expect: { timeout: 5_000 }, // max time an assertion will keep retrying
});

// Per-action override
await page.locator('.slow-button').click({ timeout: 10_000 });
```

| Timeout type          | What it bounds                                          |
| -------------------------- | -------------------------------------------------------------- |
| Test timeout               | The entire test, start to finish                                |
| Expect timeout              | How long an `expect()` matcher keeps retrying before failing      |
| Action timeout               | How long a single action (`click`, `fill`, ...) waits for actionability |

## Next

Continue to **Section 5 — UI Components**.
