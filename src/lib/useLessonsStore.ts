import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { LessonsStore } from './lessonsStore';
import { k8sLessonsStore } from './lessons';
import { gcpLessonsStore } from './gcpLessons';

export interface TrackLessonsStore extends LessonsStore {
	/** Lessons-index base path for this track, e.g. "/k8s/lessons". */
	basePath: string;
}

/**
 * Route-aware lessons store: returns the K8s or GCP store bundle depending
 * on whether the current path starts with /gcp. Used by the shared
 * LessonsPage/LessonPage/LessonSidebar components so they stay track-agnostic.
 */
export function useLessonsStore(): TrackLessonsStore {
	const { pathname } = useLocation();
	const isGcp = pathname.startsWith('/gcp');

	return useMemo<TrackLessonsStore>(
		() =>
			isGcp
				? { ...gcpLessonsStore, basePath: '/gcp/lessons' }
				: { ...k8sLessonsStore, basePath: '/k8s/lessons' },
		[isGcp],
	);
}
