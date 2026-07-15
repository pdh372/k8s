import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { QuestionsBundle } from './tracks';
import { resolveTrack } from './tracks';

/**
 * Route-aware quiz/flashcard store, mirroring useLessonsStore and
 * useDiagramsStore: resolves the current track from the URL and returns its
 * question bundle. Lets QuizPage/FlashcardsPage stay track-agnostic.
 */
export function useQuestionsStore(): QuestionsBundle {
	const { pathname } = useLocation();

	return useMemo<QuestionsBundle>(
		() => resolveTrack(pathname).questions,
		[pathname],
	);
}
