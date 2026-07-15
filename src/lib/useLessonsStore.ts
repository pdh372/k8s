import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { LessonsStore } from './lessonsStore';
import { resolveTrack } from './tracks';

export interface TrackLessonsStore extends LessonsStore {
	/** Lessons-index base path for this track, e.g. "/k8s/lessons". */
	basePath: string;
}

/**
 * Route-aware lessons store: resolves the current track from the URL (via
 * the shared TRACKS registry) and returns its store bundle. Used by the
 * shared LessonsPage/LessonPage/LessonSidebar components so they stay
 * track-agnostic regardless of how many tracks exist.
 */
export function useLessonsStore(): TrackLessonsStore {
	const { pathname } = useLocation();

	return useMemo<TrackLessonsStore>(() => {
		const track = resolveTrack(pathname);
		return { ...track.store, basePath: `${track.path}/lessons` };
	}, [pathname]);
}
