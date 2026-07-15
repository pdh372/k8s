import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabsStore } from '../lib/useLabsStore';
import type { Difficulty } from '../lib/types';

const DIFF_STYLE: Record<Difficulty, string> = {
	basic: 'bg-emerald-500/15 text-emerald-300',
	intermediate: 'bg-amber-500/15 text-amber-300',
	advanced: 'bg-rose-500/15 text-rose-300',
};

export default function LabsPage() {
	const { labs: LABS, labTags: LAB_TAGS, basePath } = useLabsStore();
	const [tag, setTag] = useState<string>('All');
	const tags = useMemo(() => ['All', ...LAB_TAGS], [LAB_TAGS]);
	const labs = useMemo(
		() => (tag === 'All' ? LABS : LABS.filter(l => l.tags.includes(tag))),
		[tag, LABS],
	);

	return (
		<div className='mx-auto max-w-6xl px-4 py-10'>
			<header className='mb-6'>
				<h1 className='text-2xl font-bold text-white'>Hands-on Labs</h1>
				<p className='mt-2 max-w-3xl text-slate-400'>
					Real, end-to-end scenarios you can run on a local Minikube
					cluster — each composes several primitives into something
					you'd actually do on the job, with copy-paste steps,
					verification, and the interview angle.
				</p>
			</header>

			{/* Tag filter */}
			<div className='mb-6 flex flex-wrap gap-2'>
				{tags.map(t => (
					<button
						key={t}
						onClick={() => setTag(t)}
						className={[
							'focus-ring rounded-full px-3 py-1.5 text-sm font-medium transition',
							tag === t
								? 'bg-k8s text-white'
								: 'border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800',
						].join(' ')}
					>
						{t}
					</button>
				))}
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				{labs.map(lab => (
					<Link
						key={lab.id}
						to={`${basePath}/${lab.id}`}
						className='group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-5 transition hover:border-k8s/50 hover:bg-slate-900'
					>
						<div className='flex items-center gap-2'>
							<span
								className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DIFF_STYLE[lab.difficulty]}`}
							>
								{lab.difficulty}
							</span>
							<span className='text-xs text-slate-500'>
								~{lab.minutes} min
							</span>
						</div>
						<h2 className='mt-3 text-lg font-semibold text-white group-hover:text-k8s-light'>
							{lab.title}
						</h2>
						<p className='mt-1.5 flex-1 text-sm text-slate-400'>
							{lab.scenario}
						</p>
						<div className='mt-4 flex flex-wrap gap-1.5'>
							{lab.tags.map(t => (
								<span
									key={t}
									className='rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400'
								>
									{t}
								</span>
							))}
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
