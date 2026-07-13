import { Link } from 'react-router-dom';
import { k8sLessonsStore } from '../lib/lessons';
import { gcpLessonsStore } from '../lib/gcpLessons';

function Stat({ value, label }: { value: number; label: string }) {
	return (
		<div>
			<div className='text-xl font-bold text-white'>{value}</div>
			<div className='text-xs uppercase tracking-wide text-slate-500'>
				{label}
			</div>
		</div>
	);
}

interface TrackCardProps {
	to: string;
	icon: string;
	title: string;
	tagline: string;
	desc: string;
	lessons: number;
	sections: number;
	gradient: string;
}

function TrackCard({
	to,
	icon,
	title,
	tagline,
	desc,
	lessons,
	sections,
	gradient,
}: TrackCardProps) {
	return (
		<Link
			to={to}
			className='group focus-ring relative flex flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 transition hover:-translate-y-1 hover:border-slate-600 hover:shadow-2xl hover:shadow-black/40'
		>
			<div className={`h-2 bg-gradient-to-r ${gradient}`} />
			<div className='flex flex-1 flex-col p-8'>
				<div className='text-5xl'>{icon}</div>
				<span className='mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500'>
					{tagline}
				</span>
				<h2 className='mt-1 text-2xl font-bold text-white'>
					{title}
				</h2>
				<p className='mt-3 flex-1 text-sm text-slate-400'>{desc}</p>

				<div className='mt-6 flex items-center gap-6 border-t border-slate-800 pt-5'>
					<Stat
						value={lessons}
						label='Lessons'
					/>
					<Stat
						value={sections}
						label='Sections'
					/>
				</div>

				<div
					className={`mt-6 inline-flex items-center gap-1.5 self-start rounded-xl bg-gradient-to-r ${gradient} px-4 py-2 text-sm font-semibold text-white transition group-hover:gap-2.5`}
				>
					Start learning
					<span aria-hidden>→</span>
				</div>
			</div>
		</Link>
	);
}

export default function LandingPage() {
	const k8sSections = k8sLessonsStore.getSectionGroups().length;
	const gcpSections = gcpLessonsStore.getSectionGroups().length;

	return (
		<div className='mx-auto max-w-5xl px-4 py-16 sm:py-24'>
			<section className='text-center'>
				<span className='inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-400'>
					<span className='h-2 w-2 rounded-full bg-emerald-400' />
					Team study hub
				</span>
				<h1 className='mx-auto mt-5 max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl'>
					Two tracks, one place to{' '}
					<span className='bg-gradient-to-r from-k8s-light to-violet-400 bg-clip-text text-transparent'>
						get interview-ready
					</span>
				</h1>
				<p className='mx-auto mt-4 max-w-xl text-lg text-slate-400'>
					Pick a track below — lessons, diagrams, flashcards and
					quizzes, all built from our own notes.
				</p>
			</section>

			<section className='mt-12 grid gap-6 sm:grid-cols-2'>
				<TrackCard
					to='/k8s'
					icon='☸️'
					tagline='CKA-style prep'
					title='Kubernetes'
					desc='Interactive cluster diagrams, hands-on Minikube labs, flashcards and quizzes covering the full CKA curriculum.'
					lessons={k8sLessonsStore.LESSONS.length}
					sections={k8sSections}
					gradient='from-k8s to-k8s-light'
				/>
				<TrackCard
					to='/gcp'
					icon='☁️'
					tagline='Associate Cloud Engineer prep'
					title='Google Cloud'
					desc='The full ACE curriculum — compute, networking, storage, IAM, GKE and more — rendered and searchable.'
					lessons={gcpLessonsStore.LESSONS.length}
					sections={gcpSections}
					gradient='from-sky-400 to-violet-400'
				/>
			</section>
		</div>
	);
}
