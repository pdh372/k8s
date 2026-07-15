import { Link } from 'react-router-dom';
import { playwrightLessonsStore } from '../lib/playwrightLessons';

function StatCard({
	value,
	label,
}: {
	value: string | number;
	label: string;
}) {
	return (
		<div className='rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-center'>
			<div className='text-2xl font-bold text-white'>{value}</div>
			<div className='text-xs uppercase tracking-wide text-slate-500'>
				{label}
			</div>
		</div>
	);
}

interface FeatureCard {
	icon: string;
	title: string;
	desc: string;
	to?: string;
	soon?: boolean;
}

const FEATURES: FeatureCard[] = [
	{
		to: '/playwright/lessons',
		icon: '📚',
		title: '8 Hands-on Lessons',
		desc: 'JS/TS fundamentals, locators, UI components, Page Object Model, API testing and CI — rendered and searchable.',
	},
	{
		to: '/playwright/diagrams',
		icon: '🧭',
		title: 'Interactive Diagrams',
		desc: 'Click through the test architecture — from config and fixtures down to locators and assertions.',
	},
	{
		to: '/playwright/flashcards',
		icon: '🃏',
		title: 'Flashcards',
		desc: 'Flip through curated Q&A by topic and difficulty to rehearse your answers out loud.',
	},
	{
		to: '/playwright/quiz',
		icon: '✅',
		title: 'Quiz Mode',
		desc: 'Multiple-choice questions with instant feedback and explanations.',
	},
	{
		to: '/playwright/labs',
		icon: '🧪',
		title: 'Real-world Labs',
		desc: 'Code exercises — write a test for a scenario, then compare against a reference solution.',
	},
];

export default function PlaywrightHomePage() {
	const groups = playwrightLessonsStore.getSectionGroups();

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
					<span className='bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'>
						Playwright
					</span>{' '}
					interview
				</h1>
				<p className='mx-auto mt-4 max-w-2xl text-lg text-slate-400'>
					One place to learn end-to-end testing visually — from JS
					fundamentals to Page Objects, API mocking and CI, built
					from our own notes.
				</p>
				<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
					<Link
						to='/playwright/lessons'
						className='focus-ring rounded-xl bg-k8s px-5 py-2.5 font-semibold text-white shadow-lg shadow-k8s/20 transition hover:bg-k8s-light'
					>
						Start reading →
					</Link>
				</div>

				<div className='mx-auto mt-10 grid max-w-md grid-cols-2 gap-3'>
					<StatCard
						value={playwrightLessonsStore.LESSONS.length}
						label='Lessons'
					/>
					<StatCard
						value={groups.length}
						label='Sections'
					/>
				</div>
			</section>

			{/* Feature cards */}
			<section className='mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
				{FEATURES.map(f =>
					f.soon ? (
						<div
							key={f.title}
							aria-disabled='true'
							className='cursor-not-allowed rounded-2xl border border-slate-800 bg-slate-900/20 p-5 opacity-60'
						>
							<div className='flex items-start justify-between'>
								<div className='text-3xl'>{f.icon}</div>
								<span className='rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300'>
									Soon
								</span>
							</div>
							<h3 className='mt-3 font-semibold text-white'>
								{f.title}
							</h3>
							<p className='mt-1.5 text-sm text-slate-400'>
								{f.desc}
							</p>
						</div>
					) : (
						<Link
							key={f.title}
							to={f.to!}
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
					),
				)}
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
							to={`/playwright/lessons/${group.lessons[0].id}`}
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
