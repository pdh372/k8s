import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { Lab } from './types';
import { resolveTrack } from './tracks';

export interface LabsStore {
	labs: Lab[];
	labTags: string[];
	getLab(id: string): Lab | undefined;
	/** Labs-index base path for this track, e.g. "/k8s/labs". */
	basePath: string;
}

/**
 * Route-aware labs store, mirroring useDiagramsStore/useQuestionsStore:
 * resolves the current track from the URL and returns its labs list, tag
 * list, lookup, and base path. Lets LabsPage/LabPage stay track-agnostic.
 */
export function useLabsStore(): LabsStore {
	const { pathname } = useLocation();

	return useMemo<LabsStore>(() => {
		const track = resolveTrack(pathname);
		return {
			labs: track.labs,
			labTags: Array.from(new Set(track.labs.flatMap(l => l.tags))).sort(),
			getLab: (id: string) => track.labs.find(l => l.id === id),
			basePath: `${track.path}/labs`,
		};
	}, [pathname]);
}
