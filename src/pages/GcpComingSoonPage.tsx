import { Link } from 'react-router-dom';

const PLANNED = [
	{ icon: '🧠', title: 'Core concepts', desc: 'Projects, IAM, resource hierarchy, billing.' },
	{ icon: '🖥️', title: 'Compute', desc: 'Compute Engine, GKE, Cloud Run, App Engine.' },
	{ icon: '🌐', title: 'Networking', desc: 'VPC, subnets, firewall rules, load balancing.' },
	{ icon: '🗄️', title: 'Storage & data', desc: 'Cloud Storage, Cloud SQL, BigQuery basics.' },
];

export default function GcpComingSoonPage() {
	return (
		<div className='mx-auto max-w-3xl px-4 py-20 text-center'>
			<span className='inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-400'>
				<span className='h-2 w-2 rounded-full bg-amber-400' />
				Coming soon
			</span>
			<h1 className='mx-auto mt-5 max-w-xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl'>
				<span className='bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent'>
					GCP
				</span>{' '}
				theory is on the way
			</h1>
			<p className='mx-auto mt-4 max-w-xl text-lg text-slate-400'>
				Same format as the Kubernetes track — lessons, diagrams, and
				flashcards — just not written yet. Keep sharpening your K8s
				skills in the meantime.
			</p>

			<div className='mt-10 grid gap-4 text-left sm:grid-cols-2'>
				{PLANNED.map(item => (
					<div
						key={item.title}
						className='rounded-2xl border border-slate-800 bg-slate-900/40 p-5'
					>
						<div className='text-2xl'>{item.icon}</div>
						<h3 className='mt-3 font-semibold text-white'>
							{item.title}
						</h3>
						<p className='mt-1.5 text-sm text-slate-400'>
							{item.desc}
						</p>
					</div>
				))}
			</div>

			<Link
				to='/k8s'
				className='focus-ring mt-10 inline-flex rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-800'
			>
				← Back to K8s prep
			</Link>
		</div>
	);
}
