import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const NAV = [
	{ to: '/', label: 'Home', end: true },
	{ to: '/lessons', label: 'Lessons' },
	{ to: '/diagrams', label: 'Diagrams' },
	{ to: '/labs', label: 'Labs' },
	{ to: '/flashcards', label: 'Flashcards' },
	{ to: '/quiz', label: 'Quiz' },
];

function BrandLogo() {
	return (
		<svg
			viewBox='0 0 64 64'
			className='h-8 w-8 shrink-0'
			aria-hidden='true'
		>
			<path
				d='M32 3 8 15v22l24 12 24-12V15L32 3Z'
				fill='#326CE5'
			/>
			<g
				stroke='#fff'
				strokeWidth='2.2'
				strokeLinecap='round'
				fill='none'
			>
				<circle
					cx='32'
					cy='30'
					r='7.5'
				/>
				<path d='M32 30V13M32 30l14.7 8.5M32 30 17.3 38.5M32 30l16-4M32 30 16 26M32 30l9 13.5M32 30l-9 13.5' />
			</g>
			<circle
				cx='32'
				cy='30'
				r='3'
				fill='#fff'
			/>
		</svg>
	);
}

export default function Layout() {
	const location = useLocation();

	// Scroll back to the top whenever the route changes.
	useEffect(() => {
		window.scrollTo({ top: 0 });
	}, [location.pathname]);

	return (
		<div className='flex min-h-full flex-col'>
			<header className='sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur'>
				<div className='mx-auto flex h-16 max-w-7xl items-center gap-4 px-4'>
					<NavLink
						to='/'
						className='flex items-center gap-2.5'
					>
						<BrandLogo />
						<span className='hidden text-lg font-semibold tracking-tight text-white sm:block'>
							K8s Interview Prep
						</span>
					</NavLink>

					<nav className='ml-auto flex items-center gap-1 overflow-x-auto'>
						{NAV.map(item => (
							<NavLink
								key={item.to}
								to={item.to}
								end={item.end}
								className={({ isActive }) =>
									[
										'focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
										isActive
											? 'bg-k8s/15 text-white'
											: 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
									].join(' ')
								}
							>
								{item.label}
							</NavLink>
						))}
					</nav>
				</div>
			</header>

			<main className='flex-1'>
				<Outlet />
			</main>

			<footer className='border-t border-slate-800/80 py-6 text-center text-sm text-slate-500'>
				Built for the team · Kubernetes interview prep · Content
				generated from the repo's lesson notes.
			</footer>
		</div>
	);
}
