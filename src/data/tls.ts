import type { Diagram } from '../lib/types';

/**
 * The cluster PKI: a single CA signs every certificate, kubeconfig bundles the
 * bits a client needs, and kubectl uses it to open a mutually-authenticated
 * TLS connection to the apiserver. The CSR API issues/rotates certs.
 */
export const TLS_DIAGRAM: Diagram = {
	id: 'tls',
	title: 'Certificates / TLS & kubeconfig',
	subtitle:
		'One cluster CA signs everything. kubeconfig bundles the server URL, CA cert and your client cert; kubectl uses it for mutual-TLS to the apiserver.',
	viewBox: '0 0 980 540',
	defaultSelected: 'kubeconfig',
	groups: {
		ca: { color: '#fbbf24', label: 'Certificate Authority' },
		server: { color: '#5B8DEF', label: 'Server / infra certs' },
		node: { color: '#2dd4bf', label: 'Node certs' },
		client: { color: '#38bdf8', label: 'Client identity' },
		config: { color: '#a78bfa', label: 'kubeconfig' },
		csr: { color: '#f472b6', label: 'CSR flow' },
	},
	boxes: [],
	nodes: [
		{
			id: 'ca',
			label: 'Cluster CA',
			group: 'ca',
			x: 400,
			y: 30,
			w: 180,
			h: 64,
			tagline: 'The root of trust',
			details:
				"The cluster's Certificate Authority signs every certificate in the cluster. Components and clients trust each other because their certs chain back to this CA.",
			questions: [
				{
					q: "What signs the client cert and the apiserver's serving cert?",
					a: "The cluster CA. Clients verify the apiserver against the CA, and the apiserver verifies clients the same way — that's mutual TLS.",
				},
				{
					q: 'What if the CA private key is compromised?',
					a: "An attacker can mint trusted certs for any identity. You'd have to rotate the CA and re-issue every certificate.",
				},
			],
		},
		{
			id: 'apiserver',
			label: 'apiserver cert',
			group: 'server',
			x: 560,
			y: 160,
			w: 200,
			h: 68,
			tagline: 'TLS serving certificate',
			details:
				'The apiserver presents a serving certificate (signed by the CA) so clients can trust it, and uses its own client cert to call kubelets and etcd.',
			questions: [
				{
					q: 'How do clients trust the apiserver?',
					a: 'They verify its serving cert against the CA bundle stored in their kubeconfig.',
				},
				{
					q: 'What SANs must the apiserver cert include?',
					a: 'Every name/IP clients use — the kubernetes service IP, cluster DNS names, the load balancer, and node IPs.',
				},
			],
		},
		{
			id: 'etcd',
			label: 'etcd certs',
			group: 'server',
			x: 790,
			y: 160,
			w: 160,
			h: 68,
			tagline: 'Peer & client TLS',
			details:
				'etcd uses TLS for peer (etcd↔etcd) and client (apiserver↔etcd) connections. Only the apiserver should hold a client cert for etcd.',
			questions: [
				{
					q: 'Who is allowed to talk to etcd?',
					a: 'Only the apiserver, using a client certificate. etcd must never be exposed publicly.',
				},
				{
					q: 'Why separate peer and client certs?',
					a: 'Peer certs secure replication between members; client certs authenticate the apiserver to etcd.',
				},
			],
		},
		{
			id: 'kubelet',
			label: 'kubelet certs',
			group: 'node',
			x: 680,
			y: 300,
			w: 180,
			h: 64,
			tagline: 'Bootstrapped & auto-rotated',
			details:
				'Each kubelet has a client cert (to authenticate to the apiserver) and a serving cert (for the apiserver to call it). New nodes obtain them via TLS bootstrap + a CSR, and can auto-rotate.',
			questions: [
				{
					q: "How does a new node's kubelet get its certificate?",
					a: 'TLS bootstrapping: it uses a bootstrap token to submit a CSR, which is approved and signed by the CA.',
				},
				{
					q: 'Do kubelet certificates rotate automatically?',
					a: 'Yes — the kubelet can auto-rotate its client (and serving) certs before they expire.',
				},
			],
		},
		{
			id: 'clientcert',
			label: 'Client cert',
			group: 'client',
			x: 60,
			y: 160,
			w: 180,
			h: 68,
			tagline: 'Your identity (CN + O)',
			details:
				"A certificate whose Common Name is the username and Organization fields are the groups. It's presented to the apiserver to authenticate a human user.",
			questions: [
				{
					q: 'How does a client cert encode identity?',
					a: 'CN = username, O = group(s). RBAC then authorizes that identity.',
				},
				{
					q: 'Can you revoke a single client cert?',
					a: 'Kubernetes has no CRL, so you rotate the CA or use short-lived certs — a big reason many teams prefer OIDC tokens.',
				},
			],
		},
		{
			id: 'kubeconfig',
			label: 'kubeconfig',
			group: 'config',
			x: 60,
			y: 300,
			w: 180,
			h: 64,
			tagline: 'Bundles clusters, users, contexts',
			details:
				'kubeconfig ties together clusters (server URL + CA cert), users (client cert/key or token), and contexts that pair a user with a cluster and default namespace.',
			questions: [
				{
					q: 'What three things does a context tie together?',
					a: 'A cluster, a user, and a default namespace.',
				},
				{
					q: 'What is the CA cert in kubeconfig for?',
					a: "It lets kubectl verify the apiserver's serving cert — the client-to-server direction of trust.",
				},
			],
		},
		{
			id: 'kubectl',
			label: 'kubectl',
			group: 'client',
			x: 60,
			y: 440,
			w: 180,
			h: 60,
			tagline: 'Opens a mutual-TLS session',
			details:
				'kubectl reads the current context from kubeconfig and opens a mutually-authenticated TLS connection to the apiserver.',
			questions: [
				{
					q: 'How does kubectl choose which credentials to send?',
					a: 'From current-context in kubeconfig ($KUBECONFIG, or ~/.kube/config by default).',
				},
				{
					q: 'In mTLS, what does each side prove?',
					a: 'The server proves itself with its serving cert; the client proves itself with its client cert (or a token).',
				},
			],
		},
		{
			id: 'csr',
			label: 'CSR API',
			group: 'csr',
			x: 380,
			y: 300,
			w: 200,
			h: 64,
			tagline: 'Request → approve → sign',
			details:
				"The CertificateSigningRequest resource lets a client ask the cluster CA to sign a certificate. An approver (a controller or a human) approves it, then it's signed and retrieved.",
			questions: [
				{
					q: 'What uses the CSR flow?',
					a: 'Node/kubelet TLS bootstrapping and issuing user certificates — request, approve, then sign.',
				},
				{
					q: 'What are the CSR steps?',
					a: 'Create the CSR → approve it (kubectl certificate approve) → the signer signs → retrieve the issued cert.',
				},
			],
		},
	],
	edges: [
		{ from: 'ca', to: 'apiserver' },
		{ from: 'ca', to: 'etcd' },
		{ from: 'ca', to: 'kubelet' },
		{ from: 'ca', to: 'clientcert' },
		{ from: 'ca', to: 'csr', dashed: true },
		{ from: 'kubelet', to: 'csr', dashed: true },
		{ from: 'clientcert', to: 'kubeconfig' },
		{ from: 'ca', to: 'kubeconfig', dashed: true },
		{ from: 'kubeconfig', to: 'kubectl' },
		{ from: 'kubectl', to: 'apiserver' },
	],
};
