import type { Diagram } from '../lib/types';

interface Props {
	diagram: Diagram;
	selectedId: string | null;
	onSelect: (id: string) => void;
}

export default function InteractiveDiagram({
	diagram,
	selectedId,
	onSelect,
}: Props) {
	const centerOf = (id: string) => {
		const n = diagram.nodes.find(node => node.id === id);
		return n ? { x: n.x + n.w / 2, y: n.y + n.h / 2 } : { x: 0, y: 0 };
	};

	return (
		<svg
			viewBox={diagram.viewBox}
			className='h-auto w-full select-none'
			role='group'
			aria-label={`Interactive ${diagram.title} diagram`}
		>
			{/* Container regions */}
			<g>
				{diagram.boxes.map((box, i) => {
					const ghost = box.variant === 'ghost';
					const dashed = box.variant === 'dashed' || ghost;
					const centerLabel = box.labelAlign === 'center';
					return (
						<g key={i}>
							<rect
								x={box.x}
								y={box.y}
								width={box.w}
								height={box.h}
								rx={16}
								className={
									ghost
										? 'fill-slate-900/20'
										: 'fill-slate-900/40'
								}
								stroke={ghost ? '#1e293b' : '#334155'}
								strokeWidth={1.5}
								strokeDasharray={dashed ? '6 6' : undefined}
							/>
							<text
								x={centerLabel ? box.x + box.w / 2 : box.x + 16}
								y={ghost ? box.y + box.h / 2 : box.y + 24}
								textAnchor={centerLabel ? 'middle' : 'start'}
								className={`text-[13px] font-semibold ${
									ghost ? 'fill-slate-600' : 'fill-slate-400'
								}`}
							>
								{box.label}
							</text>
						</g>
					);
				})}
			</g>

			{/* Edges (drawn under the node cards so they appear to join the borders) */}
			<g strokeLinecap='round'>
				{diagram.edges.map((e, i) => {
					const a = centerOf(e.from);
					const b = centerOf(e.to);
					const active = selectedId === e.from || selectedId === e.to;
					return (
						<line
							key={i}
							x1={a.x}
							y1={a.y}
							x2={b.x}
							y2={b.y}
							stroke={active ? '#5B8DEF' : '#334155'}
							strokeWidth={active ? 2.5 : 1.5}
							strokeDasharray={e.dashed ? '5 6' : undefined}
							opacity={active ? 0.95 : 0.7}
						/>
					);
				})}
			</g>

			{/* Nodes */}
			<g>
				{diagram.nodes.map(n => {
					const color = diagram.groups[n.group]?.color ?? '#5B8DEF';
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
