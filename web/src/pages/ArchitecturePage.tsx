import { useState } from 'react';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import { ARCH_NODES } from '../data/architecture';
import type { ArchGroup } from '../lib/types';

const GROUP_LABEL: Record<ArchGroup, string> = {
	'client': 'Client',
	'control-plane': 'Control Plane',
	'worker': 'Worker Node',
};

const GROUP_DOT: Record<ArchGroup, string> = {
	'client': 'bg-sky-400',
	'control-plane': 'bg-k8s-light',
	'worker': 'bg-emerald-400',
};

export default function ArchitecturePage() {
	const [selectedId, setSelectedId] = useState<string>('kube-apiserver');
	const node = ARCH_NODES.find(n => n.id === selectedId) ?? ARCH_NODES[0];

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			<header className='mb-6'>
				<h1 className='text-2xl font-bold text-white'>
					Cluster Architecture
				</h1>
				<p className='mt-1 max-w-2xl text-slate-400'>
					Click any component to see what it does and the interview
					questions that come up about it.
				</p>
			</header>

			<div className='grid gap-6 lg:grid-cols-[1fr_22rem]'>
				{/* Diagram */}
				<div className='rounded-2xl border border-slate-800 bg-slate-900/40 p-3 sm:p-5'>
					<ArchitectureDiagram
						selectedId={selectedId}
						onSelect={setSelectedId}
					/>
					<div className='mt-3 flex flex-wrap gap-4 border-t border-slate-800 pt-3 text-xs text-slate-400'>
						{(Object.keys(GROUP_LABEL) as ArchGroup[]).map(g => (
							<span
								key={g}
								className='flex items-center gap-1.5'
							>
								<span
									className={`h-2.5 w-2.5 rounded-full ${GROUP_DOT[g]}`}
								/>
								{GROUP_LABEL[g]}
							</span>
						))}
					</div>
				</div>

				{/* Detail panel */}
				<aside className='lg:sticky lg:top-20 lg:self-start'>
					<div
						className='animate-fade-in rounded-2xl border border-slate-800 bg-slate-900/60 p-5'
						key={node.id}
					>
						<div className='flex items-center gap-2'>
							<span
								className={`h-2.5 w-2.5 rounded-full ${GROUP_DOT[node.group]}`}
							/>
							<span className='text-xs uppercase tracking-wide text-slate-500'>
								{GROUP_LABEL[node.group]}
							</span>
						</div>
						<h2 className='mt-1.5 font-mono text-xl font-semibold text-white'>
							{node.label}
						</h2>
						<p className='mt-1 text-sm font-medium text-k8s-light'>
							{node.tagline}
						</p>
						<p className='mt-3 text-sm leading-relaxed text-slate-300'>
							{node.details}
						</p>

						<div className='mt-5'>
							<h3 className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
								Interview questions
							</h3>
							<div className='space-y-2'>
								{node.questions.map((qa, i) => (
									<details
										key={i}
										className='group rounded-lg border border-slate-800 bg-slate-950/40 p-3 [&_summary::-webkit-details-marker]:hidden'
									>
										<summary className='flex cursor-pointer items-start justify-between gap-2 text-sm font-medium text-slate-200'>
											<span>{qa.q}</span>
											<span className='mt-0.5 shrink-0 text-slate-500 transition group-open:rotate-180'>
												▾
											</span>
										</summary>
										<p className='mt-2 text-sm leading-relaxed text-slate-400'>
											{qa.a}
										</p>
									</details>
								))}
							</div>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
