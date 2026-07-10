import type { Diagram, DiagramNode } from '../lib/types';

// The three backend Pods are Service replicas — they share the same concept,
// so they reuse one content block (only id/label/geometry differ).
const endpoint: Omit<DiagramNode, 'id' | 'label' | 'x' | 'y' | 'w' | 'h'> = {
	group: 'workload',
	tagline: 'A Service endpoint',
	details:
		"These are the Pods selected by the Service's label selector. Only Pods that pass their readiness probe are added to the EndpointSlice and receive traffic. Each has its own ephemeral IP on the flat pod network.",
	questions: [
		{
			q: 'How does a Pod become a Service endpoint?',
			a: "It must match the Service's selector AND pass its readiness probe; then its IP is added to the EndpointSlice the Service routes to.",
		},
		{
			q: 'Why not just connect to Pod IPs directly?',
			a: 'Pod IPs change on every restart or reschedule. The Service gives a stable virtual IP + DNS name that always points at the current healthy set.',
		},
	],
};

/** How a request travels from the internet to a Pod, and how the pieces cooperate. */
export const NETWORKING_DIAGRAM: Diagram = {
	id: 'networking',
	title: 'Networking',
	subtitle:
		'From the internet to a container: Ingress → Service → Pods, wired by kube-proxy, CoreDNS and the CNI.',
	viewBox: '0 0 960 660',
	defaultSelected: 'service',
	groups: {
		client: { color: '#38bdf8', label: 'Client' },
		ingress: { color: '#f472b6', label: 'Ingress (L7)' },
		service: { color: '#5B8DEF', label: 'Service (L4)' },
		dns: { color: '#fbbf24', label: 'DNS' },
		dataplane: { color: '#2dd4bf', label: 'Data plane' },
		workload: { color: '#34d399', label: 'Pods' },
	},
	boxes: [
		{
			x: 270,
			y: 400,
			w: 430,
			h: 250,
			label: 'Pod network — flat, 1 IP per Pod (CNI)',
			variant: 'dashed',
			labelAlign: 'center',
		},
	],
	nodes: [
		{
			id: 'external',
			label: 'Internet / user',
			group: 'client',
			x: 380,
			y: 24,
			w: 200,
			h: 50,
			tagline: 'Traffic from outside the cluster',
			details:
				'External clients reach your apps through an entry point: an Ingress (HTTP/HTTPS) or a Service of type NodePort/LoadBalancer. From there, traffic is routed to Pod endpoints.',
			questions: [
				{
					q: 'How does external traffic reach a Pod?',
					a: 'Through a NodePort/LoadBalancer Service or an Ingress → Service → the Pod endpoints selected by the Service.',
				},
				{
					q: 'LoadBalancer vs Ingress for exposure?',
					a: 'A LoadBalancer is a per-Service L4 cloud LB. Ingress is a shared L7 HTTP router with host/path rules and TLS, fronting many Services through one IP.',
				},
			],
		},
		{
			id: 'ingress',
			label: 'Ingress',
			group: 'ingress',
			x: 385,
			y: 118,
			w: 190,
			h: 60,
			tagline: 'L7 HTTP(S) router',
			details:
				'An Ingress resource defines host/path routing rules and TLS. An Ingress controller (nginx, Traefik, HAProxy) actually implements those rules — one external entry point can front many Services.',
			questions: [
				{
					q: 'Does an Ingress resource do anything on its own?',
					a: 'No — you must run an Ingress controller. The Ingress object is just a set of rules the controller reads and enforces.',
				},
				{
					q: 'How does Ingress terminate TLS?',
					a: 'It references a Secret holding the certificate/key; the controller serves HTTPS and forwards plaintext to the backend Service.',
				},
			],
		},
		{
			id: 'service',
			label: 'Service (ClusterIP)',
			group: 'service',
			x: 385,
			y: 222,
			w: 190,
			h: 64,
			tagline: 'Stable virtual IP + load balancing',
			details:
				'A Service gives a stable ClusterIP and DNS name and load-balances across the Pods matched by its label selector, tracked in EndpointSlices. It decouples clients from ephemeral Pod IPs.',
			questions: [
				{
					q: 'What if the selector matches no ready Pods?',
					a: "The EndpointSlice is empty and connections fail — the classic 'Service has no endpoints' problem. Check labels and readiness probes.",
				},
				{
					q: 'ClusterIP vs NodePort vs LoadBalancer?',
					a: 'Internal-only VIP, vs a port opened on every node, vs an external cloud load balancer that fronts the Service.',
				},
			],
		},
		{
			id: 'kube-proxy',
			label: 'kube-proxy',
			group: 'dataplane',
			x: 650,
			y: 222,
			w: 180,
			h: 64,
			tagline: 'Programs the Service rules',
			details:
				"kube-proxy runs on every node and programs iptables (or IPVS) rules so that packets to a Service's ClusterIP are DNAT'd to a real Pod endpoint. It sets the rules; the kernel forwards the packets.",
			questions: [
				{
					q: 'Which modes does kube-proxy support?',
					a: 'iptables (default) and IPVS (better performance at large scale). The old userspace mode is legacy.',
				},
				{
					q: 'Is kube-proxy a per-packet proxy?',
					a: "No, not in iptables/IPVS mode — it installs kernel rules, so it isn't on the hot path for every packet.",
				},
			],
		},
		{
			id: 'coredns',
			label: 'CoreDNS',
			group: 'dns',
			x: 110,
			y: 222,
			w: 170,
			h: 64,
			tagline: 'Cluster DNS',
			details:
				'CoreDNS resolves Service and Pod DNS names (e.g. my-svc.my-ns.svc.cluster.local) to ClusterIPs. It runs as a Deployment and is fronted by the kube-dns Service.',
			questions: [
				{
					q: "What is a Service's fully-qualified DNS name?",
					a: '<service>.<namespace>.svc.cluster.local — within the same namespace, just <service> works.',
				},
				{
					q: 'How do Pods know to use CoreDNS?',
					a: "The kubelet writes CoreDNS as the nameserver in each Pod's /etc/resolv.conf.",
				},
			],
		},
		{
			id: 'cni',
			label: 'CNI plugin',
			group: 'dataplane',
			x: 385,
			y: 560,
			w: 190,
			h: 58,
			tagline: 'Implements the pod network',
			details:
				'The CNI plugin (Calico, Flannel, Cilium…) fulfils the Kubernetes network model: every Pod gets its own IP and any Pod can reach any other Pod without NAT. It wires up cross-node connectivity.',
			questions: [
				{
					q: 'What problem does the CNI solve?',
					a: "Assigning each Pod an IP and connecting Pods across nodes on a flat network, per the K8s 'no-NAT between Pods' model.",
				},
				{
					q: 'Which CNIs enforce NetworkPolicy?',
					a: 'Calico and Cilium do; plain Flannel does not enforce NetworkPolicies on its own.',
				},
			],
		},
		{
			id: 'pod-a',
			label: 'Pod',
			x: 300,
			y: 430,
			w: 120,
			h: 66,
			...endpoint,
		},
		{
			id: 'pod-b',
			label: 'Pod',
			x: 430,
			y: 430,
			w: 120,
			h: 66,
			...endpoint,
		},
		{
			id: 'pod-c',
			label: 'Pod',
			x: 560,
			y: 430,
			w: 120,
			h: 66,
			...endpoint,
		},
	],
	edges: [
		{ from: 'external', to: 'ingress' },
		{ from: 'ingress', to: 'service' },
		{ from: 'coredns', to: 'service', dashed: true },
		{ from: 'service', to: 'kube-proxy' },
		{ from: 'kube-proxy', to: 'pod-a' },
		{ from: 'kube-proxy', to: 'pod-b' },
		{ from: 'kube-proxy', to: 'pod-c' },
		{ from: 'cni', to: 'pod-a', dashed: true },
		{ from: 'cni', to: 'pod-b', dashed: true },
		{ from: 'cni', to: 'pod-c', dashed: true },
	],
};
