import { useEffect, useMemo, useState } from 'react';
import { QUIZ_QUESTIONS, QUIZ_TOPICS } from '../data/questions';

function shuffle<T>(arr: T[]): T[] {
	const a = [...arr];
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

export default function QuizPage() {
	const topics = useMemo(() => ['All', ...QUIZ_TOPICS], []);
	const [topic, setTopic] = useState('All');

	const pool = useMemo(
		() =>
			topic === 'All'
				? QUIZ_QUESTIONS
				: QUIZ_QUESTIONS.filter(q => q.topic === topic),
		[topic],
	);

	const [order, setOrder] = useState<number[]>(() =>
		shuffle(pool.map((_, i) => i)),
	);
	const [index, setIndex] = useState(0);
	const [selected, setSelected] = useState<number | null>(null);
	const [answered, setAnswered] = useState(false);
	const [score, setScore] = useState(0);
	const [finished, setFinished] = useState(false);

	const restart = () => {
		setOrder(shuffle(pool.map((_, i) => i)));
		setIndex(0);
		setSelected(null);
		setAnswered(false);
		setScore(0);
		setFinished(false);
	};

	// Restart whenever the topic (and therefore the pool) changes.
	useEffect(() => {
		restart();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pool]);

	const q = pool[order[index]];

	const answer = (i: number) => {
		if (answered) return;
		setSelected(i);
		setAnswered(true);
		if (i === q.correct) setScore(s => s + 1);
	};

	const next = () => {
		if (index >= pool.length - 1) {
			setFinished(true);
			return;
		}
		setIndex(i => i + 1);
		setSelected(null);
		setAnswered(false);
	};

	const progress = ((index + (answered ? 1 : 0)) / pool.length) * 100;

	const TopicFilter = (
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
	);

	if (finished) {
		const pct = Math.round((score / pool.length) * 100);
		const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '📚';
		return (
			<div className='mx-auto max-w-2xl px-4 py-12 text-center'>
				<div className='text-6xl'>{emoji}</div>
				<h1 className='mt-4 text-2xl font-bold text-white'>
					Quiz complete!
				</h1>
				<p className='mt-2 text-slate-400'>
					You scored{' '}
					<span className='font-semibold text-white'>
						{score} / {pool.length}
					</span>{' '}
					({pct}%)
				</p>
				<div className='mx-auto mt-6 h-3 max-w-sm overflow-hidden rounded-full bg-slate-800'>
					<div
						className='h-full rounded-full bg-gradient-to-r from-k8s to-k8s-light'
						style={{ width: `${pct}%` }}
					/>
				</div>
				<div className='mt-8 flex justify-center gap-3'>
					<button
						onClick={restart}
						className='focus-ring rounded-xl bg-k8s px-5 py-2.5 font-semibold text-white transition hover:bg-k8s-light'
					>
						Try again
					</button>
				</div>
				<div className='mt-8'>{TopicFilter}</div>
			</div>
		);
	}

	const optionClass = (i: number) => {
		const base =
			'focus-ring flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition';
		if (!answered)
			return `${base} border-slate-800 bg-slate-950/40 text-slate-200 hover:border-k8s/50 hover:bg-slate-900`;
		if (i === q.correct)
			return `${base} border-emerald-500/60 bg-emerald-500/10 text-emerald-200`;
		if (i === selected)
			return `${base} border-rose-500/60 bg-rose-500/10 text-rose-200`;
		return `${base} border-slate-800 bg-slate-950/40 text-slate-500`;
	};

	return (
		<div className='mx-auto max-w-2xl px-4 py-8'>
			<header className='mb-6 text-center'>
				<h1 className='text-2xl font-bold text-white'>Quiz</h1>
				<p className='mt-1 text-slate-400'>
					Pick the best answer — you'll get instant feedback.
				</p>
			</header>

			{TopicFilter}

			{/* Progress */}
			<div className='mb-4 flex items-center justify-between text-sm text-slate-500'>
				<span>
					Question {index + 1} of {pool.length}
				</span>
				<span>Score: {score}</span>
			</div>
			<div className='mb-6 h-2 overflow-hidden rounded-full bg-slate-800'>
				<div
					className='h-full rounded-full bg-gradient-to-r from-k8s to-k8s-light transition-all'
					style={{ width: `${progress}%` }}
				/>
			</div>

			{/* Question */}
			<div className='rounded-2xl border border-slate-800 bg-slate-900/50 p-6'>
				<span className='rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400'>
					{q.topic}
				</span>
				<h2 className='mt-3 text-lg font-semibold text-white'>
					{q.question}
				</h2>

				<div className='mt-5 space-y-2.5'>
					{q.options.map((opt, i) => (
						<button
							key={i}
							onClick={() => answer(i)}
							disabled={answered}
							className={optionClass(i)}
						>
							<span className='grid h-6 w-6 shrink-0 place-items-center rounded-md border border-slate-700 text-xs font-semibold'>
								{String.fromCharCode(65 + i)}
							</span>
							<span>{opt}</span>
						</button>
					))}
				</div>

				{answered && (
					<div className='mt-5 animate-fade-in rounded-xl border border-slate-800 bg-slate-950/60 p-4'>
						<p className='text-sm font-medium text-slate-200'>
							{selected === q.correct
								? '✅ Correct!'
								: '❌ Not quite.'}
						</p>
						<p className='mt-1 text-sm text-slate-400'>
							{q.explanation}
						</p>
						<button
							onClick={next}
							className='focus-ring mt-4 rounded-xl bg-k8s px-5 py-2 font-semibold text-white transition hover:bg-k8s-light'
						>
							{index >= pool.length - 1
								? 'See results'
								: 'Next question →'}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
