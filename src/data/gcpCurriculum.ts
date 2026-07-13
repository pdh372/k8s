import type { SectionMeta } from '../lib/types';
import chaptersData from './gcp-chapters.json';

interface ChapterEntry extends SectionMeta {
	range: [number, number];
}

const CHAPTERS = chaptersData.chapters as ChapterEntry[];

/**
 * Display metadata for each GCP chapter, in curriculum order. Mirrors
 * data/curriculum.ts's SECTIONS but for the GCP track: since theory/gcp/ is
 * flat (no per-chapter folders), chapters are a hand-authored mapping of
 * lesson-number ranges -> metadata, defined in ./gcp-chapters.json. That
 * same file is read directly by scripts/generate-content.mjs, so the build
 * script and the app share one source of truth.
 */
export const GCP_SECTIONS: SectionMeta[] = CHAPTERS.map(c => ({
	id: c.id,
	title: c.title,
	description: c.description,
	icon: c.icon,
	gradient: c.gradient,
}));
