import type { Lesson } from './types';
import gcpLessonsData from '../data/gcp-lessons.json';
import { GCP_SECTIONS } from '../data/gcpCurriculum';
import { createLessonsStore } from './lessonsStore';

/** Singleton lessons store for the GCP track. */
export const gcpLessonsStore = createLessonsStore(
	gcpLessonsData as Lesson[],
	GCP_SECTIONS,
);
