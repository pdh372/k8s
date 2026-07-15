# Section 6 — Page Object Model

## What Is Page Objects

The **Page Object Model (POM)** is a design pattern where every page (or major component) of the app under test gets its own class — locators as properties, user actions as methods. Tests then call methods on these objects instead of embedding raw selectors and clicks directly.

Without it, the same selector ends up copy-pasted across dozens of test files; when the UI changes, every one of those files needs fixing. With a Page Object, there's exactly one place to update.

## First Page Object

```ts
// pages/login.page.ts
import { Page } from '@playwright/test';

export class LoginPage {
	constructor(private page: Page) {}

	async goto() {
		await this.page.goto('/login');
	}

	async login(username: string, password: string) {
		await this.page.getByLabel('Username').fill(username);
		await this.page.getByLabel('Password').fill(password);
		await this.page.getByRole('button', { name: 'Log in' }).click();
	}
}
```

```ts
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('successful login redirects to dashboard', async ({ page }) => {
	const loginPage = new LoginPage(page);
	await loginPage.goto();
	await loginPage.login('alice', 'correct-password');

	await expect(page).toHaveURL(/.*dashboard/);
});
```

The test now reads like a description of user behavior ("go to login, log in, expect the dashboard") — no CSS selectors visible at all.

## Navigation Page Object

A shared **Navigation** (or "Nav Bar") page object centralizes the site-wide menu, since nearly every test needs to move between pages:

```ts
// pages/navigation.page.ts
export class NavigationPage {
	constructor(private page: Page) {}

	async goToProducts() {
		await this.page.getByRole('link', { name: 'Products' }).click();
	}

	async goToCart() {
		await this.page.getByRole('link', { name: 'Cart' }).click();
	}
}
```

## Locators in Page Objects

Two common ways to define locators on a page object:

```ts
export class ProductPage {
	constructor(private page: Page) {}

	// Option A: as properties, defined once in the constructor
	addToCartButton = this.page.getByRole('button', { name: 'Add to cart' });

	// Option B: as a method, re-evaluated each call — needed when the
	// locator depends on an argument
	quantityInput(productId: string) {
		return this.page.locator(`[data-product-id="${productId}"] input[name="qty"]`);
	}
}
```

Property-style locators are fine for static, always-present elements; method-style locators are needed whenever the selector depends on a parameter (like a specific row or product ID).

## Parametrized Methods

Page object methods commonly take arguments so one method covers many scenarios instead of writing near-duplicate methods:

```ts
export class SearchPage {
	constructor(private page: Page) {}

	async searchFor(term: string) {
		await this.page.getByPlaceholder('Search...').fill(term);
		await this.page.keyboard.press('Enter');
	}

	async filterByCategory(category: string) {
		await this.page.getByLabel('Category').selectOption(category);
	}
}
```

```ts
await searchPage.searchFor('laptop');
await searchPage.filterByCategory('Electronics');
```

## Date Picker Page Object

A reusable component (Section 5's calendar widget) is a great candidate for its own small page object, composed *into* whichever page uses it:

```ts
export class DatePickerComponent {
	constructor(private page: Page) {}

	async selectDate(day: number) {
		await this.page.getByRole('button', { name: String(day), exact: true }).click();
	}

	async goToNextMonth() {
		await this.page.getByRole('button', { name: 'Next month' }).click();
	}
}

export class BookingPage {
	datePicker: DatePickerComponent;

	constructor(private page: Page) {
		this.datePicker = new DatePickerComponent(page);
	}

	async openDatePicker() {
		await this.page.getByLabel('Check-in date').click();
	}
}
```

Composing smaller component objects into page objects avoids duplicating the same calendar-driving logic on every page that happens to include a date picker.

## Page Objects Manager

As the number of page objects grows, a **Page Manager** (or "App" object) centralizes instantiating and accessing all of them, so tests don't `new` up half a dozen classes individually:

```ts
export class PageManager {
	readonly loginPage: LoginPage;
	readonly navigationPage: NavigationPage;
	readonly productPage: ProductPage;

	constructor(private page: Page) {
		this.loginPage = new LoginPage(page);
		this.navigationPage = new NavigationPage(page);
		this.productPage = new ProductPage(page);
	}
}
```

```ts
test('add product to cart', async ({ page }) => {
	const pm = new PageManager(page);
	await pm.loginPage.login('alice', 'password');
	await pm.navigationPage.goToProducts();
	await pm.productPage.addToCartButton.click();
});
```

## Page Objects Helper Base

A shared **base class** holds actions common to every page object — avoids repeating boilerplate like waiting for the page to load, or a generic "click by text" helper:

```ts
export class BasePage {
	constructor(protected page: Page) {}

	async waitForLoad() {
		await this.page.waitForLoadState('networkidle');
	}

	async clickByText(text: string) {
		await this.page.getByText(text).click();
	}
}

export class LoginPage extends BasePage {
	async login(username: string, password: string) {
		await this.waitForLoad();
		await this.page.getByLabel('Username').fill(username);
		// ...
	}
}
```

Every page object `extends BasePage`, inheriting the shared helpers while still defining its own page-specific locators and actions.

## Next

Continue to **Section 7 — Working with APIs**.
