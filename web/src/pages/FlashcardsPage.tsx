import { useEffect, useMemo, useState } from 'react';
import { INTERVIEW_QUESTIONS, INTERVIEW_TOPICS } from '../data/questions';
import type { Difficulty } from '../lib/types';

const DIFF_STYLE: Record<Difficulty, string> = {
	basic: 'bg-emerald-500/15 text-emerald-300',
	intermediate: 'bg-amber-500/15 text-amber-300',
	advanced: 'bg-rose-500/15 text-rose-300',
};

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export default function FlashcardsPage() {
	const topics = useMemo(() => ['All', ...INTERVIEW_TOPICS], []);
	const [topic, setTopic] = useState('All');

	const cards = useMemo(
		() =>
			topic === 'All'
				? INTERVIEW_QUESTIONS
				: INTERVIEW_QUESTIONS.filter(q => q.topic === topic),
		[topic],
	);

	const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i));
	const [pos, setPos] = useState(0);
	const [flipped, setFlipped] = useState(false);

	// Reset the deck whenever the topic filter changes.
	useEffect(() => {
		setOrder(cards.map((_, i) => i));
		setPos(0);
		setFlipped(false);
	}, [cards]);

	const card = cards[order[pos]] ?? cards[0];

	const go = (delta: number) => {
		setFlipped(false);
		setPos(p => (p + delta + cards.length) % cards.length);
	};
	const reshuffle = () => {
		setOrder(shuffle(cards.map((_, i) => i)));
		setPos(0);
		setFlipped(false);
	};

	// Keyboard shortcuts: ← previous, → next, space/enter flip.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') go(1);
			else if (e.key === 'ArrowLeft') go(-1);
			else if (e.key === ' ' || e.key === 'Enter') {
				e.preventDefault();
				setFlipped(f => !f);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [cards.length]);

	if (!card) return null;

	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<header className='mb-6 text-center'>
				<h1 className='text-2xl font-bold text-white'>Flashcards</h1>
				<p className='mt-1 text-slate-400'>
					Click the card to reveal the answer. Use ← → to move, space
					to flip.
				</p>
			</header>

			{/* Topic filter */}
			<div className='mb-6 flex flex-wrap justify-center gap-2'>
				{topics.map(t => (
					<button
						key={t}
						onClick={() => setTopic(t)}
						className={[
							'focus-ring rounded-full px-3 py-1.5 text-sm font-medium transition',
							topic === t
								? 'bg-k8s text-white'
								: 'border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800',
						].join(' ')}
					>
						{t}
					</button>
				))}
			</div>

			{/* Card */}
			<div
				className='[perspective:1600px]'
				onClick={() => setFlipped(f => !f)}
			>
				<div
					className='relative min-h-[18rem] w-full cursor-pointer rounded-2xl transition-transform duration-500 [transform-style:preserve-3d]'
					style={{
						transform: flipped
							? 'rotateY(180deg)'
							: 'rotateY(0deg)',
					}}
				>
					{/* Front — question */}
					<div className='absolute inset-0 flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-6 [backface-visibility:hidden]'>
						<div className='flex items-center justify-between'>
							<span className='rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400'>
								{card.topic}
							</span>
							<span
								className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DIFF_STYLE[card.difficulty]}`}
							>
								{card.difficulty}
							</span>
						</div>
						<div className='flex flex-1 items-center justify-center'>
							<p className='text-center text-xl font-semibold leading-relaxed text-white'>
								{card.question}
							</p>
						</div>
						<p className='text-center text-xs text-slate-500'>
							Click to reveal answer
						</p>
					</div>

					{/* Back — answer */}
					<div className='absolute inset-0 flex flex-col rounded-2xl border border-k8s/40 bg-slate-900 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]'>
						<span className='text-xs font-semibold uppercase tracking-wide text-k8s-light'>
							Answer
						</span>
						<div className='flex flex-1 items-center justify-center'>
							<p className='text-center text-lg leading-relaxed text-slate-200'>
								{card.answer}
							</p>
						</div>
						<p className='text-center text-xs text-slate-500'>
							Click to flip back
						</p>
					</div>
				</div>
			</div>

			{/* Controls */}
			<div className='mt-6 flex items-center justify-between'>
				<button
					onClick={() => go(-1)}
					className='focus-ring rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800'
				>
					← Prev
				</button>
				<div className='flex items-center gap-4'>
					<span className='text-sm text-slate-500'>
						{pos + 1} / {cards.length}
					</span>
					<button
						onClick={reshuffle}
						className='focus-ring rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800'
					>
						⇄ Shuffle
					</button>
				</div>
				<button
					onClick={() => go(1)}
					className='focus-ring rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800'
				>
					Next →
				</button>
			</div>
		</div>
	);
}
