import type { Lesson } from './types';
import playwrightLessonsData from '../data/playwright-lessons.json';
import { PLAYWRIGHT_SECTIONS } from '../data/playwrightCurriculum';
import { createLessonsStore } from './lessonsStore';

/** Singleton lessons store for the Playwright track. */
export const playwrightLessonsStore = createLessonsStore(
	playwrightLessonsData as Lesson[],
	PLAYWRIGHT_SECTIONS,
);
