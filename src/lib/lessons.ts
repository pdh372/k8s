import type { Lesson } from './types';
import lessonsData from '../data/lessons.json';
import { SECTIONS } from '../data/curriculum';
import { createLessonsStore } from './lessonsStore';
import type { SectionGroup, LessonMatch } from './lessonsStore';

/** Singleton lessons store for the K8s track. */
export const k8sLessonsStore = createLessonsStore(
	lessonsData as Lesson[],
	SECTIONS,
);

// Re-exported for existing call sites (HomePage, etc.) that only ever deal
// with the K8s track and don't need to go through useLessonsStore().
export const LESSONS = k8sLessonsStore.LESSONS;
export const getLesson = k8sLessonsStore.getLesson;
export const getSectionGroups = k8sLessonsStore.getSectionGroups;
export const searchLessons = k8sLessonsStore.searchLessons;

export type { SectionGroup, LessonMatch };
