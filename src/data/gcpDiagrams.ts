import type { Diagram } from '../lib/types';

/**
 * Resource hierarchy. Coordinates live in a 960x520 viewBox — a top-down
 * tree from Organization down to the resources a Project actually owns.
 */
const RESOURCE_HIERARCHY_DIAGRAM: Diagram = {
	id: 'resource-hierarchy',
	title: 'Resource Hierarchy',
	subtitle:
		'IAM policy is inherited top-down through this tree — a role granted at any level applies to everything beneath it. Click a level to dig in.',
	viewBox: '0 0 960 520',
	defaultSelected: 'project-prod',
	groups: {
		org: { color: '#818cf8', label: 'Organization' },
		folder: { color: '#a78bfa', label: 'Folder' },
		project: { color: '#5B8DEF', label: 'Project' },
		resource: { color: '#34d399', label: 'Resource' },
	},
	boxes: [],
	nodes: [
		{
			id: 'organization',
			label: 'Organization',
			group: 'org',
			x: 380,
			y: 20,
			w: 200,
			h: 68,
			tagline: 'The root node',
			details:
				"Represents the whole company; requires a Google Workspace or Cloud Identity domain to exist. A personal/learning setup with no Organization is just a standalone Project with no parent — fully valid, just without org-wide policy features.",
			questions: [
				{
					q: 'What do you need to have an Organization resource at all?',
					a: 'A Google Workspace or Cloud Identity domain — without one, you can only have standalone Projects with no shared parent.',
				},
			],
		},
		{
			id: 'folder-eng',
			label: 'Folder: Engineering',
			group: 'folder',
			x: 160,
			y: 168,
			w: 240,
			h: 64,
			tagline: 'An optional grouping layer',
			details:
				"Folders group Projects by team, department, or environment (Prod/Dev). They're optional, and can nest inside other folders for deeper org charts.",
			questions: [],
		},
		{
			id: 'folder-finance',
			label: 'Folder: Finance',
			group: 'folder',
			x: 560,
			y: 168,
			w: 240,
			h: 64,
			tagline: 'A sibling folder',
			details:
				"Each department typically gets its own top-level folder, letting IAM roles be granted once at the folder level instead of repeated on every project inside it.",
			questions: [
				{
					q: 'Why grant a role at the Folder level instead of on each Project individually?',
					a: "It's inherited by every Project (and every resource) beneath that folder automatically — one binding instead of repeating it on every project, and any new project created under it inherits the role too.",
				},
			],
		},
		{
			id: 'project-prod',
			label: 'Project: prod-app',
			group: 'project',
			x: 100,
			y: 300,
			w: 200,
			h: 64,
			tagline: 'Where resources actually live',
			details:
				"The base container for every resource — every VM, bucket, or database belongs to exactly one Project. Also the boundary for billing (one active Billing Account per Project) and the unit most IAM roles are scoped to day-to-day.",
			questions: [
				{
					q: 'Can a Project ID be changed after creation?',
					a: "No — the Project ID is permanent. The Project Name can be changed anytime, but a new ID means creating a new Project and migrating resources into it.",
				},
			],
		},
		{
			id: 'project-dev',
			label: 'Project: dev-app',
			group: 'project',
			x: 340,
			y: 300,
			w: 200,
			h: 64,
			tagline: 'A separate environment, isolated by default',
			details:
				"A sibling Project under the same folder — completely separate resources, quotas, and billing from prod-app unless IAM policy explicitly grants cross-project access.",
			questions: [],
		},
		{
			id: 'project-billing',
			label: 'Project: billing-sys',
			group: 'project',
			x: 620,
			y: 300,
			w: 200,
			h: 64,
			tagline: 'Under a different folder entirely',
			details:
				"Belongs to the Finance folder, not Engineering — demonstrating that folders (and the IAM roles inherited through them) are independent branches of the same tree.",
			questions: [],
		},
		{
			id: 'resources',
			label: 'Resources (VMs, buckets, DBs, ...)',
			group: 'resource',
			x: 240,
			y: 420,
			w: 480,
			h: 64,
			tagline: "What you actually create",
			details:
				"Every real resource (a Compute Engine VM, a Cloud Storage bucket, a Cloud SQL instance) belongs to exactly one Project — never shared directly across projects. This is the level 'effective permissions' ultimately apply to, after every level above it is combined.",
			questions: [
				{
					q: 'If a role is granted at the Organization level, can a Project-level admin remove it for their own project?',
					a: "No — permissions only add going down the hierarchy, they can't be revoked at a lower level. To remove it, you must change the binding at the level it was originally granted.",
				},
			],
		},
	],
	edges: [
		{ from: 'organization', to: 'folder-eng' },
		{ from: 'organization', to: 'folder-finance' },
		{ from: 'folder-eng', to: 'project-prod' },
		{ from: 'folder-eng', to: 'project-dev' },
		{ from: 'folder-finance', to: 'project-billing' },
		{ from: 'project-prod', to: 'resources', dashed: true },
		{ from: 'project-dev', to: 'resources', dashed: true },
		{ from: 'project-billing', to: 'resources', dashed: true },
	],
};

/**
 * Compute Engine + Load Balancing. Coordinates live in a 960x460 viewBox.
 */
const COMPUTE_AND_LB_DIAGRAM: Diagram = {
	id: 'compute-and-load-balancing',
	title: 'Compute Engine & Load Balancing',
	subtitle:
		'How traffic reaches a fleet of VMs that scale automatically. Click a component to dig in.',
	viewBox: '0 0 960 460',
	defaultSelected: 'backend-service',
	groups: {
		client: { color: '#38bdf8', label: 'Client' },
		lb: { color: '#5B8DEF', label: 'Load Balancer' },
		compute: { color: '#34d399', label: 'Compute' },
	},
	boxes: [
		{
			x: 380,
			y: 260,
			w: 540,
			h: 160,
			label: 'Managed Instance Group (auto-scaled)',
			variant: 'solid',
		},
	],
	nodes: [
		{
			id: 'client',
			label: 'Client',
			group: 'client',
			x: 40,
			y: 176,
			w: 160,
			h: 68,
			tagline: 'Anyone hitting your public IP',
			details:
				"Sends a request to the load balancer's single global anycast IP — has no idea how many backend VMs exist or where they are.",
			questions: [],
		},
		{
			id: 'forwarding-rule',
			label: 'Forwarding Rule',
			group: 'lb',
			x: 260,
			y: 60,
			w: 200,
			h: 64,
			tagline: 'The actual public entry point',
			details:
				"Binds the public IP + port to a target proxy. This is what the client's DNS record actually points to.",
			questions: [],
		},
		{
			id: 'target-proxy',
			label: 'Target HTTP(S) Proxy',
			group: 'lb',
			x: 500,
			y: 60,
			w: 200,
			h: 64,
			tagline: 'Terminates the connection',
			details:
				"Terminates the client connection (and SSL, if HTTPS), then consults the URL map to decide which backend service should handle it.",
			questions: [],
		},
		{
			id: 'url-map',
			label: 'URL Map',
			group: 'lb',
			x: 260,
			y: 176,
			w: 200,
			h: 64,
			tagline: 'The routing rule set',
			details:
				"Maps URL paths/hosts to backend services — e.g. /api/* to one backend service, /static/* to a different one (or a backend bucket serving Cloud Storage directly).",
			questions: [
				{
					q: 'Can a load balancer route different URL paths to different backend services?',
					a: "Yes — that's exactly what the URL Map does, letting one load balancer/IP serve multiple logical services split by path or hostname.",
				},
			],
		},
		{
			id: 'backend-service',
			label: 'Backend Service',
			group: 'lb',
			x: 500,
			y: 176,
			w: 200,
			h: 64,
			tagline: 'A named group of backends + health check',
			details:
				"Points at one or more backends (typically a Managed Instance Group), holds the health check configuration, and decides load balancing behavior (session affinity, timeout).",
			questions: [
				{
					q: "What determines whether a specific VM in the group keeps receiving traffic?",
					a: "Its health check status, evaluated by the Backend Service — an instance that fails the health check repeatedly is taken out of rotation until it passes again.",
				},
			],
		},
		{
			id: 'vm-instances',
			label: 'VM Instances',
			group: 'compute',
			x: 420,
			y: 320,
			w: 400,
			h: 68,
			tagline: 'Identical VMs from one Instance Template',
			details:
				"Every VM in the group is created from the same Instance Template, so they're interchangeable — the Managed Instance Group adds/removes them automatically based on the autoscaling policy.",
			questions: [
				{
					q: 'If one VM in the group crashes, what brings it back?',
					a: "MIG autohealing — if it's configured with a health check, the group automatically recreates any instance that fails it, independent of the load balancer's own health checks.",
				},
			],
		},
	],
	edges: [
		{ from: 'client', to: 'forwarding-rule' },
		{ from: 'forwarding-rule', to: 'target-proxy' },
		{ from: 'target-proxy', to: 'url-map' },
		{ from: 'url-map', to: 'backend-service' },
		{ from: 'backend-service', to: 'vm-instances' },
	],
};

/**
 * GKE architecture. Coordinates live in a 960x480 viewBox — mirrors the
 * K8s "architecture" diagram's split, but reframed around what Google
 * manages for you vs. what you still see/configure on GKE.
 */
const GKE_ARCHITECTURE_DIAGRAM: Diagram = {
	id: 'gke-architecture',
	title: 'GKE Architecture',
	subtitle:
		"What Google manages for you vs. what you still configure. Click a component to dig in.",
	viewBox: '0 0 960 480',
	defaultSelected: 'node-pool',
	groups: {
		managed: { color: '#a78bfa', label: 'Google-managed' },
		yours: { color: '#34d399', label: 'You configure' },
	},
	boxes: [
		{
			x: 40,
			y: 40,
			w: 880,
			h: 160,
			label: 'Control Plane — fully managed, you never see the VMs',
			variant: 'ghost',
			labelAlign: 'center',
		},
		{
			x: 40,
			y: 260,
			w: 880,
			h: 180,
			label: 'Your cluster (Standard mode)',
			variant: 'solid',
		},
	],
	nodes: [
		{
			id: 'control-plane',
			label: 'Control Plane',
			group: 'managed',
			x: 380,
			y: 88,
			w: 200,
			h: 76,
			tagline: 'kube-apiserver, etcd, scheduler — all invisible',
			details:
				"Google runs, patches, secures, and scales the entire control plane (kube-apiserver, etcd, scheduler, controller-manager) for you. You interact with it via kubectl exactly like any Kubernetes cluster — you just never see or manage the underlying VMs.",
			questions: [
				{
					q: 'Do you SSH into GKE control plane machines to patch Kubernetes itself?',
					a: "No — that's the entire point of a managed control plane. Google handles version upgrades and patching; you interact only through the standard Kubernetes API.",
				},
			],
		},
		{
			id: 'node-pool',
			label: 'Node Pool',
			group: 'yours',
			x: 100,
			y: 320,
			w: 240,
			h: 64,
			tagline: 'A group of Nodes with the same config',
			details:
				"A Standard-mode cluster can have multiple Node Pools sharing one cluster — e.g. a pool of cheap Spot VMs for batch jobs alongside a pool of standard VMs for latency-sensitive workloads.",
			questions: [
				{
					q: "Does Autopilot mode have Node Pools you configure?",
					a: "No — Autopilot manages nodes invisibly, similar to how you never see Control Plane VMs. Node Pools are a Standard-mode concept only.",
				},
			],
		},
		{
			id: 'node',
			label: 'Node (a Compute Engine VM)',
			group: 'yours',
			x: 380,
			y: 320,
			w: 240,
			h: 64,
			tagline: "A real, billable VM you can see in Compute Engine",
			details:
				"Each Node is an actual Compute Engine VM — it shows up in your Compute Engine instance list and is billed as one, running the standard kubelet/kube-proxy/container runtime stack.",
			questions: [],
		},
		{
			id: 'pods',
			label: 'Pods',
			group: 'yours',
			x: 660,
			y: 320,
			w: 200,
			h: 64,
			tagline: 'Your actual workloads',
			details:
				"Scheduled onto Nodes by the (Google-managed) scheduler, exactly like any Kubernetes cluster — this is where your application containers actually run.",
			questions: [],
		},
	],
	edges: [
		{ from: 'control-plane', to: 'node-pool', dashed: true },
		{ from: 'node-pool', to: 'node' },
		{ from: 'node', to: 'pods' },
	],
};

/**
 * IAM policy model. Coordinates live in a 960x320 viewBox — a simple,
 * linear "who / what / where" chain.
 */
const IAM_POLICY_MODEL_DIAGRAM: Diagram = {
	id: 'iam-policy-model',
	title: 'IAM Policy Model',
	subtitle: 'Who can do what, on which resource. Click a piece to dig in.',
	viewBox: '0 0 960 320',
	defaultSelected: 'role',
	groups: {
		who: { color: '#38bdf8', label: 'Who' },
		what: { color: '#a78bfa', label: 'What' },
		where: { color: '#34d399', label: 'Where' },
	},
	boxes: [],
	nodes: [
		{
			id: 'member',
			label: 'Member (Principal)',
			group: 'who',
			x: 40,
			y: 116,
			w: 220,
			h: 76,
			tagline: 'The identity',
			details:
				"A Google Account (human), a Service Account (workload), a Google Group, or a domain — whoever/whatever is requesting access.",
			questions: [
				{
					q: 'Why grant a role to a Google Group instead of individual accounts?',
					a: 'Easier lifecycle management — add/remove people from the group instead of editing every resource\'s IAM policy as people join or leave.',
				},
			],
		},
		{
			id: 'role',
			label: 'Role',
			group: 'what',
			x: 370,
			y: 116,
			w: 220,
			h: 76,
			tagline: 'A named bundle of permissions',
			details:
				"Predefined roles (Google-curated, service-specific — the recommended default) are the middle ground between overly-broad Basic roles (Owner/Editor/Viewer) and hand-built Custom roles.",
			questions: [
				{
					q: 'Why avoid Basic roles like Owner/Editor in production?',
					a: "They're broad and project-wide by nature — violating least privilege. Predefined (or, when truly needed, Custom) roles scope access to exactly what's needed.",
				},
			],
		},
		{
			id: 'policy-binding',
			label: 'Policy (the binding)',
			group: 'what',
			x: 620,
			y: 116,
			w: 220,
			h: 76,
			tagline: 'Attaches a Role to a Member, on a Resource',
			details:
				"The actual grant — 'this Member has this Role on this Resource.' Policies are inherited down the resource hierarchy (Org → Folder → Project → Resource) — effective permissions are the union of everything granted at every level above.",
			questions: [
				{
					q: 'How do you see everyone who has access to a project and what role they have?',
					a: 'gcloud projects get-iam-policy PROJECT_ID — lists every member/role binding currently in effect on that project.',
				},
			],
		},
	],
	edges: [
		{ from: 'member', to: 'role' },
		{ from: 'role', to: 'policy-binding' },
	],
};

/**
 * VPC networking. Coordinates live in a 960x460 viewBox.
 */
const VPC_NETWORKING_DIAGRAM: Diagram = {
	id: 'vpc-networking',
	title: 'VPC Networking',
	subtitle:
		'A private network, split into regional subnets, protected by firewall rules. Click a piece to dig in.',
	viewBox: '0 0 960 460',
	defaultSelected: 'firewall-rules',
	groups: {
		network: { color: '#5B8DEF', label: 'Network' },
		subnet: { color: '#38bdf8', label: 'Subnet' },
		security: { color: '#fb7185', label: 'Security' },
	},
	boxes: [
		{
			x: 40,
			y: 40,
			w: 880,
			h: 380,
			label: 'VPC (global resource — spans every region)',
			variant: 'solid',
		},
	],
	nodes: [
		{
			id: 'vpc',
			label: 'VPC Network',
			group: 'network',
			x: 380,
			y: 88,
			w: 200,
			h: 68,
			tagline: 'Your own private network',
			details:
				"A global resource — unlike a subnet, the VPC network object itself isn't tied to any single region. Resources inside it get private IPs and can talk to each other without touching the public internet.",
			questions: [
				{
					q: 'Auto mode vs. custom mode VPC — what\'s the difference?',
					a: 'Auto mode creates one subnet per region automatically with predefined ranges; custom mode (the production-recommended choice) lets you decide exactly which regions get subnets and their IP ranges.',
				},
			],
		},
		{
			id: 'subnet-us',
			label: 'Subnet: us-central1 (10.0.0.0/24)',
			group: 'subnet',
			x: 80,
			y: 220,
			w: 320,
			h: 68,
			tagline: 'Regional — tied to exactly one region',
			details:
				"Unlike the VPC itself, a subnet is scoped to one specific region. Its CIDR range must not overlap with any other subnet in the same VPC, or with any network it will later peer/VPN with.",
			questions: [],
		},
		{
			id: 'subnet-asia',
			label: 'Subnet: asia-southeast1 (10.0.1.0/24)',
			group: 'subnet',
			x: 560,
			y: 220,
			w: 320,
			h: 68,
			tagline: 'A second region, same VPC',
			details:
				"Both subnets belong to the same VPC and can route to each other by default — a VPC's subnets aren't isolated from one another unless firewall rules say otherwise.",
			questions: [],
		},
		{
			id: 'firewall-rules',
			label: 'Firewall Rules',
			group: 'security',
			x: 340,
			y: 340,
			w: 280,
			h: 68,
			tagline: 'Stateful, priority-ordered ALLOW/DENY rules',
			details:
				"Applied at the VPC level, not per-VM. A new custom-mode VPC denies all ingress and allows all egress by default — you must explicitly create ingress rules for anything you want to reach your VMs, scoped by target tag or service account.",
			questions: [
				{
					q: 'By default, can a freshly created custom-mode VPC be reached from the internet at all?',
					a: 'No — custom-mode VPCs deny all ingress by default. You must explicitly create a firewall rule (e.g. allowing tcp:22 for SSH) before anything can reach a VM inside it.',
				},
				{
					q: 'How are firewall rules evaluated when multiple rules could match the same traffic?',
					a: 'By priority — a lower priority number is evaluated first and wins if it matches, regardless of how many other rules also match.',
				},
			],
		},
	],
	edges: [
		{ from: 'vpc', to: 'subnet-us' },
		{ from: 'vpc', to: 'subnet-asia' },
		{ from: 'subnet-us', to: 'firewall-rules', dashed: true },
		{ from: 'subnet-asia', to: 'firewall-rules', dashed: true },
	],
};

export const GCP_DIAGRAMS: Diagram[] = [
	RESOURCE_HIERARCHY_DIAGRAM,
	COMPUTE_AND_LB_DIAGRAM,
	GKE_ARCHITECTURE_DIAGRAM,
	IAM_POLICY_MODEL_DIAGRAM,
	VPC_NETWORKING_DIAGRAM,
];

export function getGcpDiagram(id: string): Diagram | undefined {
	return GCP_DIAGRAMS.find(d => d.id === id);
}
