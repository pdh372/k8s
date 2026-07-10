import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getSectionGroups, searchLessons } from '../lib/lessons';

interface Props {
	onNavigate?: () => void;
}

export default function LessonSidebar({ onNavigate }: Props) {
	const [query, setQuery] = useState('');
	const groups = useMemo(() => getSectionGroups(), []);
	const matches = useMemo(() => searchLessons(query), [query]);
	const searching = query.trim().length > 0;

	const linkClass = ({ isActive }: { isActive: boolean }) =>
		[
			'block rounded-md px-3 py-1.5 text-sm transition',
			isActive
				? 'bg-k8s/20 font-medium text-white'
				: 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
		].join(' ');

	return (
		<div className='flex h-full flex-col'>
			<div className='p-3'>
				<input
					type='search'
					value={query}
					onChange={e => setQuery(e.target.value)}
					placeholder='Search lessons…'
					className='focus-ring w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500'
				/>
			</div>

			<nav className='flex-1 overflow-y-auto px-3 pb-6'>
				{searching ? (
					<div className='space-y-1'>
						<p className='px-1 py-2 text-xs uppercase tracking-wide text-slate-500'>
							{matches.length} result
							{matches.length === 1 ? '' : 's'}
						</p>
						{matches.map(({ lesson }) => (
							<NavLink
								key={lesson.id}
								to={`/lessons/${lesson.id}`}
								className={linkClass}
								onClick={onNavigate}
							>
								{lesson.title}
							</NavLink>
						))}
						{matches.length === 0 && (
							<p className='px-1 text-sm text-slate-500'>
								No lessons match.
							</p>
						)}
					</div>
				) : (
					<div className='space-y-5'>
						{groups.map(group => (
							<div key={group.id}>
								<p className='mb-1 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>
									<span aria-hidden>{group.icon}</span>
									{group.title}
								</p>
								<div className='space-y-0.5'>
									{group.lessons.map(lesson => (
										<NavLink
											key={lesson.id}
											to={`/lessons/${lesson.id}`}
											className={linkClass}
											onClick={onNavigate}
										>
											{lesson.title}
										</NavLink>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</nav>
		</div>
	);
}
