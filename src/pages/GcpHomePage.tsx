import { Link } from 'react-router-dom';
import { gcpLessonsStore } from '../lib/gcpLessons';

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
		to: '/gcp/lessons',
		icon: '📚',
		title: '45 Hands-on Lessons',
		desc: 'The full Associate Cloud Engineer curriculum: compute, networking, storage, IAM, GKE and more — rendered and searchable.',
	},
	{
		icon: '🧭',
		title: 'Interactive Diagrams',
		desc: 'Clickable architecture diagrams for VPCs, IAM hierarchies and GKE.',
		soon: true,
	},
	{
		icon: '🃏',
		title: 'Flashcards',
		desc: 'Flip through curated Q&A by topic and difficulty to rehearse your answers out loud.',
		soon: true,
	},
	{
		icon: '✅',
		title: 'Quiz Mode',
		desc: 'Multiple-choice questions with instant feedback and explanations.',
		soon: true,
	},
	{
		icon: '🧪',
		title: 'Real-world Labs',
		desc: 'End-to-end scenarios you actually run against a GCP project.',
		soon: true,
	},
];

export default function GcpHomePage() {
	const groups = gcpLessonsStore.getSectionGroups();

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
					<span className='bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent'>
						Google Cloud
					</span>{' '}
					interview
				</h1>
				<p className='mx-auto mt-4 max-w-2xl text-lg text-slate-400'>
					One place to learn GCP visually — Associate Cloud Engineer
					theory and hands-on lessons, built from our own notes.
				</p>
				<div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
					<Link
						to='/gcp/lessons'
						className='focus-ring rounded-xl bg-k8s px-5 py-2.5 font-semibold text-white shadow-lg shadow-k8s/20 transition hover:bg-k8s-light'
					>
						Start reading →
					</Link>
				</div>

				<div className='mx-auto mt-10 grid max-w-md grid-cols-2 gap-3'>
					<StatCard
						value={gcpLessonsStore.LESSONS.length}
						label='Lessons'
					/>
					<StatCard
						value={groups.length}
						label='Chapters'
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

			{/* Curriculum chapters */}
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
							to={`/gcp/lessons/${group.lessons[0].id}`}
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
