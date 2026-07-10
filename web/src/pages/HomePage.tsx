import { Link } from 'react-router-dom';
import { getSectionGroups, LESSONS } from '../lib/lessons';
import { INTERVIEW_QUESTIONS, QUIZ_QUESTIONS } from '../data/questions';

function StatCard({ value, label }: { value: string | number; label: string }) {
	return (
		<div className='rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-center'>
			<div className='text-2xl font-bold text-white'>{value}</div>
			<div className='text-xs uppercase tracking-wide text-slate-500'>
				{label}
			</div>
		</div>
	);
}

const FEATURES = [
	{
		to: '/diagrams',
		icon: '🧭',
		title: 'Interactive Diagrams',
		desc: 'Click through cluster architecture, networking, storage, RBAC, and CI/CD to see what each component does — with the interview questions that go with it.',
	},
	{
		to: '/lessons',
		icon: '📚',
		title: '48 Hands-on Lessons',
		desc: 'The full CKA-style curriculum: theory, YAML, and runnable labs, rendered and searchable.',
	},
	{
		to: '/flashcards',
		icon: '🃏',
		title: 'Flashcards',
		desc: 'Flip through curated Q&A by topic and difficulty to rehearse your answers out loud.',
	},
	{
		to: '/quiz',
		icon: '✅',
		title: 'Quiz Mode',
		desc: 'Multiple-choice questions with instant feedback and explanations. Track your score.',
	},
];

export default function HomePage() {
	const groups = getSectionGroups();

	return (
		<div className='mx-auto max-w-7xl px-4 py-12'>
			{/* Hero */}
			<section className='text-center'>
				<span className='inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-400'>
					<span className='h-2 w-2 rounded-full bg-emerald-400' />
					Team study hub
				</span>
				<h1 className='mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl'>
					Ace your{' '}
					<span className='bg-gradient-to-r from-k8s-light to-violet-400 bg-clip-text text-transparent'>
						Kubernetes
					</span>{' '}
					interview
				</h1>
				<p className='mx-auto mt-4 max-w-2xl text-lg text-slate-400'>
					One place to learn K8s visually — an interactive cluster
					diagram, hands-on lessons, flashcards, and quizzes built
					from our own notes.
				</p>
				<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
					<Link
						to='/diagrams'
						className='focus-ring rounded-xl bg-k8s px-5 py-2.5 font-semibold text-white shadow-lg shadow-k8s/20 transition hover:bg-k8s-light'
					>
						Explore the cluster →
					</Link>
					<Link
						to='/flashcards'
						className='focus-ring rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-800'
					>
						Start flashcards
					</Link>
				</div>

				<div className='mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4'>
					<StatCard
						value={LESSONS.length}
						label='Lessons'
					/>
					<StatCard
						value={groups.length}
						label='Sections'
					/>
					<StatCard
						value={INTERVIEW_QUESTIONS.length}
						label='Flashcards'
					/>
					<StatCard
						value={QUIZ_QUESTIONS.length}
						label='Quiz Qs'
					/>
				</div>
			</section>

			{/* Feature cards */}
			<section className='mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{FEATURES.map(f => (
					<Link
						key={f.to}
						to={f.to}
						className='group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-k8s/50 hover:bg-slate-900'
					>
						<div className='text-3xl'>{f.icon}</div>
						<h3 className='mt-3 font-semibold text-white group-hover:text-k8s-light'>
							{f.title}
						</h3>
						<p className='mt-1.5 text-sm text-slate-400'>
							{f.desc}
						</p>
					</Link>
				))}
			</section>

			{/* Curriculum sections */}
			<section className='mt-16'>
				<h2 className='text-xl font-semibold text-white'>
					Browse by topic
				</h2>
				<p className='mt-1 text-sm text-slate-400'>
					Jump straight into any part of the curriculum.
				</p>
				<div className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{groups.map(group => (
						<Link
							key={group.id}
							to={`/lessons/${group.lessons[0].id}`}
							className='group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40 transition hover:border-slate-600'
						>
							<div
								className={`h-1.5 bg-gradient-to-r ${group.gradient}`}
							/>
							<div className='p-5'>
								<div className='flex items-center justify-between'>
									<span className='text-2xl'>
										{group.icon}
									</span>
									<span className='rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400'>
										{group.lessons.length} lesson
										{group.lessons.length === 1 ? '' : 's'}
									</span>
								</div>
								<h3 className='mt-3 font-semibold text-white group-hover:text-k8s-light'>
									{group.title}
								</h3>
								<p className='mt-1 text-sm text-slate-400'>
									{group.description}
								</p>
							</div>
						</Link>
					))}
				</div>
			</section>
		</div>
	);
}
