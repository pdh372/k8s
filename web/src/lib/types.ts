export interface Lesson {
	id: string;
	section: string;
	sectionOrder: number;
	lessonNum: number;
	slug: string;
	title: string;
	summary: string;
	content: string;
}

export interface SectionMeta {
	id: string;
	title: string;
	description: string;
	icon: string;
	/** Tailwind gradient class fragment, e.g. "from-sky-500 to-blue-600". */
	gradient: string;
}

export type ArchGroup = 'client' | 'control-plane' | 'worker';

export interface ArchQuestion {
	q: string;
	a: string;
}

export interface ArchNode {
	id: string;
	label: string;
	group: ArchGroup;
	/** Geometry in the SVG viewBox coordinate system. */
	x: number;
	y: number;
	w: number;
	h: number;
	tagline: string;
	details: string;
	questions: ArchQuestion[];
}

export interface ArchEdge {
	from: string;
	to: string;
}

export type Difficulty = 'basic' | 'intermediate' | 'advanced';

export interface InterviewQuestion {
	id: string;
	topic: string;
	difficulty: Difficulty;
	question: string;
	answer: string;
}

export interface QuizQuestion {
	id: string;
	topic: string;
	question: string;
	options: string[];
	correct: number;
	explanation: string;
}
