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

export interface DiagramQuestion {
	q: string;
	a: string;
}

export interface DiagramNode {
	id: string;
	label: string;
	/** Group key — must exist in the owning diagram's `groups` map. */
	group: string;
	/** Geometry in the SVG viewBox coordinate system. */
	x: number;
	y: number;
	w: number;
	h: number;
	tagline: string;
	details: string;
	questions: DiagramQuestion[];
}

export interface DiagramEdge {
	from: string;
	to: string;
	/** Draw as a dashed line (e.g. "provisions" / logical relationships). */
	dashed?: boolean;
}

export interface DiagramBox {
	x: number;
	y: number;
	w: number;
	h: number;
	label: string;
	variant?: 'solid' | 'dashed' | 'ghost';
	/** Where to place the label. Defaults to "start" (top-left). */
	labelAlign?: 'start' | 'center';
}

export interface DiagramGroup {
	color: string;
	label: string;
}

export interface Diagram {
	id: string;
	title: string;
	subtitle: string;
	viewBox: string;
	boxes: DiagramBox[];
	nodes: DiagramNode[];
	edges: DiagramEdge[];
	groups: Record<string, DiagramGroup>;
	defaultSelected: string;
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
