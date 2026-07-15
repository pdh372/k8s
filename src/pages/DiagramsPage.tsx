import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import InteractiveDiagram from '../components/InteractiveDiagram';
import { useDiagramsStore } from '../lib/useDiagramsStore';

export default function DiagramsPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const { diagrams: DIAGRAMS, getDiagram } = useDiagramsStore();
	const initialId =
		getDiagram(searchParams.get('d') ?? '')?.id ?? DIAGRAMS[0].id;

	const [activeId, setActiveId] = useState<string>(initialId);
	const diagram = getDiagram(activeId) ?? DIAGRAMS[0];
	const [selectedId, setSelectedId] = useState<string>(
		diagram.defaultSelected,
	);

	const node =
		diagram.nodes.find(n => n.id === selectedId) ?? diagram.nodes[0];
	const group = diagram.groups[node.group];

	const switchTab = (id: string) => {
		const d = getDiagram(id);
		if (!d) return;
		setActiveId(id);
		setSelectedId(d.defaultSelected);
		setSearchParams(id === DIAGRAMS[0].id ? {} : { d: id }, {
			replace: true,
		});
	};

	return (
		<div className='mx-auto max-w-7xl px-4 py-8'>
			{/* Tabs */}
			<div className='mb-6 flex flex-wrap gap-2'>
				{DIAGRAMS.map(d => (
					<button
						key={d.id}
						onClick={() => switchTab(d.id)}
						className={[
							'focus-ring rounded-xl px-4 py-2 text-sm font-semibold transition',
							d.id === activeId
								? 'bg-k8s text-white shadow-lg shadow-k8s/20'
								: 'border border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800',
						].join(' ')}
					>
						{d.title}
					</button>
				))}
			</div>

			<header className='mb-6'>
				<h1 className='text-2xl font-bold text-white'>
					{diagram.title}
				</h1>
				<p className='mt-1 max-w-3xl text-slate-400'>
					{diagram.subtitle}
				</p>
			</header>

			<div className='grid gap-6 lg:grid-cols-[1fr_22rem]'>
				{/* Diagram */}
				<div className='rounded-2xl border border-slate-800 bg-slate-900/40 p-3 sm:p-5'>
					<InteractiveDiagram
						diagram={diagram}
						selectedId={selectedId}
						onSelect={setSelectedId}
					/>
					<div className='mt-3 flex flex-wrap gap-4 border-t border-slate-800 pt-3 text-xs text-slate-400'>
						{Object.entries(diagram.groups).map(([key, g]) => (
							<span
								key={key}
								className='flex items-center gap-1.5'
							>
								<span
									className='h-2.5 w-2.5 rounded-full'
									style={{ backgroundColor: g.color }}
								/>
								{g.label}
							</span>
						))}
					</div>
				</div>

				{/* Detail panel */}
				<aside className='lg:sticky lg:top-20 lg:self-start'>
					<div
						key={`${diagram.id}-${node.id}`}
						className='animate-fade-in rounded-2xl border border-slate-800 bg-slate-900/60 p-5'
					>
						<div className='flex items-center gap-2'>
							<span
								className='h-2.5 w-2.5 rounded-full'
								style={{ backgroundColor: group?.color }}
							/>
							<span className='text-xs uppercase tracking-wide text-slate-500'>
								{group?.label}
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
