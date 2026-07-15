# Section 2 — JavaScript Fundamentals

## Module Overview

Playwright tests are written in JavaScript or TypeScript. This section is a fast, practical run-through of the language basics needed before writing real tests — skip ahead if you already know JS/TS well.

## Hello World

```js
console.log('Hello, world!');
```

`console.log` prints to the terminal/console — the most basic way to inspect a value while writing or debugging a test.

## Variables, Constants and Data Types

```js
let count = 1;          // reassignable
const maxRetries = 3;   // cannot be reassigned
var legacy = 'avoid';   // old syntax, function-scoped — avoid in new code
```

| Type          | Example                          |
| --------------- | ----------------------------------- |
| `string`       | `'hello'`, `"hello"`, `` `hello` `` |
| `number`       | `42`, `3.14`                        |
| `boolean`      | `true`, `false`                     |
| `undefined`    | a declared variable with no value    |
| `null`         | an explicitly empty value            |
| `object`       | `{ key: 'value' }`                   |
| `array`        | `[1, 2, 3]`                          |

Prefer `const` by default; use `let` only when a variable genuinely needs to change; avoid `var`.

## Concatenation and Interpolation

```js
const name = 'Playwright';
// Concatenation
console.log('Hello, ' + name + '!');
// Interpolation (template literals) — cleaner, preferred
console.log(`Hello, ${name}!`);
```

Template literals (backticks) also support multi-line strings without `\n` escapes.

## Objects and Arrays

```js
const user = {
	name: 'Alice',
	age: 30,
};
console.log(user.name);       // dot notation
console.log(user['age']);     // bracket notation

const numbers = [10, 20, 30];
console.log(numbers[0]);      // 10 — arrays are zero-indexed
console.log(numbers.length);  // 3
```

Destructuring pulls values out directly — very common in Playwright test code:

```js
const { name, age } = user;
const [first, second] = numbers;
```

## Relational and Equality Operators

```js
5 > 3     // true
5 >= 5    // true
5 == '5'  // true  — loose equality, coerces types (avoid)
5 === '5' // false — strict equality, no coercion (prefer this)
5 !== 3   // true
```

Always prefer `===`/`!==` over `==`/`!=` — type coercion in loose equality is a common source of subtle bugs.

## Logical Operators

```js
true && false   // AND — false
true || false   // OR  — true
!true           // NOT — false

// Common pattern: only run something if a value exists
const el = null;
el && el.click();       // safe — does nothing if el is null

// Nullish coalescing: fall back only on null/undefined (not 0 or '')
const timeout = config.timeout ?? 30000;
```

## Conditional Statements

```js
if (status === 'success') {
	console.log('Passed');
} else if (status === 'skipped') {
	console.log('Skipped');
} else {
	console.log('Failed');
}

// Ternary — compact if/else for a single expression
const label = isVisible ? 'shown' : 'hidden';
```

## Loops

```js
for (let i = 0; i < 3; i++) {
	console.log(i);
}

const items = ['a', 'b', 'c'];
for (const item of items) {
	console.log(item);
}

items.forEach(item => console.log(item));
```

`for...of` and `.forEach` are the most common patterns in test code (iterating over test data, locators, or rows in a table).

## Functions

```js
// Function declaration
function add(a, b) {
	return a + b;
}

// Arrow function — the most common style in modern JS/TS and Playwright code
const add2 = (a, b) => a + b;

// Async function — Playwright's API is promise-based, so almost every
// test action is awaited inside an async function
async function loginUser(page, username, password) {
	await page.fill('#username', username);
	await page.fill('#password', password);
	await page.click('#login-button');
}
```

Every Playwright test callback is itself an `async` function, and nearly every Playwright API call (`click`, `fill`, `goto`, assertions) returns a Promise that must be `await`ed — forgetting `await` is one of the most common beginner mistakes and causes flaky, unpredictable test behavior.

## Class and Methods

```js
class Calculator {
	constructor(initial = 0) {
		this.value = initial;
	}

	add(n) {
		this.value += n;
		return this;   // returning `this` enables method chaining
	}
}

const calc = new Calculator(10).add(5).add(3);
console.log(calc.value); // 18
```

Classes are the foundation of the **Page Object Model** (Section 6) — each page of the app under test becomes a class with methods for the actions available on it.

## TypeScript vs JavaScript

| Aspect               | JavaScript                          | TypeScript                                                |
| ----------------------- | -------------------------------------- | ---------------------------------------------------------------- |
| **Typing**              | Dynamic — types are checked at runtime  | Static — types are checked at compile time, before running        |
| **Compilation**         | Runs directly                           | Compiles down to JavaScript                                        |
| **Tooling/autocomplete**| Basic                                    | Strong — editors can autocomplete Playwright's API precisely       |
| **Error catching**      | Many mistakes only surface when the code runs | Many mistakes (wrong argument type, typo'd property) caught before running |

```ts
// TypeScript: parameter and return types are explicit
function add(a: number, b: number): number {
	return a + b;
}
```

Playwright officially supports both, but TypeScript is the more common choice for real projects — the autocomplete and compile-time checking pay off quickly once a test suite grows past a handful of files.

## Practice

Before moving on, write a few small standalone scripts (no Playwright yet) that combine these basics — e.g. a function that takes an array of test result objects (`{ name, status }`) and logs a pass/fail summary using a loop and a conditional. Comfort with plain JS/TS here makes every later section faster to absorb.

## Next

Continue to **Section 3 — Playwright Hands-On Overview**.
