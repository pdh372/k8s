import { ARCH_NODES, ARCH_EDGES } from '../data/architecture';
import type { ArchGroup, ArchNode } from '../lib/types';

const GROUP_COLOR: Record<ArchGroup, string> = {
	'client': '#38bdf8',
	'control-plane': '#5B8DEF',
	'worker': '#34d399',
};

const NODE_BY_ID = Object.fromEntries(ARCH_NODES.map(n => [n.id, n]));

function centerOf(id: string): { x: number; y: number } {
	const n = NODE_BY_ID[id] as ArchNode | undefined;
	if (!n) return { x: 0, y: 0 };
	return { x: n.x + n.w / 2, y: n.y + n.h / 2 };
}

interface Props {
	selectedId: string | null;
	onSelect: (id: string) => void;
}

export default function ArchitectureDiagram({ selectedId, onSelect }: Props) {
	return (
		<svg
			viewBox='0 0 960 620'
			className='h-auto w-full select-none'
			role='group'
			aria-label='Interactive Kubernetes cluster architecture diagram'
		>
			{/* Container regions */}
			<g>
				<rect
					x={40}
					y={104}
					width={880}
					height={170}
					rx={16}
					className='fill-slate-900/40 stroke-slate-700'
					strokeDasharray='2 0'
				/>
				<text
					x={56}
					y={128}
					className='fill-slate-400 text-[13px] font-semibold'
				>
					Control Plane (Master)
				</text>

				<rect
					x={40}
					y={320}
					width={440}
					height={250}
					rx={16}
					className='fill-slate-900/40 stroke-slate-700'
				/>
				<text
					x={56}
					y={344}
					className='fill-slate-400 text-[13px] font-semibold'
				>
					Worker Node 1
				</text>

				{/* Decorative second worker to imply multiple identical nodes */}
				<rect
					x={520}
					y={320}
					width={400}
					height={250}
					rx={16}
					className='fill-slate-900/20 stroke-slate-800'
					strokeDasharray='6 6'
				/>
				<text
					x={720}
					y={450}
					textAnchor='middle'
					className='fill-slate-600 text-[13px]'
				>
					Worker Node 2 … N
				</text>
				<text
					x={720}
					y={470}
					textAnchor='middle'
					className='fill-slate-700 text-[11px]'
				>
					(identical components)
				</text>
			</g>

			{/* Edges (drawn under the node cards so they appear to join the borders) */}
			<g strokeLinecap='round'>
				{ARCH_EDGES.map((e, i) => {
					const a = centerOf(e.from);
					const b = centerOf(e.to);
					const active =
						selectedId === e.from || selectedId === e.to
							? true
							: false;
					return (
						<line
							key={i}
							x1={a.x}
							y1={a.y}
							x2={b.x}
							y2={b.y}
							stroke={active ? '#5B8DEF' : '#334155'}
							strokeWidth={active ? 2.5 : 1.5}
							opacity={active ? 0.95 : 0.7}
						/>
					);
				})}
			</g>

			{/* Nodes */}
			<g>
				{ARCH_NODES.map(n => {
					const color = GROUP_COLOR[n.group];
					const selected = selectedId === n.id;
					const dim = selectedId !== null && !selected;
					return (
						<g
							key={n.id}
							role='button'
							tabIndex={0}
							aria-pressed={selected}
							aria-label={n.label}
							onClick={() => onSelect(n.id)}
							onKeyDown={ev => {
								if (ev.key === 'Enter' || ev.key === ' ') {
									ev.preventDefault();
									onSelect(n.id);
								}
							}}
							className='cursor-pointer outline-none'
							style={{
								opacity: dim ? 0.55 : 1,
								transition: 'opacity 150ms',
							}}
						>
							{selected && (
								<rect
									x={n.x - 4}
									y={n.y - 4}
									width={n.w + 8}
									height={n.h + 8}
									rx={12}
									fill='none'
									stroke={color}
									strokeWidth={2}
									className='animate-pulse'
									opacity={0.6}
								/>
							)}
							<rect
								x={n.x}
								y={n.y}
								width={n.w}
								height={n.h}
								rx={10}
								fill='#0f172a'
								stroke={color}
								strokeWidth={selected ? 3 : 1.5}
								style={{
									filter: selected
										? `drop-shadow(0 0 6px ${color})`
										: undefined,
								}}
							/>
							<text
								x={n.x + n.w / 2}
								y={n.y + n.h / 2 + 5}
								textAnchor='middle'
								className='pointer-events-none font-mono text-[14px] font-medium'
								fill='#e2e8f0'
							>
								{n.label}
							</text>
						</g>
					);
				})}
			</g>
		</svg>
	);
}
