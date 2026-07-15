# Section 5 — UI Components

Practical patterns for the standard widgets every web app is built from.

## Input Fields

```ts
await page.getByLabel('Email').fill('user@example.com');
await page.getByLabel('Email').clear();
await page.getByLabel('Search').pressSequentially('hello', { delay: 100 }); // types char by char, e.g. to trigger a live-search dropdown
```

`fill()` sets the value directly (fast, reliable); `pressSequentially()` simulates real keystrokes when a component reacts to each individual `keydown` (autocomplete, input masks).

## Radio Buttons

```ts
await page.getByLabel('Male').check();
await expect(page.getByLabel('Male')).toBeChecked();
```

Radio buttons in the same group share a `name` attribute — checking one automatically unchecks the others, exactly as in the browser.

## Checkboxes

```ts
await page.getByLabel('Accept terms').check();
await page.getByLabel('Subscribe to newsletter').uncheck();
await expect(page.getByLabel('Accept terms')).toBeChecked();

// Toggle without knowing current state
const checkbox = page.getByLabel('Remember me');
if (!(await checkbox.isChecked())) {
	await checkbox.check();
}
```

`check()`/`uncheck()` are idempotent — calling `check()` on an already-checked box is a no-op, unlike `click()` which would toggle it.

## Lists and Dropdowns

```ts
// Native <select>
await page.selectOption('#country', 'CA');            // by value
await page.selectOption('#country', { label: 'Canada' }); // by visible text
await page.selectOption('#country', { index: 2 });     // by position

// Custom (non-native) dropdown — usually a click to open + click to choose
await page.getByRole('combobox').click();
await page.getByRole('option', { name: 'Canada' }).click();
```

Native `<select>` elements use `selectOption()` directly; custom dropdown widgets (built from `<div>`s, common in design systems) are just two ordinary clicks.

## Tooltips

```ts
await page.getByRole('button', { name: 'Info' }).hover();
await expect(page.getByRole('tooltip')).toBeVisible();
await expect(page.getByRole('tooltip')).toHaveText('More details here');
```

Tooltips usually only render once hovered — `hover()` first, then assert on the tooltip's now-visible content.

## Dialog Boxes

Two distinct kinds show up in web apps, and Playwright handles them differently:

```ts
// 1. Native browser dialogs (window.alert/confirm/prompt)
page.on('dialog', async dialog => {
	console.log(dialog.message());
	await dialog.accept();     // or dialog.dismiss()
});
await page.getByRole('button', { name: 'Delete' }).click();

// 2. In-page modal dialogs (an ordinary <div> styled as a modal)
await page.getByRole('button', { name: 'Delete' }).click();
await expect(page.getByRole('dialog')).toBeVisible();
await page.getByRole('button', { name: 'Confirm' }).click();
```

Native dialogs block the page entirely and must be handled via the `page.on('dialog', ...)` event *before* triggering them; in-page modals are just regular DOM elements you interact with normally.

## Web Tables

### Part 1 — Reading rows and cells

```ts
const rows = page.locator('table tbody tr');
await expect(rows).toHaveCount(5);

const firstRowFirstCell = rows.nth(0).locator('td').nth(0);
console.log(await firstRowFirstCell.textContent());
```

### Part 2 — Finding a row by content and acting on it

```ts
// Find the row containing a specific value, then act within that row
const row = page.locator('table tbody tr').filter({ hasText: 'alice@example.com' });
await row.getByRole('button', { name: 'Edit' }).click();

// Read an entire table into a plain array for assertions/comparison
const cellTexts = await page.locator('table tbody tr').evaluateAll(rows =>
	rows.map(row => Array.from(row.querySelectorAll('td')).map(td => td.textContent?.trim())),
);
```

`filter({ hasText })` scoped to a row is the standard pattern for "find the row for this specific record" in dynamic, sortable tables where row order can't be relied on.

## Date Picker

### Part 1 — Typing a date directly

```ts
await page.getByLabel('Date of birth').fill('2024-01-15');
```

Many date inputs accept a typed value directly — always try this first, it's far simpler than driving the calendar widget.

### Part 2 — Driving a calendar widget

```ts
await page.getByLabel('Date of birth').click();  // opens the calendar popup
await page.getByRole('button', { name: 'Next month' }).click();
await page.getByRole('button', { name: '15', exact: true }).click();
```

Custom calendar widgets vary a lot between component libraries — the general pattern is: open it, navigate month/year controls until the target month is showing, then click the specific day button.

## Sliders

```ts
const slider = page.getByRole('slider');
const box = await slider.boundingBox();

if (box) {
	// Drag from the slider's current position to a target x coordinate
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
	await page.mouse.down();
	await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
	await page.mouse.up();
}

// Keyboard is often simpler if the slider supports it
await slider.focus();
await page.keyboard.press('ArrowRight');
```

Sliders rarely have a "set value" API — either simulate the physical mouse drag using `boundingBox()` coordinates, or, if the widget is keyboard-accessible, arrow keys are far more reliable than pixel-perfect dragging.

## Drag & Drop with iFrames

```ts
// Drag and drop between two elements
await page.dragAndDrop('#source', '#target');

// Or manually, for more control
const source = page.locator('#source');
await source.hover();
await page.mouse.down();
await page.locator('#target').hover();
await page.mouse.up();

// Elements inside an <iframe> need to be located through the frame first
const frame = page.frameLocator('#payment-iframe');
await frame.getByLabel('Card number').fill('4242 4242 4242 4242');
```

`page.locator()` only searches the main document — anything inside an `<iframe>` (common for embedded payment widgets, ads, third-party embeds) must go through `page.frameLocator('<iframe selector>')` first, which returns a scoped locator API for that frame's own document.

## Next

Continue to **Section 6 — Page Object Model**.
