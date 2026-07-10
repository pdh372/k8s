import type { Diagram, DiagramNode } from '../lib/types';

// The three backend Pods share one concept (Service endpoints).
const backend: Omit<DiagramNode, 'id' | 'label' | 'x' | 'y' | 'w' | 'h'> = {
	group: 'workload',
	tagline: 'A backend Pod',
	details:
		'The actual application Pods that receive the load-balanced traffic. Only Pods that pass their readiness probe appear in the EndpointSlice and get traffic.',
	questions: [
		{
			q: 'Why might a healthy-looking Pod receive no traffic?',
			a: "If it isn't Ready (readiness probe failing), it's removed from the EndpointSlice, so the Service won't route to it.",
		},
		{
			q: 'How is load spread across the backend Pods?',
			a: 'kube-proxy picks an endpoint per new connection (random/round-robin depending on iptables vs IPVS mode).',
		},
	],
};

/** A detailed look at how external traffic reaches Pods through the exposure types. */
export const TRAFFIC_DIAGRAM: Diagram = {
	id: 'traffic',
	title: 'Ingress / Service Traffic',
	subtitle:
		'The detailed path in: LoadBalancer, NodePort, or Ingress → a ClusterIP Service → kube-proxy resolves the EndpointSlice → a backend Pod.',
	viewBox: '0 0 980 560',
	defaultSelected: 'ingress',
	groups: {
		client: { color: '#38bdf8', label: 'Client' },
		l4: { color: '#a78bfa', label: 'L4 exposure' },
		l7: { color: '#f472b6', label: 'L7 Ingress' },
		service: { color: '#5B8DEF', label: 'Service' },
		proxy: { color: '#2dd4bf', label: 'Data plane' },
		workload: { color: '#34d399', label: 'Backends' },
	},
	boxes: [
		{
			x: 270,
			y: 395,
			w: 440,
			h: 120,
			label: 'Service backends — ready Pods',
			variant: 'dashed',
			labelAlign: 'center',
		},
	],
	nodes: [
		{
			id: 'client',
			label: 'External client',
			group: 'client',
			x: 390,
			y: 20,
			w: 200,
			h: 50,
			tagline: 'A caller outside the cluster',
			details:
				'A browser or API client outside the cluster. It reaches your app through one of the exposure methods — a NodePort, a LoadBalancer, or (most often for HTTP) an Ingress.',
			questions: [
				{
					q: 'What are the ways to expose an app externally?',
					a: 'NodePort, LoadBalancer, or an Ingress (L7) sitting in front of a ClusterIP Service.',
				},
				{
					q: 'Which is most cost-effective on a cloud?',
					a: 'One Ingress behind a single load balancer can front many apps, versus one cloud LB per LoadBalancer Service.',
				},
			],
		},
		{
			id: 'loadbalancer',
			label: 'LoadBalancer',
			group: 'l4',
			x: 70,
			y: 120,
			w: 180,
			h: 60,
			tagline: 'External cloud LB (L4)',
			details:
				'type=LoadBalancer asks the cloud-controller-manager to provision an external L4 load balancer. It targets a NodePort on each node, which forwards to the Service.',
			questions: [
				{
					q: 'What does type=LoadBalancer actually create?',
					a: 'A cloud load balancer plus an implicit NodePort; the LB forwards to those node ports.',
				},
				{
					q: 'Downside of many LoadBalancer Services?',
					a: 'Each provisions its own cloud LB (cost + a public IP). Ingress consolidates many apps behind one.',
				},
			],
		},
		{
			id: 'nodeport',
			label: 'NodePort',
			group: 'l4',
			x: 300,
			y: 120,
			w: 180,
			h: 60,
			tagline: 'A port on every node',
			details:
				'Opens the same port (30000–32767) on every node. Traffic to <nodeIP>:<nodePort> is forwarded by kube-proxy to the Service and on to a backend Pod.',
			questions: [
				{
					q: 'What is the default NodePort range?',
					a: '30000–32767, one port per Service, opened on all nodes.',
				},
				{
					q: 'How does traffic reach a Pod on another node?',
					a: 'kube-proxy forwards it — possibly an extra hop — unless externalTrafficPolicy=Local keeps it on the receiving node.',
				},
			],
		},
		{
			id: 'ingress',
			label: 'Ingress',
			group: 'l7',
			x: 530,
			y: 120,
			w: 200,
			h: 60,
			tagline: 'L7 HTTP router',
			details:
				'An Ingress controller (nginx, Traefik) reads Ingress rules and routes by host/path, terminates TLS, then forwards to backend ClusterIP Services. The controller Pod is itself exposed via a LoadBalancer/NodePort.',
			questions: [
				{
					q: 'Ingress resource vs Ingress controller?',
					a: 'The resource is just routing rules; the controller is the running proxy that implements them.',
				},
				{
					q: 'How does one Ingress serve many sites?',
					a: 'Host/path rules map each to a different backend Service, with TLS from referenced Secrets.',
				},
			],
		},
		{
			id: 'service',
			label: 'Service (ClusterIP)',
			group: 'service',
			x: 350,
			y: 250,
			w: 200,
			h: 66,
			tagline: 'The stable virtual IP',
			details:
				"The ClusterIP the entry points target. It has no proxy process of its own — it's a virtual IP that kube-proxy's kernel rules translate to a real Pod IP from the EndpointSlice.",
			questions: [
				{
					q: "Which object lists a Service's backend Pod IPs?",
					a: 'The EndpointSlice (formerly Endpoints), kept in sync with ready Pods matching the selector.',
				},
				{
					q: "Does traffic really flow 'through' the ClusterIP?",
					a: 'No process sits there — kube-proxy DNATs the ClusterIP to a Pod IP in the kernel.',
				},
			],
		},
		{
			id: 'endpointslice',
			label: 'EndpointSlice',
			group: 'service',
			x: 90,
			y: 250,
			w: 180,
			h: 66,
			tagline: 'The list of ready endpoints',
			details:
				'The auto-maintained list of ready Pod IPs and ports behind a Service. EndpointSlices shard endpoints across objects so large Services scale better than the old single Endpoints object.',
			questions: [
				{
					q: 'Why EndpointSlices instead of Endpoints?',
					a: 'They split endpoints across multiple objects, cutting update churn and load at large scale.',
				},
				{
					q: 'When is a Pod added to the slice?',
					a: 'When it matches the selector and passes readiness; unready Pods are excluded.',
				},
			],
		},
		{
			id: 'kube-proxy',
			label: 'kube-proxy',
			group: 'proxy',
			x: 650,
			y: 250,
			w: 180,
			h: 66,
			tagline: 'Programs the forwarding rules',
			details:
				"On every node, kube-proxy programs iptables or IPVS rules so a packet to the ClusterIP is DNAT'd to one of the EndpointSlice's Pod IPs.",
			questions: [
				{
					q: 'iptables vs IPVS mode?',
					a: 'iptables is the default; IPVS scales to many Services better using a hash table for lookups.',
				},
				{
					q: 'What does externalTrafficPolicy=Local do?',
					a: 'Preserves the client source IP and avoids an extra hop by only routing to Pods on the node that received the traffic.',
				},
			],
		},
		{
			id: 'pod-a',
			label: 'Pod',
			x: 300,
			y: 420,
			w: 120,
			h: 64,
			...backend,
		},
		{
			id: 'pod-b',
			label: 'Pod',
			x: 440,
			y: 420,
			w: 120,
			h: 64,
			...backend,
		},
		{
			id: 'pod-c',
			label: 'Pod',
			x: 580,
			y: 420,
			w: 120,
			h: 64,
			...backend,
		},
	],
	edges: [
		{ from: 'client', to: 'loadbalancer' },
		{ from: 'client', to: 'nodeport' },
		{ from: 'client', to: 'ingress' },
		{ from: 'loadbalancer', to: 'service' },
		{ from: 'nodeport', to: 'service' },
		{ from: 'ingress', to: 'service' },
		{ from: 'service', to: 'endpointslice', dashed: true },
		{ from: 'service', to: 'kube-proxy', dashed: true },
		{ from: 'kube-proxy', to: 'pod-a' },
		{ from: 'kube-proxy', to: 'pod-b' },
		{ from: 'kube-proxy', to: 'pod-c' },
	],
};
