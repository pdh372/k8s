import { Link, useParams } from 'react-router-dom';
import LessonsShell from '../components/LessonsShell';
import Markdown from '../components/Markdown';
import { getLesson, LESSONS } from '../lib/lessons';
import { sectionTitle } from '../data/curriculum';

export default function LessonPage() {
	const { id } = useParams<{ id: string }>();
	const lesson = id ? getLesson(id) : undefined;

	if (!lesson) {
		return (
			<LessonsShell>
				<div className='rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center'>
					<p className='text-lg text-slate-300'>Lesson not found.</p>
					<Link
						to='/k8s/lessons'
						className='mt-3 inline-block text-k8s-light hover:underline'
					>
						← Back to all lessons
					</Link>
				</div>
			</LessonsShell>
		);
	}

	const index = LESSONS.findIndex(l => l.id === lesson.id);
	const prev = index > 0 ? LESSONS[index - 1] : undefined;
	const next = index < LESSONS.length - 1 ? LESSONS[index + 1] : undefined;

	return (
		<LessonsShell>
			<article className='rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8'>
				<div className='mb-6 flex flex-wrap items-center gap-2 text-xs'>
					<span className='rounded-full bg-k8s/15 px-2.5 py-1 font-medium text-k8s-light'>
						{sectionTitle(lesson.section)}
					</span>
					<span className='rounded-full bg-slate-800 px-2.5 py-1 text-slate-400'>
						Lesson {lesson.lessonNum}
					</span>
				</div>

				<Markdown>{lesson.content}</Markdown>

				<nav className='mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-between'>
					{prev ? (
						<Link
							to={`/k8s/lessons/${prev.id}`}
							className='focus-ring group rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 transition hover:border-slate-600 sm:max-w-[48%]'
						>
							<div className='text-xs text-slate-500'>
								← Previous
							</div>
							<div className='font-medium text-slate-200 group-hover:text-k8s-light'>
								{prev.title}
							</div>
						</Link>
					) : (
						<span />
					)}
					{next ? (
						<Link
							to={`/k8s/lessons/${next.id}`}
							className='focus-ring group rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-right transition hover:border-slate-600 sm:max-w-[48%] sm:ml-auto'
						>
							<div className='text-xs text-slate-500'>Next →</div>
							<div className='font-medium text-slate-200 group-hover:text-k8s-light'>
								{next.title}
							</div>
						</Link>
					) : (
						<span />
					)}
				</nav>
			</article>
		</LessonsShell>
	);
}
