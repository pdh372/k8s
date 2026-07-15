import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { Diagram } from './types';
import { resolveTrack } from './tracks';

export interface DiagramsStore {
	diagrams: Diagram[];
	getDiagram(id: string): Diagram | undefined;
}

/**
 * Route-aware diagrams store, mirroring useLessonsStore: resolves the
 * current track from the URL and returns its diagram list + lookup. Lets
 * DiagramsPage stay track-agnostic regardless of how many tracks have
 * diagram content.
 */
export function useDiagramsStore(): DiagramsStore {
	const { pathname } = useLocation();

	return useMemo<DiagramsStore>(() => {
		const diagrams = resolveTrack(pathname).diagrams;
		return {
			diagrams,
			getDiagram: (id: string) => diagrams.find(d => d.id === id),
		};
	}, [pathname]);
}
