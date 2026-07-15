import type { LessonsStore } from './lessonsStore';
import type { Diagram, InterviewQuestion, Lab, QuizQuestion } from './types';
import { k8sLessonsStore } from './lessons';
import { gcpLessonsStore } from './gcpLessons';
import { playwrightLessonsStore } from './playwrightLessons';
import { DIAGRAMS } from '../data/diagrams';
import { PLAYWRIGHT_DIAGRAMS } from '../data/playwrightDiagrams';
import { GCP_DIAGRAMS } from '../data/gcpDiagrams';
import {
	INTERVIEW_QUESTIONS,
	INTERVIEW_TOPICS,
	QUIZ_QUESTIONS,
	QUIZ_TOPICS,
} from '../data/questions';
import {
	PLAYWRIGHT_INTERVIEW_QUESTIONS,
	PLAYWRIGHT_INTERVIEW_TOPICS,
	PLAYWRIGHT_QUIZ_QUESTIONS,
	PLAYWRIGHT_QUIZ_TOPICS,
} from '../data/playwrightQuestions';
import {
	GCP_INTERVIEW_QUESTIONS,
	GCP_INTERVIEW_TOPICS,
	GCP_QUIZ_QUESTIONS,
	GCP_QUIZ_TOPICS,
} from '../data/gcpQuestions';
import { LABS } from '../data/labs';
import { PLAYWRIGHT_LABS } from '../data/playwrightLabs';
import { GCP_LABS } from '../data/gcpLabs';

export interface SubnavItem {
	to: string;
	label: string;
	end?: boolean;
}

export interface QuestionsBundle {
	quizQuestions: QuizQuestion[];
	quizTopics: string[];
	interviewQuestions: InterviewQuestion[];
	interviewTopics: string[];
}

export interface TrackConfig {
	id: string;
	label: string;
	/** Root path for this track, e.g. "/k8s". Also the pill's link target. */
	path: string;
	store: LessonsStore;
	/** Empty for tracks with no diagrams yet — DiagramsPage's route is only added for tracks with content. */
	diagrams: Diagram[];
	/** Empty arrays for tracks with no quiz/flashcard content yet. */
	questions: QuestionsBundle;
	/** Empty for tracks with no labs yet. */
	labs: Lab[];
	subnav: SubnavItem[];
}

/**
 * Central registry of every course track. Adding a new track (new theory/
 * tree + lessons store) only needs a new entry here — Layout's pills/subnav
 * and useLessonsStore's track resolution both read from this array instead
 * of hardcoding each track by name.
 */
export const TRACKS: TrackConfig[] = [
	{
		id: 'k8s',
		label: 'K8s',
		path: '/k8s',
		store: k8sLessonsStore,
		diagrams: DIAGRAMS,
		questions: {
			quizQuestions: QUIZ_QUESTIONS,
			quizTopics: QUIZ_TOPICS,
			interviewQuestions: INTERVIEW_QUESTIONS,
			interviewTopics: INTERVIEW_TOPICS,
		},
		labs: LABS,
		subnav: [
			{ to: '/k8s', label: 'Home', end: true },
			{ to: '/k8s/lessons', label: 'Lessons' },
			{ to: '/k8s/diagrams', label: 'Diagrams' },
			{ to: '/k8s/labs', label: 'Labs' },
			{ to: '/k8s/flashcards', label: 'Flashcards' },
			{ to: '/k8s/quiz', label: 'Quiz' },
		],
	},
	{
		id: 'gcp',
		label: 'GCP',
		path: '/gcp',
		store: gcpLessonsStore,
		diagrams: GCP_DIAGRAMS,
		questions: {
			quizQuestions: GCP_QUIZ_QUESTIONS,
			quizTopics: GCP_QUIZ_TOPICS,
			interviewQuestions: GCP_INTERVIEW_QUESTIONS,
			interviewTopics: GCP_INTERVIEW_TOPICS,
		},
		labs: GCP_LABS,
		subnav: [
			{ to: '/gcp', label: 'Home', end: true },
			{ to: '/gcp/lessons', label: 'Lessons' },
			{ to: '/gcp/diagrams', label: 'Diagrams' },
			{ to: '/gcp/labs', label: 'Labs' },
			{ to: '/gcp/flashcards', label: 'Flashcards' },
			{ to: '/gcp/quiz', label: 'Quiz' },
		],
	},
	{
		id: 'playwright',
		label: 'Playwright',
		path: '/playwright',
		store: playwrightLessonsStore,
		diagrams: PLAYWRIGHT_DIAGRAMS,
		questions: {
			quizQuestions: PLAYWRIGHT_QUIZ_QUESTIONS,
			quizTopics: PLAYWRIGHT_QUIZ_TOPICS,
			interviewQuestions: PLAYWRIGHT_INTERVIEW_QUESTIONS,
			interviewTopics: PLAYWRIGHT_INTERVIEW_TOPICS,
		},
		labs: PLAYWRIGHT_LABS,
		subnav: [
			{ to: '/playwright', label: 'Home', end: true },
			{ to: '/playwright/lessons', label: 'Lessons' },
			{ to: '/playwright/diagrams', label: 'Diagrams' },
			{ to: '/playwright/labs', label: 'Labs' },
			{ to: '/playwright/flashcards', label: 'Flashcards' },
			{ to: '/playwright/quiz', label: 'Quiz' },
		],
	},
];

/** Which track a pathname belongs to, defaulting to the first track. */
export function resolveTrack(pathname: string): TrackConfig {
	return TRACKS.find(t => pathname.startsWith(t.path)) ?? TRACKS[0];
}
