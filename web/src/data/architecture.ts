import type { Diagram } from '../lib/types';

/**
 * Cluster architecture. Coordinates live in a 960x620 viewBox. Worker Node 1
 * holds the node-level components; a ghost box implies "N identical nodes".
 */
export const ARCHITECTURE_DIAGRAM: Diagram = {
	id: 'architecture',
	title: 'Cluster Architecture',
	subtitle:
		'The control plane makes decisions; worker nodes run your Pods. Click a component to dig in.',
	viewBox: '0 0 960 620',
	defaultSelected: 'kube-apiserver',
	groups: {
		'client': { color: '#38bdf8', label: 'Client' },
		'control-plane': { color: '#5B8DEF', label: 'Control Plane' },
		'worker': { color: '#34d399', label: 'Worker Node' },
	},
	boxes: [
		{
			x: 40,
			y: 104,
			w: 880,
			h: 170,
			label: 'Control Plane (Master)',
			variant: 'solid',
		},
		{
			x: 40,
			y: 320,
			w: 440,
			h: 250,
			label: 'Worker Node 1',
			variant: 'solid',
		},
		{
			x: 520,
			y: 320,
			w: 400,
			h: 250,
			label: 'Worker Node 2 … N (identical)',
			variant: 'ghost',
			labelAlign: 'center',
		},
	],
	nodes: [
		{
			id: 'kubectl',
			label: 'kubectl / clients',
			group: 'client',
			x: 380,
			y: 16,
			w: 200,
			h: 48,
			tagline: 'How you talk to the cluster',
			details:
				"kubectl and every other client (dashboards, CI, controllers) talk to the cluster exclusively through the kube-apiserver's REST API over HTTPS. kubectl reads your kubeconfig to know the server URL and which credentials to present.",
			questions: [
				{
					q: 'How does kubectl authenticate to the cluster?',
					a: 'Through the current context in kubeconfig — a client certificate, bearer token, or exec/OIDC plugin — sent to the kube-apiserver over TLS.',
				},
				{
					q: 'What does `kubectl apply` actually do?',
					a: 'It sends your desired manifest to the apiserver, which stores it in etcd. Controllers then reconcile the real state toward that desired state (declarative model).',
				},
			],
		},
		{
			id: 'kube-apiserver',
			label: 'kube-apiserver',
			group: 'control-plane',
			x: 385,
			y: 150,
			w: 190,
			h: 76,
			tagline: 'The front door of the control plane',
			details:
				'The central hub and the only component that talks to etcd. It validates and processes REST requests, running authentication, authorization (RBAC) and admission control before persisting state. Every other component watches the apiserver.',
			questions: [
				{
					q: 'Why is the apiserver considered stateless?',
					a: 'It stores no data itself — all cluster state lives in etcd. That lets you run several apiserver replicas behind a load balancer for high availability.',
				},
				{
					q: 'In what order is an API request processed?',
					a: 'Authentication → Authorization (RBAC) → Admission controllers (mutating, then validating) → the object is persisted to etcd.',
				},
			],
		},
		{
			id: 'etcd',
			label: 'etcd',
			group: 'control-plane',
			x: 64,
			y: 150,
			w: 150,
			h: 76,
			tagline: "The cluster's source of truth",
			details:
				'A distributed, strongly-consistent key-value store (Raft consensus) that holds all cluster state and configuration. Only the apiserver reads and writes it. Lose etcd and you lose the cluster — so back it up.',
			questions: [
				{
					q: 'How do you back up and restore etcd?',
					a: '`etcdctl snapshot save` against the etcd endpoint (with CA/cert/key), and `etcdctl snapshot restore` to rebuild the data directory.',
				},
				{
					q: 'Why run an odd number of etcd members (3 or 5)?',
					a: 'Raft needs a majority quorum to elect a leader and commit writes; odd counts give the best fault tolerance per member.',
				},
			],
		},
		{
			id: 'kube-scheduler',
			label: 'kube-scheduler',
			group: 'control-plane',
			x: 214,
			y: 150,
			w: 150,
			h: 76,
			tagline: 'Assigns Pods to Nodes',
			details:
				'Watches for Pods that have no node assigned and picks the best node in two phases: filtering (predicates — resources, taints, affinity) then scoring (priorities). It only decides placement; the kubelet actually runs the Pod.',
			questions: [
				{
					q: "The scheduler doesn't run Pods — so who does?",
					a: 'The kubelet on the selected node. The scheduler merely sets spec.nodeName on the Pod.',
				},
				{
					q: 'How do taints and affinity influence scheduling?',
					a: 'Taints repel Pods from a node unless the Pod has a matching toleration; node/pod affinity attracts or spreads Pods based on labels.',
				},
			],
		},
		{
			id: 'kube-controller-manager',
			label: 'controller-manager',
			group: 'control-plane',
			x: 590,
			y: 150,
			w: 158,
			h: 76,
			tagline: 'Runs the reconciliation loops',
			details:
				'A single binary that runs many controllers (Node, ReplicaSet, Deployment, Job, EndpointSlice…). Each watches desired state on the apiserver and works to make the actual state match it.',
			questions: [
				{
					q: 'What does a controller loop actually do?',
					a: 'It continuously compares desired vs. actual state and takes corrective action to converge them — e.g. recreating a Pod when a ReplicaSet is short a replica.',
				},
				{
					q: 'What happens when a Node becomes NotReady?',
					a: 'The node controller waits a grace period, then marks/evicts the Pods on it so their controllers can reschedule them elsewhere.',
				},
			],
		},
		{
			id: 'cloud-controller-manager',
			label: 'cloud-controller-mgr',
			group: 'control-plane',
			x: 764,
			y: 150,
			w: 158,
			h: 76,
			tagline: 'Bridges Kubernetes and the cloud',
			details:
				"Runs controllers that integrate with a cloud provider's API — provisioning load balancers, attaching volumes, and managing node lifecycle. It's absent on bare-metal and Minikube clusters.",
			questions: [
				{
					q: 'Why is it split from the kube-controller-manager?',
					a: 'To keep cloud-specific code out of core Kubernetes so providers can build and release their integrations independently.',
				},
				{
					q: 'What creates the external LB for a Service of type LoadBalancer?',
					a: 'The service controller inside the cloud-controller-manager calls the cloud API to provision it.',
				},
			],
		},
		{
			id: 'kubelet',
			label: 'kubelet',
			group: 'worker',
			x: 66,
			y: 384,
			w: 182,
			h: 58,
			tagline: 'The node agent',
			details:
				'Runs on every node. It registers the node with the apiserver, watches for Pods bound to it, and drives the container runtime to start/stop containers. It reports node and Pod status back to the control plane.',
			questions: [
				{
					q: "Where does the kubelet get Pods that aren't from the apiserver?",
					a: "From static Pod manifests on a local path (e.g. /etc/kubernetes/manifests) — that's how control-plane components run on a kubeadm cluster.",
				},
				{
					q: 'How does the kubelet know if a container is healthy?',
					a: 'It runs liveness, readiness and startup probes and reports the result; a failed liveness probe makes it restart the container.',
				},
			],
		},
		{
			id: 'kube-proxy',
			label: 'kube-proxy',
			group: 'worker',
			x: 274,
			y: 384,
			w: 182,
			h: 58,
			tagline: 'Implements Service networking',
			details:
				"Runs on each node and programs iptables (or IPVS) rules so that traffic sent to a Service's virtual ClusterIP is load-balanced across the healthy Pod endpoints behind it.",
			questions: [
				{
					q: 'What makes a ClusterIP reachable from any Pod?',
					a: "kube-proxy's iptables/IPVS rules DNAT the virtual Service IP to one of the real Pod endpoint IPs.",
				},
				{
					q: 'Does kube-proxy do DNS resolution?',
					a: 'No — CoreDNS resolves Service names. kube-proxy only handles L3/L4 Service traffic routing.',
				},
			],
		},
		{
			id: 'container-runtime',
			label: 'container runtime',
			group: 'worker',
			x: 66,
			y: 470,
			w: 182,
			h: 58,
			tagline: 'Runs the containers',
			details:
				'A CRI-compatible runtime (containerd, CRI-O) that pulls images and runs containers on behalf of the kubelet. Docker Engine is no longer called directly since dockershim was removed in v1.24.',
			questions: [
				{
					q: 'What is the CRI?',
					a: 'The Container Runtime Interface — the gRPC API the kubelet uses to talk to any compliant runtime, decoupling Kubernetes from a specific runtime.',
				},
				{
					q: 'Did removing dockershim break Docker images?',
					a: 'No. Images built with Docker are OCI images and still run fine under containerd/CRI-O.',
				},
			],
		},
		{
			id: 'pods',
			label: 'Pods',
			group: 'worker',
			x: 274,
			y: 470,
			w: 182,
			h: 58,
			tagline: 'The smallest deployable unit',
			details:
				'One or more containers that share a network namespace (a single IP) and can share volumes, always co-scheduled onto one node. Pods are ephemeral — a controller replaces them when they die.',
			questions: [
				{
					q: 'How do two containers in the same Pod communicate?',
					a: 'Over localhost — they share the same network namespace and Pod IP, so they reach each other on 127.0.0.1:<port>.',
				},
				{
					q: 'Why avoid deploying bare Pods in production?',
					a: "A bare Pod isn't self-healing. Use a Deployment/ReplicaSet so a controller recreates the Pod if the node or Pod fails.",
				},
			],
		},
	],
	edges: [
		{ from: 'kubectl', to: 'kube-apiserver' },
		{ from: 'kube-apiserver', to: 'etcd' },
		{ from: 'kube-apiserver', to: 'kube-scheduler' },
		{ from: 'kube-apiserver', to: 'kube-controller-manager' },
		{ from: 'kube-apiserver', to: 'cloud-controller-manager' },
		{ from: 'kube-apiserver', to: 'kubelet' },
		{ from: 'kube-apiserver', to: 'kube-proxy' },
		{ from: 'kubelet', to: 'container-runtime' },
		{ from: 'container-runtime', to: 'pods' },
	],
};
