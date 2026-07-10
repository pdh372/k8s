import type { Diagram } from '../lib/types';

/**
 * How persistent storage is wired: a Pod mounts a PVC, which binds to a PV,
 * which a StorageClass provisions on demand via a CSI driver onto a backend.
 */
export const STORAGE_DIAGRAM: Diagram = {
	id: 'storage',
	title: 'Storage',
	subtitle:
		'A Pod mounts a PVC → bound to a PV → provisioned by a StorageClass through a CSI driver onto real storage.',
	viewBox: '0 0 960 560',
	defaultSelected: 'pvc',
	groups: {
		workload: { color: '#34d399', label: 'Workload' },
		claim: { color: '#a78bfa', label: 'Claim (namespaced)' },
		volume: { color: '#5B8DEF', label: 'Volume (cluster)' },
		class: { color: '#fbbf24', label: 'StorageClass' },
		driver: { color: '#2dd4bf', label: 'CSI driver' },
		backend: { color: '#f472b6', label: 'Backend' },
	},
	boxes: [
		{
			x: 40,
			y: 210,
			w: 460,
			h: 180,
			label: 'Namespaced — developer side',
			variant: 'dashed',
		},
		{
			x: 520,
			y: 40,
			w: 420,
			h: 470,
			label: 'Cluster-scoped — admin / provider side',
			variant: 'dashed',
		},
	],
	nodes: [
		{
			id: 'pod',
			label: 'Pod',
			group: 'workload',
			x: 70,
			y: 250,
			w: 170,
			h: 90,
			tagline: 'Mounts a volume',
			details:
				"A Pod requests storage by referencing a PVC under spec.volumes and mounting it into a container via volumeMounts. The Pod doesn't know or care what physically backs the volume.",
			questions: [
				{
					q: 'How does a Pod consume persistent storage?',
					a: 'It references a PVC in spec.volumes and mounts it with volumeMounts; Kubernetes attaches the bound PV to the node the Pod runs on.',
				},
				{
					q: 'emptyDir vs a PVC?',
					a: 'emptyDir is ephemeral and dies with the Pod. A PVC/PV persists independently, so data survives Pod restarts and rescheduling.',
				},
			],
		},
		{
			id: 'pvc',
			label: 'PVC',
			group: 'claim',
			x: 300,
			y: 250,
			w: 180,
			h: 90,
			tagline: 'A request for storage',
			details:
				'A PersistentVolumeClaim is a namespaced request for storage — a size, accessModes, and an optional storageClassName. It binds 1:1 to a matching PV. Pods reference the PVC, never the PV directly.',
			questions: [
				{
					q: 'What does a PVC bind to?',
					a: 'Exactly one PV that satisfies its requested size, accessModes and StorageClass — the binding is 1:1.',
				},
				{
					q: 'My PVC is stuck Pending — why?',
					a: 'No matching PV exists and no StorageClass can dynamically provision one (or the storageClassName is wrong/misconfigured).',
				},
			],
		},
		{
			id: 'pv',
			label: 'PV',
			group: 'volume',
			x: 560,
			y: 250,
			w: 170,
			h: 90,
			tagline: 'A piece of cluster storage',
			details:
				'A PersistentVolume is a cluster-scoped piece of storage, created statically by an admin or dynamically by a StorageClass. It carries a reclaim policy that decides its fate when the PVC is deleted.',
			questions: [
				{
					q: 'What is the reclaim policy?',
					a: 'What happens to the PV when its PVC is deleted: Delete removes the backing storage; Retain keeps it for manual recovery.',
				},
				{
					q: 'Is a PV namespaced?',
					a: 'No — PVs are cluster-scoped. PVCs are namespaced, and they bind to cluster-scoped PVs.',
				},
			],
		},
		{
			id: 'storageclass',
			label: 'StorageClass',
			group: 'class',
			x: 600,
			y: 70,
			w: 200,
			h: 70,
			tagline: 'Enables dynamic provisioning',
			details:
				'A StorageClass names a provisioner plus parameters (disk type, IOPS, filesystem). When a PVC requests that class, a PV is created automatically — no admin pre-provisioning needed.',
			questions: [
				{
					q: 'What does the default StorageClass do?',
					a: 'PVCs that omit storageClassName use it, so storage is provisioned automatically with sensible defaults.',
				},
				{
					q: "Can you change a bound PV's class later?",
					a: 'No — choose the class when creating the PVC; the class of an existing PV is effectively immutable.',
				},
			],
		},
		{
			id: 'csi',
			label: 'CSI driver',
			group: 'driver',
			x: 760,
			y: 250,
			w: 150,
			h: 90,
			tagline: 'Talks to the storage system',
			details:
				'The Container Storage Interface driver is the out-of-tree plugin that actually creates, attaches, and mounts volumes on the real backend, so storage vendors ship independently of Kubernetes releases.',
			questions: [
				{
					q: 'What is CSI?',
					a: 'A standard gRPC interface that lets storage vendors provide drivers decoupled from the Kubernetes release cycle.',
				},
				{
					q: 'Which CSI calls happen as a Pod starts?',
					a: 'CreateVolume (provision) → ControllerPublish (attach to node) → NodeStage/NodePublish (mount into the Pod).',
				},
			],
		},
		{
			id: 'backend',
			label: 'Storage backend',
			group: 'backend',
			x: 660,
			y: 410,
			w: 200,
			h: 80,
			tagline: 'The real disk / filesystem',
			details:
				'The physical or cloud storage the CSI driver manages: cloud block disks (EBS, GCE PD), network filesystems (NFS, EFS, CephFS), iSCSI, or local disks. Its type dictates which accessModes are possible.',
			questions: [
				{
					q: 'Do accessModes depend on the backend?',
					a: 'Yes — block volumes (EBS/PD) are typically ReadWriteOnce; shared filesystems (NFS/CephFS) can do ReadWriteMany.',
				},
				{
					q: 'What gives you ReadWriteMany?',
					a: 'A shared filesystem backend (NFS, CephFS, EFS). Most single-attach block storage cannot provide RWX.',
				},
			],
		},
	],
	edges: [
		{ from: 'pod', to: 'pvc' },
		{ from: 'pvc', to: 'pv' },
		{ from: 'pvc', to: 'storageclass', dashed: true },
		{ from: 'storageclass', to: 'pv', dashed: true },
		{ from: 'pv', to: 'csi' },
		{ from: 'csi', to: 'backend' },
	],
};
