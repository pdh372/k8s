import type { Lesson, SectionMeta } from './types';

export interface SectionGroup {
	id: string;
	title: string;
	icon: string;
	gradient: string;
	description: string;
	lessons: Lesson[];
}

export interface LessonMatch {
	lesson: Lesson;
	/** Short excerpt around the first content hit, if any. */
	excerpt?: string;
}

export interface LessonsStore {
	LESSONS: Lesson[];
	getLesson(id: string): Lesson | undefined;
	getSectionGroups(): SectionGroup[];
	searchLessons(query: string): LessonMatch[];
	sectionTitle(id: string): string;
}

/**
 * Builds a lessons store (lookup + section grouping + search) over a flat
 * lesson array and its curriculum section metadata. One instance per track
 * is created as a module-level singleton (see lib/lessons.ts, lib/gcpLessons.ts)
 * and selected at runtime by useLessonsStore().
 */
export function createLessonsStore(
	lessons: Lesson[],
	sections: SectionMeta[],
): LessonsStore {
	const sectionMap: Record<string, SectionMeta> = Object.fromEntries(
		sections.map(s => [s.id, s]),
	);

	function getLesson(id: string): Lesson | undefined {
		return lessons.find(l => l.id === id);
	}

	/** Lessons grouped by section, following the curriculum order. */
	function getSectionGroups(): SectionGroup[] {
		return sections
			.map(s => ({
				id: s.id,
				title: s.title,
				icon: s.icon,
				gradient: s.gradient,
				description: s.description,
				lessons: lessons.filter(l => l.section === s.id),
			}))
			.filter(g => g.lessons.length > 0);
	}

	/** Case-insensitive search across title, summary and body. */
	function searchLessons(query: string): LessonMatch[] {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		const results: LessonMatch[] = [];
		for (const lesson of lessons) {
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

	function sectionTitle(id: string): string {
		return sectionMap[id]?.title ?? id;
	}

	return {
		LESSONS: lessons,
		getLesson,
		getSectionGroups,
		searchLessons,
		sectionTitle,
	};
}
