import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { TRACKS, resolveTrack } from '../lib/tracks';

function BrandLogo() {
	return (
		<svg
			viewBox='0 0 64 64'
			className='h-8 w-8 shrink-0'
			aria-hidden='true'
		>
			<defs>
				<linearGradient
					id='brand-gradient'
					x1='0'
					y1='0'
					x2='64'
					y2='64'
				>
					<stop
						offset='0%'
						stopColor='#818cf8'
					/>
					<stop
						offset='100%'
						stopColor='#a78bfa'
					/>
				</linearGradient>
			</defs>
			<rect
				width='64'
				height='64'
				rx='16'
				fill='url(#brand-gradient)'
			/>
			<g
				stroke='#fff'
				strokeWidth='4.5'
				strokeLinecap='round'
				strokeLinejoin='round'
				fill='none'
			>
				<path d='M26 20 14 32l12 12' />
				<path d='M38 20l12 12-12 12' />
			</g>
		</svg>
	);
}

function TrackPill({ to, label, soon }: { to: string; label: string; soon?: boolean }) {
	return (
		<NavLink
			to={to}
			className={({ isActive }) =>
				[
					'focus-ring whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition',
					isActive
						? 'bg-k8s/15 text-white'
						: 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100',
				].join(' ')
			}
		>
			{label}
			{soon && (
				<span className='ml-1.5 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300'>
					Soon
				</span>
			)}
		</NavLink>
	);
}

export default function Layout() {
	const location = useLocation();
	const isLanding = location.pathname === '/';
	const subnav = resolveTrack(location.pathname).subnav;

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
							Interview Prep
						</span>
					</NavLink>

					<nav className='ml-auto flex items-center gap-1 overflow-x-auto'>
						{TRACKS.map(track => (
							<TrackPill
								key={track.id}
								to={track.path}
								label={track.label}
							/>
						))}
					</nav>
				</div>

				{!isLanding && (
					<div className='border-t border-slate-800/60'>
						<nav className='mx-auto flex h-11 max-w-7xl items-center gap-1 overflow-x-auto px-4'>
							{subnav.map(item => (
								<NavLink
									key={item.to}
									to={item.to}
									end={item.end}
									className={({ isActive }) =>
										[
											'focus-ring whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
											isActive
												? 'bg-slate-800 text-white'
												: 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-200',
										].join(' ')
									}
								>
									{item.label}
								</NavLink>
							))}
						</nav>
					</div>
				)}
			</header>

			<main className='flex-1'>
				<Outlet />
			</main>

			<footer className='border-t border-slate-800/80 py-6 text-center text-sm text-slate-500'>
				Built for the team · K8s, GCP & Playwright interview prep ·
				Content generated from the repo's lesson notes.
			</footer>
		</div>
	);
}
