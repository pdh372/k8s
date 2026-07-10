import type { InterviewQuestion, QuizQuestion } from '../lib/types';

/** Flashcard-style interview questions grouped by topic. */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
	// Architecture
	{
		id: 'arch-1',
		topic: 'Architecture',
		difficulty: 'basic',
		question:
			'What are the main components of the Kubernetes control plane?',
		answer: 'kube-apiserver (the front door), etcd (state store), kube-scheduler (places Pods), kube-controller-manager (reconciliation loops), and optionally the cloud-controller-manager.',
	},
	{
		id: 'arch-2',
		topic: 'Architecture',
		difficulty: 'basic',
		question: 'Which component is the only one that talks to etcd?',
		answer: 'The kube-apiserver. Every read/write of cluster state goes through it, which keeps etcd access centralized and secured.',
	},
	{
		id: 'arch-3',
		topic: 'Architecture',
		difficulty: 'intermediate',
		question:
			'Walk me through what happens when you run `kubectl run nginx`.',
		answer: 'kubectl sends a create-Pod request to the apiserver → authN/authZ/admission → the Pod is stored in etcd → the scheduler assigns a node → the kubelet on that node tells the container runtime to pull the image and start the container → status is reported back to the apiserver.',
	},
	{
		id: 'arch-4',
		topic: 'Architecture',
		difficulty: 'intermediate',
		question: 'What runs on a worker node?',
		answer: 'The kubelet (node agent), kube-proxy (Service networking), and a CRI container runtime such as containerd — plus the actual application Pods.',
	},
	// Pods & workloads
	{
		id: 'pod-1',
		topic: 'Pods & Workloads',
		difficulty: 'basic',
		question: 'What is a Pod and why not schedule containers directly?',
		answer: 'A Pod is the smallest deployable unit — one or more containers sharing an IP and volumes, always co-located. Kubernetes schedules Pods (not containers) so tightly-coupled helpers like sidecars run together.',
	},
	{
		id: 'pod-2',
		topic: 'Pods & Workloads',
		difficulty: 'basic',
		question: 'Difference between a ReplicaSet and a Deployment?',
		answer: 'A ReplicaSet keeps N identical Pods running. A Deployment manages ReplicaSets to add rolling updates, rollbacks and revision history — you almost always use a Deployment.',
	},
	{
		id: 'pod-3',
		topic: 'Pods & Workloads',
		difficulty: 'intermediate',
		question: 'How does a rolling update work and how do you roll back?',
		answer: 'A Deployment creates a new ReplicaSet and gradually shifts replicas (respecting maxSurge/maxUnavailable) from old to new. Roll back with `kubectl rollout undo deployment/<name>`.',
	},
	{
		id: 'pod-4',
		topic: 'Pods & Workloads',
		difficulty: 'intermediate',
		question: 'What is a DaemonSet used for?',
		answer: 'To run exactly one Pod per node (or per matching node) — ideal for node-level agents like log shippers, monitoring agents, and CNI plugins.',
	},
	{
		id: 'pod-5',
		topic: 'Pods & Workloads',
		difficulty: 'advanced',
		question: 'StatefulSet vs Deployment — when do you need a StatefulSet?',
		answer: 'When Pods need stable network identities and stable per-Pod storage (e.g. databases). StatefulSets give ordered, predictable Pod names (pod-0, pod-1) and stick each Pod to its own PVC.',
	},
	{
		id: 'pod-6',
		topic: 'Pods & Workloads',
		difficulty: 'intermediate',
		question:
			"What's the difference between an init container and a sidecar?",
		answer: 'Init containers run to completion, in order, before app containers start (setup/wait tasks). A sidecar runs alongside the main container for its whole lifetime (proxy, log shipper).',
	},
	// Services & networking
	{
		id: 'net-1',
		topic: 'Services & Networking',
		difficulty: 'basic',
		question: 'Why do we need Services if Pods already have IPs?',
		answer: 'Pod IPs are ephemeral and change on every restart. A Service gives a stable virtual IP + DNS name and load-balances across the current set of Pods selected by label.',
	},
	{
		id: 'net-2',
		topic: 'Services & Networking',
		difficulty: 'basic',
		question: 'Compare ClusterIP, NodePort and LoadBalancer.',
		answer: 'ClusterIP is internal-only (default). NodePort opens a port on every node for external access. LoadBalancer provisions an external cloud load balancer that fronts the Service.',
	},
	{
		id: 'net-3',
		topic: 'Services & Networking',
		difficulty: 'intermediate',
		question: 'How does a Service know which Pods to send traffic to?',
		answer: 'Via its label selector. Kubernetes maintains an Endpoints/EndpointSlice object listing the IPs of matching, ready Pods, and kube-proxy routes to those IPs.',
	},
	{
		id: 'net-4',
		topic: 'Services & Networking',
		difficulty: 'intermediate',
		question: 'What is Ingress and how is it different from a Service?',
		answer: 'Ingress is L7 HTTP(S) routing (host/path rules, TLS termination) handled by an Ingress controller. A Service is L3/L4. Ingress lets many sites share one external entry point.',
	},
	{
		id: 'net-5',
		topic: 'Services & Networking',
		difficulty: 'advanced',
		question: "What is the Kubernetes network model's core requirement?",
		answer: 'Every Pod gets its own IP and every Pod can reach every other Pod without NAT. A CNI plugin (Calico, Flannel, Cilium) implements this flat network.',
	},
	{
		id: 'net-6',
		topic: 'Services & Networking',
		difficulty: 'intermediate',
		question: 'What does CoreDNS do in a cluster?',
		answer: "It's the cluster DNS server. It resolves Service names like my-svc.my-ns.svc.cluster.local to ClusterIPs so Pods can find each other by name.",
	},
	// Scheduling
	{
		id: 'sched-1',
		topic: 'Scheduling',
		difficulty: 'intermediate',
		question: 'Explain taints and tolerations.',
		answer: "A taint on a node repels Pods that don't tolerate it (e.g. NoSchedule). A matching toleration on a Pod lets it be placed there. Used to reserve nodes for specific workloads.",
	},
	{
		id: 'sched-2',
		topic: 'Scheduling',
		difficulty: 'intermediate',
		question:
			'Difference between nodeSelector, node affinity and pod affinity?',
		answer: 'nodeSelector is a simple label match. Node affinity adds soft/hard rules and operators. Pod affinity/anti-affinity schedules Pods relative to other Pods (co-locate or spread apart).',
	},
	{
		id: 'sched-3',
		topic: 'Scheduling',
		difficulty: 'basic',
		question: "What's the difference between resource requests and limits?",
		answer: 'Requests are what the scheduler reserves to place the Pod. Limits are the hard ceiling enforced at runtime — exceeding a memory limit gets the container OOMKilled; CPU is throttled.',
	},
	{
		id: 'sched-4',
		topic: 'Scheduling',
		difficulty: 'advanced',
		question: 'How does the scheduler pick a node?',
		answer: "Two phases: filtering (predicates remove nodes that can't fit — resources, taints, affinity) then scoring (priorities rank the rest). The highest-scoring node wins.",
	},
	// Config & storage
	{
		id: 'cfg-1',
		topic: 'Config & Storage',
		difficulty: 'basic',
		question: "ConfigMap vs Secret — what's the real difference?",
		answer: 'Both inject configuration. Secrets are meant for sensitive data: base64-encoded, can be encrypted at rest, and access is restricted. ConfigMaps are for plain, non-sensitive config.',
	},
	{
		id: 'cfg-2',
		topic: 'Config & Storage',
		difficulty: 'intermediate',
		question: 'Explain PV, PVC and StorageClass.',
		answer: "A PersistentVolume is a piece of storage. A PersistentVolumeClaim is a user's request for storage. A StorageClass enables dynamic provisioning — a matching PV is created automatically for the claim.",
	},
	{
		id: 'cfg-3',
		topic: 'Config & Storage',
		difficulty: 'intermediate',
		question: 'What are the common access modes for a PV?',
		answer: 'ReadWriteOnce (one node r/w), ReadOnlyMany (many nodes read), ReadWriteMany (many nodes r/w), and ReadWriteOncePod (a single Pod r/w).',
	},
	{
		id: 'cfg-4',
		topic: 'Config & Storage',
		difficulty: 'advanced',
		question: 'Are Secrets encrypted by default?',
		answer: "No — by default they're only base64-encoded in etcd. You must enable EncryptionConfiguration (or an external KMS provider) for encryption at rest.",
	},
	// Security
	{
		id: 'sec-1',
		topic: 'Security',
		difficulty: 'intermediate',
		question: 'Explain RBAC: Role vs ClusterRole.',
		answer: 'A Role grants permissions within a single namespace; a ClusterRole is cluster-wide (or for cluster-scoped resources). A RoleBinding/ClusterRoleBinding attaches it to a user, group, or ServiceAccount.',
	},
	{
		id: 'sec-2',
		topic: 'Security',
		difficulty: 'intermediate',
		question:
			'How do applications authenticate to the API from inside a Pod?',
		answer: 'Via a ServiceAccount. Its token is projected into the Pod, and RBAC bindings on that ServiceAccount decide what it can do.',
	},
	{
		id: 'sec-3',
		topic: 'Security',
		difficulty: 'advanced',
		question:
			"What does a NetworkPolicy do and what's the default behavior?",
		answer: 'It restricts Pod-to-Pod traffic by label selectors. By default all traffic is allowed; once a Pod is selected by any policy, only explicitly allowed traffic gets through (default-deny for that direction).',
	},
	{
		id: 'sec-4',
		topic: 'Security',
		difficulty: 'advanced',
		question: 'How would you restrict a container from running as root?',
		answer: 'Use a securityContext with runAsNonRoot: true, a non-zero runAsUser, drop Linux capabilities, and set readOnlyRootFilesystem — often enforced cluster-wide with Pod Security Admission.',
	},
	// Maintenance
	{
		id: 'maint-1',
		topic: 'Maintenance',
		difficulty: 'intermediate',
		question: 'How do you safely take a node down for maintenance?',
		answer: '`kubectl cordon` to stop new Pods, then `kubectl drain` to evict existing Pods gracefully. After maintenance, `kubectl uncordon` to make it schedulable again.',
	},
	{
		id: 'maint-2',
		topic: 'Maintenance',
		difficulty: 'advanced',
		question: "What's the recommended order to upgrade a cluster?",
		answer: 'Upgrade the control plane first (apiserver, then controller-manager/scheduler), then the kubelets on worker nodes, one at a time after draining. Never let the kubelet get ahead of the apiserver version.',
	},
	{
		id: 'maint-3',
		topic: 'Maintenance',
		difficulty: 'intermediate',
		question: 'Why is etcd backup so important and how often?',
		answer: "etcd holds all cluster state; without a snapshot you can't recover a lost cluster. Take regular scheduled snapshots and test the restore procedure.",
	},
];

/** Multiple-choice questions for the quiz mode. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
	{
		id: 'q1',
		topic: 'Architecture',
		question:
			'Which component is the only one that reads from and writes to etcd?',
		options: ['kube-scheduler', 'kube-apiserver', 'kubelet', 'kube-proxy'],
		correct: 1,
		explanation:
			'All state access is funneled through the kube-apiserver, which is the sole client of etcd.',
	},
	{
		id: 'q2',
		topic: 'Architecture',
		question: 'What is the job of the kube-scheduler?',
		options: [
			'Start containers on the node',
			'Store cluster state',
			'Assign Pods to suitable nodes',
			'Load-balance Service traffic',
		],
		correct: 2,
		explanation:
			'The scheduler only decides placement (sets spec.nodeName). The kubelet actually runs the Pod.',
	},
	{
		id: 'q3',
		topic: 'Pods & Workloads',
		question:
			'Which object should you use to run a self-healing, scalable stateless app?',
		options: ['Pod', 'Deployment', 'Job', 'StaticPod'],
		correct: 1,
		explanation:
			'A Deployment manages ReplicaSets to provide self-healing, scaling, rolling updates and rollbacks.',
	},
	{
		id: 'q4',
		topic: 'Pods & Workloads',
		question: 'A DaemonSet ensures that…',
		options: [
			'A fixed number of replicas run cluster-wide',
			'One Pod runs on each (matching) node',
			'A Pod runs once to completion',
			'Pods run in a strict order',
		],
		correct: 1,
		explanation:
			'DaemonSets place one Pod per node — perfect for log/monitoring agents and CNI plugins.',
	},
	{
		id: 'q5',
		topic: 'Services & Networking',
		question:
			'Which Service type is reachable ONLY from inside the cluster?',
		options: ['NodePort', 'LoadBalancer', 'ClusterIP', 'ExternalName'],
		correct: 2,
		explanation:
			'ClusterIP (the default) exposes the Service on an internal virtual IP only.',
	},
	{
		id: 'q6',
		topic: 'Services & Networking',
		question:
			'Which component programs the iptables/IPVS rules for Services?',
		options: ['CoreDNS', 'kube-proxy', 'kubelet', 'kube-scheduler'],
		correct: 1,
		explanation:
			'kube-proxy on each node maintains the rules that route ClusterIP traffic to Pod endpoints.',
	},
	{
		id: 'q7',
		topic: 'Services & Networking',
		question: 'What resolves a Service DNS name to its ClusterIP?',
		options: ['kube-proxy', 'etcd', 'CoreDNS', 'Ingress controller'],
		correct: 2,
		explanation:
			'CoreDNS is the cluster DNS server that resolves Service and Pod names.',
	},
	{
		id: 'q8',
		topic: 'Services & Networking',
		question: 'Ingress primarily operates at which layer?',
		options: [
			'L2 (Ethernet)',
			'L3 (IP)',
			'L4 (TCP/UDP)',
			'L7 (HTTP/HTTPS)',
		],
		correct: 3,
		explanation:
			'Ingress does L7 routing — host/path rules and TLS termination — via an Ingress controller.',
	},
	{
		id: 'q9',
		topic: 'Scheduling',
		question:
			'A Pod without a matching toleration cannot be scheduled onto a node that has…',
		options: [
			'A label',
			'A taint with effect NoSchedule',
			'A nodeSelector',
			'An annotation',
		],
		correct: 1,
		explanation:
			'Taints repel Pods unless the Pod carries a matching toleration.',
	},
	{
		id: 'q10',
		topic: 'Scheduling',
		question: 'If a container exceeds its memory limit, Kubernetes will…',
		options: [
			'Throttle its CPU',
			'OOMKill the container',
			'Evict every Pod on the node',
			'Ignore it',
		],
		correct: 1,
		explanation:
			'Exceeding a memory limit triggers an OOMKill. CPU over-limit is throttled instead.',
	},
	{
		id: 'q11',
		topic: 'Config & Storage',
		question: 'By default, data in a Kubernetes Secret is…',
		options: [
			'Encrypted with AES',
			'Only base64-encoded in etcd',
			'Stored in plaintext files on every node',
			'Hashed',
		],
		correct: 1,
		explanation:
			'Secrets are base64-encoded by default; enable encryption at rest for real protection.',
	},
	{
		id: 'q12',
		topic: 'Config & Storage',
		question: 'What enables dynamic provisioning of PersistentVolumes?',
		options: ['A PVC', 'A StorageClass', 'A ConfigMap', 'A DaemonSet'],
		correct: 1,
		explanation:
			'A StorageClass tells the provisioner how to create a PV automatically for a claim.',
	},
	{
		id: 'q13',
		topic: 'Config & Storage',
		question:
			'Which access mode allows a single Pod exclusive read/write access?',
		options: [
			'ReadWriteMany',
			'ReadOnlyMany',
			'ReadWriteOncePod',
			'ReadWriteShared',
		],
		correct: 2,
		explanation:
			'ReadWriteOncePod restricts read/write access to exactly one Pod.',
	},
	{
		id: 'q14',
		topic: 'Security',
		question: 'A Role (as opposed to a ClusterRole) grants permissions…',
		options: [
			'Cluster-wide',
			'Within a single namespace',
			'Only to the kube-system namespace',
			'To nodes only',
		],
		correct: 1,
		explanation:
			'A Role is namespaced; a ClusterRole applies cluster-wide.',
	},
	{
		id: 'q15',
		topic: 'Security',
		question: 'How does an in-cluster app get an identity to call the API?',
		options: [
			'Its Pod IP',
			'A ServiceAccount token',
			"The node's kubelet cert",
			'An SSH key',
		],
		correct: 1,
		explanation:
			'Pods authenticate as their ServiceAccount, whose token is projected into the Pod.',
	},
	{
		id: 'q16',
		topic: 'Security',
		question: 'Once a Pod is selected by a NetworkPolicy, traffic is…',
		options: [
			'Still fully open',
			'Denied unless explicitly allowed',
			'Routed through Ingress',
			'Encrypted automatically',
		],
		correct: 1,
		explanation:
			'Selecting a Pod flips it to default-deny for that direction; only allowed traffic passes.',
	},
	{
		id: 'q17',
		topic: 'Maintenance',
		question: 'Which command safely evicts Pods before node maintenance?',
		options: [
			'kubectl delete node',
			'kubectl drain',
			'kubectl taint',
			'kubectl cordon',
		],
		correct: 1,
		explanation:
			'`kubectl drain` evicts Pods gracefully (cordon only stops new scheduling).',
	},
	{
		id: 'q18',
		topic: 'Maintenance',
		question: 'In a cluster upgrade, you should upgrade… first.',
		options: [
			'Worker kubelets',
			'The control plane',
			'kube-proxy',
			'The CNI plugin',
		],
		correct: 1,
		explanation:
			'Upgrade the control plane before the worker nodes; kubelets must not run ahead of the apiserver.',
	},
];

export const QUIZ_TOPICS = Array.from(
	new Set(QUIZ_QUESTIONS.map(q => q.topic)),
);
export const INTERVIEW_TOPICS = Array.from(
	new Set(INTERVIEW_QUESTIONS.map(q => q.topic)),
);
