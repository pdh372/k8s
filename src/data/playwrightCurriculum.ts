import type { SectionMeta } from '../lib/types';

/**
 * Display metadata for each Playwright curriculum section. Keyed by the
 * folder name under theory/playwright/ (which is also the `section` field
 * on every generated lesson) — same pattern as data/curriculum.ts, no
 * chapter-range remapping needed since each folder is already a natural,
 * browsable section (unlike GCP's flat 45-lecture tree).
 */
export const PLAYWRIGHT_SECTIONS: SectionMeta[] = [
	{
		id: '01-preparation',
		title: 'Preparation',
		description: 'Environment setup and Playwright vs Cypress.',
		icon: '🧰',
		gradient: 'from-emerald-500 to-teal-600',
	},
	{
		id: '02-javascript-fundamentals',
		title: 'JavaScript Fundamentals',
		description: 'The JS/TS basics every Playwright test is built from.',
		icon: '📜',
		gradient: 'from-amber-500 to-orange-600',
	},
	{
		id: '03-playwright-hands-on-overview',
		title: 'Playwright Hands-On Overview',
		description: 'Installation, CLI/UI test execution, trace view, hooks.',
		icon: '🎭',
		gradient: 'from-teal-500 to-cyan-600',
	},
	{
		id: '04-interaction-with-web-elements',
		title: 'Interaction with Web Elements',
		description: 'Locators, assertions, auto-waiting and timeouts.',
		icon: '🖱️',
		gradient: 'from-sky-500 to-blue-600',
	},
	{
		id: '05-ui-components',
		title: 'UI Components',
		description: 'Inputs, tables, date pickers, sliders, iframes and more.',
		icon: '🧩',
		gradient: 'from-violet-500 to-purple-600',
	},
	{
		id: '06-page-object-model',
		title: 'Page Object Model',
		description: 'Structuring a maintainable test suite around page objects.',
		icon: '🏗️',
		gradient: 'from-fuchsia-500 to-pink-600',
	},
	{
		id: '07-working-with-apis',
		title: 'Working with APIs',
		description: 'Mocking, intercepting and calling APIs directly in tests.',
		icon: '🔌',
		gradient: 'from-rose-500 to-red-600',
	},
	{
		id: '08-advanced',
		title: 'Advanced',
		description: 'Fixtures, parallelism, visual testing, Docker and CI.',
		icon: '🚀',
		gradient: 'from-indigo-500 to-blue-700',
	},
];

export const PLAYWRIGHT_SECTION_MAP: Record<string, SectionMeta> =
	Object.fromEntries(PLAYWRIGHT_SECTIONS.map(s => [s.id, s]));
