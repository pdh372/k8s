import { useState, type ReactNode } from 'react';
import LessonSidebar from './LessonSidebar';

/** Responsive two-column shell shared by the lessons index and a single lesson. */
export default function LessonsShell({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);

	return (
		<div className='mx-auto max-w-7xl px-4 py-6'>
			{/* Mobile: collapsible lesson browser */}
			<div className='mb-4 lg:hidden'>
				<button
					onClick={() => setOpen(o => !o)}
					className='focus-ring flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-200'
				>
					Browse lessons
					<span className={`transition ${open ? 'rotate-180' : ''}`}>
						▾
					</span>
				</button>
				{open && (
					<div className='mt-2 max-h-[60vh] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50'>
						<LessonSidebar onNavigate={() => setOpen(false)} />
					</div>
				)}
			</div>

			<div className='lg:grid lg:grid-cols-[18rem_1fr] lg:gap-8'>
				<aside className='hidden lg:block'>
					<div className='sticky top-20 h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40'>
						<LessonSidebar />
					</div>
				</aside>
				<div className='min-w-0'>{children}</div>
			</div>
		</div>
	);
}
