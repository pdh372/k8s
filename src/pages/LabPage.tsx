import { Link, useParams } from 'react-router-dom';
import CodeBlock from '../components/CodeBlock';
import { useLabsStore } from '../lib/useLabsStore';
import type { Difficulty } from '../lib/types';

const DIFF_STYLE: Record<Difficulty, string> = {
	basic: 'bg-emerald-500/15 text-emerald-300',
	intermediate: 'bg-amber-500/15 text-amber-300',
	advanced: 'bg-rose-500/15 text-rose-300',
};

export default function LabPage() {
	const { id } = useParams<{ id: string }>();
	const { getLab, basePath } = useLabsStore();
	const lab = id ? getLab(id) : undefined;

	if (!lab) {
		return (
			<div className='mx-auto max-w-3xl px-4 py-12 text-center'>
				<p className='text-lg text-slate-300'>Lab not found.</p>
				<Link
					to={basePath}
					className='mt-3 inline-block text-k8s-light hover:underline'
				>
					← Back to all labs
				</Link>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-3xl px-4 py-8'>
			<Link
				to={basePath}
				className='text-sm text-slate-400 hover:text-slate-200'
			>
				← All labs
			</Link>

			{/* Header */}
			<div className='mt-3 flex flex-wrap items-center gap-2'>
				<span
					className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${DIFF_STYLE[lab.difficulty]}`}
				>
					{lab.difficulty}
				</span>
				<span className='rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-400'>
					~{lab.minutes} min
				</span>
			</div>
			<h1 className='mt-3 text-3xl font-bold tracking-tight text-white'>
				{lab.title}
			</h1>
			<p className='mt-3 rounded-xl border-l-4 border-k8s bg-k8s/5 py-2 pl-4 pr-3 text-slate-300'>
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

			{/* Prerequisites + what you'll learn */}
			<div className='mt-8 grid gap-4 sm:grid-cols-2'>
				<div className='rounded-xl border border-slate-800 bg-slate-900/40 p-4'>
					<h3 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
						Prerequisites
					</h3>
					<ul className='mt-2 space-y-1.5 text-sm text-slate-300'>
						{lab.prerequisites.map((p, i) => (
							<li
								key={i}
								className='flex gap-2'
							>
								<span className='text-slate-600'>•</span>
								<span>{p}</span>
							</li>
						))}
					</ul>
				</div>
				<div className='rounded-xl border border-slate-800 bg-slate-900/40 p-4'>
					<h3 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
						What you'll learn
					</h3>
					<ul className='mt-2 space-y-1.5 text-sm text-slate-300'>
						{lab.whatYouLearn.map((w, i) => (
							<li
								key={i}
								className='flex gap-2'
							>
								<span className='text-emerald-400'>✓</span>
								<span>{w}</span>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Steps */}
			<h2 className='mt-10 text-xl font-semibold text-white'>Steps</h2>
			<ol className='mt-4 space-y-6'>
				{lab.steps.map((step, i) => (
					<li
						key={i}
						className='flex gap-4'
					>
						<span className='mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-k8s/20 text-sm font-semibold text-k8s-light'>
							{i + 1}
						</span>
						<div className='min-w-0 flex-1'>
							<h3 className='font-medium text-slate-100'>
								{step.title}
							</h3>
							{step.body && (
								<p className='mt-1 text-sm text-slate-400'>
									{step.body}
								</p>
							)}
							{step.code && (
								<div className='mt-3'>
									<CodeBlock
										code={step.code}
										lang={step.lang ?? 'bash'}
									/>
								</div>
							)}
						</div>
					</li>
				))}
			</ol>

			{/* Verify */}
			<div className='mt-10 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5'>
				<h2 className='flex items-center gap-2 text-lg font-semibold text-emerald-200'>
					✅ Verify it worked
				</h2>
				<ul className='mt-3 space-y-2 text-sm text-slate-300'>
					{lab.verify.map((v, i) => (
						<li
							key={i}
							className='flex gap-2'
						>
							<span className='text-emerald-400'>›</span>
							<span>{v}</span>
						</li>
					))}
				</ul>
			</div>

			{/* Interview angle */}
			<div className='mt-6 rounded-xl border border-violet-500/30 bg-violet-500/5 p-5'>
				<h2 className='flex items-center gap-2 text-lg font-semibold text-violet-200'>
					🎯 Why it matters in interviews
				</h2>
				<p className='mt-2 text-sm leading-relaxed text-slate-300'>
					{lab.interviewAngle}
				</p>
			</div>

			{/* Cleanup */}
			<h2 className='mt-10 text-xl font-semibold text-white'>Cleanup</h2>
			<p className='mt-1 text-sm text-slate-400'>
				Tear everything down so your cluster is clean for the next lab.
			</p>
			<div className='mt-3'>
				<CodeBlock
					code={lab.cleanup}
					lang='bash'
				/>
			</div>
		</div>
	);
}
