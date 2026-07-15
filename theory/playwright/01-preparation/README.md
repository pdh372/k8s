# Section 1 — Preparation

## Introduction

**Playwright** is an open-source browser automation framework (originally from Microsoft) for writing end-to-end tests that drive a real browser — Chromium, Firefox, and WebKit — from code. It clicks buttons, fills forms, waits for content, and asserts on what actually rendered, exactly like a real user would.

Automated end-to-end tests exist to catch regressions a unit test can't see: a button that silently stopped working, a form that no longer submits, a page that breaks in one browser but not another. Running these checks automatically, on every change, is far more reliable than manual click-through testing before every release.

## Playwright vs Cypress

Both are modern end-to-end testing tools; the choice usually comes down to a few concrete differences:

| Aspect                      | Playwright                                                | Cypress                                              |
| ------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------- |
| **Browser engines**           | Chromium, Firefox, and WebKit (Safari's engine) — true cross-browser | Chromium-family only in most setups; WebKit support is limited |
| **Multiple tabs / windows**   | Native support — can drive several browser contexts/pages at once | Historically limited to a single tab                       |
| **Language support**          | JavaScript, TypeScript, Python, Java, .NET                     | JavaScript/TypeScript only                                 |
| **Test runner**                | Ships its own (`@playwright/test`)                              | Ships its own                                              |
| **Auto-waiting**               | Built in — waits for elements to be actionable before interacting | Built in — similar philosophy                              |
| **Parallelization**            | Built-in, out of the box                                        | Requires paid Cypress Cloud for full parallelization        |

Neither is strictly "better" — Playwright's edge is genuine cross-browser coverage, multi-language support, and free built-in parallelization, which is why this course builds on it.

## Configuration of Development Environment

Playwright needs Node.js (an LTS version) and a code editor — VS Code is the most common pairing, with an official Playwright extension for running/debugging tests inline.

```bash
node --version    # confirm Node.js is installed (LTS recommended)
npm --version
```

Install VS Code's Playwright extension from the Extensions panel (search "Playwright Test for VSCode") — it adds a Testing sidebar to run individual tests, set breakpoints, and open the trace viewer (Section 3) without leaving the editor.

## Clone Test Application

Course-style Playwright projects are typically built around a small sample web app to test against, so the tests have real, stable UI to interact with instead of a live third-party site that can change without notice.

```bash
git clone <sample-app-repo-url>
cd <sample-app-folder>
npm install
npm start          # serves the app locally, e.g. http://localhost:3000
```

A typical Playwright project layout once initialized (Section 3 covers `npm init playwright@latest` in detail):

```
project/
├── tests/                 # your .spec.ts test files
├── playwright.config.ts   # global config: browsers, baseURL, timeouts
├── package.json
└── playwright-report/     # HTML report output (generated, git-ignored)
```

## Next

Continue to **Section 2 — JavaScript Fundamentals**.
