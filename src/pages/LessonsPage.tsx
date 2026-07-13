import { Link } from 'react-router-dom';
import LessonsShell from '../components/LessonsShell';
import { getSectionGroups } from '../lib/lessons';

export default function LessonsPage() {
	const groups = getSectionGroups();

	return (
		<LessonsShell>
			<div className='rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8'>
				<h1 className='text-2xl font-bold text-white'>Lessons</h1>
				<p className='mt-2 max-w-2xl text-slate-400'>
					The complete CKA-style curriculum. Pick a lesson from the
					sidebar, or start a section below. Every lesson has theory,
					YAML, and a runnable Minikube lab.
				</p>

				<div className='mt-8 space-y-8'>
					{groups.map(group => (
						<section key={group.id}>
							<h2 className='flex items-center gap-2 text-lg font-semibold text-white'>
								<span aria-hidden>{group.icon}</span>
								{group.title}
							</h2>
							<div className='mt-3 grid gap-2 sm:grid-cols-2'>
								{group.lessons.map(lesson => (
									<Link
										key={lesson.id}
										to={`/k8s/lessons/${lesson.id}`}
										className='group rounded-xl border border-slate-800 bg-slate-950/40 p-3 transition hover:border-k8s/50 hover:bg-slate-900'
									>
										<div className='font-medium text-slate-100 group-hover:text-k8s-light'>
											{lesson.title}
										</div>
										{lesson.summary && (
											<p className='mt-1 line-clamp-2 text-sm text-slate-500'>
												{lesson.summary}
											</p>
										)}
									</Link>
								))}
							</div>
						</section>
					))}
				</div>
			</div>
		</LessonsShell>
	);
}
