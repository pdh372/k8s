import type { Lesson } from './types';
import lessonsData from '../data/lessons.json';
import { SECTIONS } from '../data/curriculum';

export const LESSONS = lessonsData as Lesson[];

export function getLesson(id: string): Lesson | undefined {
	return LESSONS.find(l => l.id === id);
}

export interface SectionGroup {
	id: string;
	title: string;
	icon: string;
	gradient: string;
	description: string;
	lessons: Lesson[];
}

/** Lessons grouped by section, following the curriculum order. */
export function getSectionGroups(): SectionGroup[] {
	return SECTIONS.map(s => ({
		id: s.id,
		title: s.title,
		icon: s.icon,
		gradient: s.gradient,
		description: s.description,
		lessons: LESSONS.filter(l => l.section === s.id),
	})).filter(g => g.lessons.length > 0);
}

export interface LessonMatch {
	lesson: Lesson;
	/** Short excerpt around the first content hit, if any. */
	excerpt?: string;
}

/** Case-insensitive search across title, summary and body. */
export function searchLessons(query: string): LessonMatch[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const results: LessonMatch[] = [];
	for (const lesson of LESSONS) {
		const inTitle = lesson.title.toLowerCase().includes(q);
		const inSummary = lesson.summary.toLowerCase().includes(q);
		const body = lesson.content.toLowerCase();
		const bodyIdx = body.indexOf(q);
		if (inTitle || inSummary || bodyIdx >= 0) {
			let excerpt: string | undefined;
			if (bodyIdx >= 0) {
				const start = Math.max(0, bodyIdx - 50);
				const end = Math.min(
					lesson.content.length,
					bodyIdx + q.length + 60,
				);
				excerpt =
					(start > 0 ? '…' : '') +
					lesson.content
						.slice(start, end)
						.replace(/\s+/g, ' ')
						.trim() +
					(end < lesson.content.length ? '…' : '');
			}
			results.push({ lesson, excerpt });
		}
	}
	return results;
}
