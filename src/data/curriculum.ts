import type { SectionMeta } from '../lib/types';

/**
 * Display metadata for each curriculum section. Keyed by the folder name used
 * in the repo (which is also the `section` field on every generated lesson).
 */
export const SECTIONS: SectionMeta[] = [
	{
		id: '00-setup',
		title: 'Setup',
		description:
			'Install the toolchain and spin up a local Minikube cluster.',
		icon: '🧰',
		gradient: 'from-slate-500 to-slate-700',
	},
	{
		id: '02-core-concepts',
		title: 'Core Concepts',
		description:
			'Cluster architecture, Pods, ReplicaSets, Deployments, Services, Namespaces.',
		icon: '🧱',
		gradient: 'from-sky-500 to-blue-600',
	},
	{
		id: '03-scheduling',
		title: 'Scheduling',
		description:
			'How the scheduler places Pods: labels, taints, affinity, resources, DaemonSets.',
		icon: '📌',
		gradient: 'from-violet-500 to-purple-600',
	},
	{
		id: '04-logging-monitoring',
		title: 'Logging & Monitoring',
		description: 'Metrics Server and application log management.',
		icon: '📊',
		gradient: 'from-teal-500 to-emerald-600',
	},
	{
		id: '05-app-lifecycle',
		title: 'App Lifecycle',
		description:
			'Rolling updates, commands & args, env vars, ConfigMaps/Secrets, multi-container Pods.',
		icon: '🔄',
		gradient: 'from-amber-500 to-orange-600',
	},
	{
		id: '06-cluster-maintenance',
		title: 'Cluster Maintenance',
		description:
			'Node OS upgrades, cluster upgrades, and etcd backup/restore.',
		icon: '🛠️',
		gradient: 'from-orange-500 to-red-600',
	},
	{
		id: '07-security',
		title: 'Security',
		description:
			'AuthN/AuthZ, TLS certificates, KubeConfig, RBAC, image security, network policies.',
		icon: '🔐',
		gradient: 'from-rose-500 to-pink-600',
	},
	{
		id: '08-storage',
		title: 'Storage',
		description:
			'Volumes, PersistentVolumes, PVCs, StorageClasses, and CSI.',
		icon: '💾',
		gradient: 'from-cyan-500 to-sky-600',
	},
	{
		id: '09-networking',
		title: 'Networking',
		description:
			'Cluster networking model, CNI, Pod/Service networking, CoreDNS, Ingress.',
		icon: '🌐',
		gradient: 'from-indigo-500 to-blue-700',
	},
	{
		id: '10-cluster-design',
		title: 'Cluster Design',
		description:
			'Designing HA clusters and Kubernetes \u201cThe Hard Way\u201d.',
		icon: '🏗️',
		gradient: 'from-fuchsia-500 to-purple-700',
	},
];

export const SECTION_MAP: Record<string, SectionMeta> = Object.fromEntries(
	SECTIONS.map(s => [s.id, s]),
);

export function sectionTitle(id: string): string {
	return SECTION_MAP[id]?.title ?? id;
}
