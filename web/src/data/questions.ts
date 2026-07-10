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
	{
		id: 'arch-5',
		topic: 'Architecture',
		difficulty: 'intermediate',
		question: 'What happens to a running cluster if etcd goes down?',
		answer: 'Existing Pods keep running (the kubelet holds their spec), but the control plane is read/write-broken: no new scheduling, no updates, no self-healing until etcd recovers.',
	},
	{
		id: 'arch-6',
		topic: 'Architecture',
		difficulty: 'advanced',
		question:
			'Why do the scheduler and controller-manager use leader election?',
		answer: 'You run multiple replicas for HA, but only one may act at a time to avoid conflicting decisions. Leader election picks a single active instance; the others stand by.',
	},
	{
		id: 'pod-7',
		topic: 'Pods & Workloads',
		difficulty: 'intermediate',
		question: 'Job vs CronJob — when do you use each?',
		answer: 'A Job runs a Pod to completion once (batch task). A CronJob creates Jobs on a schedule (like cron), e.g. nightly backups.',
	},
	{
		id: 'pod-8',
		topic: 'Pods & Workloads',
		difficulty: 'advanced',
		question: 'How does the Horizontal Pod Autoscaler decide to scale?',
		answer: 'It reads metrics (CPU/memory via metrics-server, or custom metrics) and adjusts the replica count of a Deployment/StatefulSet to hit the target utilization.',
	},
	{
		id: 'pod-9',
		topic: 'Pods & Workloads',
		difficulty: 'advanced',
		question: 'What are the three Pod QoS classes?',
		answer: 'Guaranteed (every container has requests == limits), Burstable (some requests set), and BestEffort (no requests/limits). BestEffort Pods are evicted first under pressure.',
	},
	{
		id: 'pod-10',
		topic: 'Pods & Workloads',
		difficulty: 'basic',
		question: 'What is a static Pod?',
		answer: 'A Pod the kubelet runs directly from a local manifest file (e.g. /etc/kubernetes/manifests), not via the apiserver. This is how kubeadm runs the control-plane components.',
	},
	{
		id: 'net-7',
		topic: 'Services & Networking',
		difficulty: 'intermediate',
		question: 'What is a headless Service (clusterIP: None)?',
		answer: 'A Service with no virtual IP — DNS returns the individual Pod IPs instead of load-balancing. Used with StatefulSets so clients can address specific Pods.',
	},
	{
		id: 'net-8',
		topic: 'Services & Networking',
		difficulty: 'advanced',
		question: 'What does a Service of type ExternalName do?',
		answer: 'It maps a cluster DNS name to an external DNS name via a CNAME, with no proxying or selector — handy for pointing at an out-of-cluster database.',
	},
	{
		id: 'sched-5',
		topic: 'Scheduling',
		difficulty: 'advanced',
		question: 'What does a PodDisruptionBudget protect against?',
		answer: 'Voluntary disruptions (like node drains). A PDB sets minAvailable/maxUnavailable so drains block rather than take too many replicas down at once.',
	},
	{
		id: 'sched-6',
		topic: 'Scheduling',
		difficulty: 'advanced',
		question: 'What are topologySpreadConstraints for?',
		answer: 'Evenly spreading Pods across failure domains (zones, nodes) using maxSkew, so a single zone/node failure does not take out most replicas.',
	},
	{
		id: 'cfg-5',
		topic: 'Config & Storage',
		difficulty: 'intermediate',
		question: 'What is the Downward API?',
		answer: 'A way to expose Pod/container metadata (name, namespace, labels, resource limits, Pod IP) to the container via env vars or a mounted volume.',
	},
	{
		id: 'cfg-6',
		topic: 'Config & Storage',
		difficulty: 'advanced',
		question: 'How does a StatefulSet give each Pod its own storage?',
		answer: 'Through volumeClaimTemplates: the controller creates one PVC per Pod (e.g. data-web-0) and always reattaches that same PVC to that Pod ordinal.',
	},
	{
		id: 'cfg-7',
		topic: 'Config & Storage',
		difficulty: 'basic',
		question: 'What are the ways a Pod can consume a ConfigMap?',
		answer: 'As environment variables, as command-line args, or mounted as files in a volume. Volume mounts can update live; env vars are set only at start.',
	},
	{
		id: 'sec-5',
		topic: 'Security',
		difficulty: 'basic',
		question: 'Authentication vs authorization in Kubernetes?',
		answer: 'AuthN proves who you are (certs, tokens, OIDC). AuthZ decides what you may do (RBAC). Both run in the apiserver before admission.',
	},
	{
		id: 'sec-6',
		topic: 'Security',
		difficulty: 'advanced',
		question: 'What are admission controllers?',
		answer: 'Plugins that intercept a request after authZ and before it is persisted. Mutating ones can change objects (e.g. inject sidecars); validating ones can reject them.',
	},
	{
		id: 'sec-7',
		topic: 'Security',
		difficulty: 'intermediate',
		question: 'What replaced PodSecurityPolicy?',
		answer: 'Pod Security Admission — a built-in admission controller that enforces the Privileged / Baseline / Restricted standards per namespace via labels.',
	},
	{
		id: 'maint-4',
		topic: 'Maintenance',
		difficulty: 'intermediate',
		question: 'How do you inspect and control a rollout?',
		answer: '`kubectl rollout status` to watch it, `kubectl rollout pause/resume` to gate it, and `kubectl rollout undo` to roll back to the previous revision.',
	},
	{
		id: 'ops-1',
		topic: 'Troubleshooting',
		difficulty: 'basic',
		question: 'Liveness vs readiness vs startup probes?',
		answer: 'Liveness restarts a hung container; readiness gates whether the Pod receives traffic; startup gives slow-booting apps time before liveness kicks in.',
	},
	{
		id: 'ops-2',
		topic: 'Troubleshooting',
		difficulty: 'intermediate',
		question: 'How do you debug a CrashLoopBackOff?',
		answer: 'Check `kubectl logs <pod> --previous` for the crash, and `kubectl describe pod` Events. Common causes: bad command, missing config/secret, failing liveness probe.',
	},
	{
		id: 'ops-3',
		topic: 'Troubleshooting',
		difficulty: 'intermediate',
		question: 'A Pod is stuck in Pending — how do you find out why?',
		answer: 'Run `kubectl describe pod` and read the Events. Usual reasons: insufficient CPU/memory, an unschedulable taint, or an unbound PVC.',
	},
	{
		id: 'ops-4',
		topic: 'Troubleshooting',
		difficulty: 'basic',
		question:
			'Where do you see why the scheduler or kubelet rejected a Pod?',
		answer: 'In the object Events — `kubectl describe pod <name>` (or `kubectl get events`). Events explain scheduling failures, image pulls, and probe failures.',
	},
	{
		id: 'ops-5',
		topic: 'Troubleshooting',
		difficulty: 'basic',
		question: 'How do you check live CPU/memory usage of Pods and nodes?',
		answer: '`kubectl top pods` and `kubectl top nodes` — these need the metrics-server addon installed.',
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
	{
		id: 'q19',
		topic: 'Pods & Workloads',
		question: 'Which object runs a Pod to completion on a schedule?',
		options: ['Job', 'CronJob', 'DaemonSet', 'Deployment'],
		correct: 1,
		explanation:
			'A CronJob creates Jobs on a cron schedule; a plain Job runs once to completion.',
	},
	{
		id: 'q20',
		topic: 'Pods & Workloads',
		question: 'A Pod gets QoS class Guaranteed only when…',
		options: [
			'It sets no requests or limits',
			'Every container has requests equal to limits',
			'It has a priorityClass',
			'It runs on the control plane',
		],
		correct: 1,
		explanation:
			'Guaranteed requires every container to set requests == limits for CPU and memory.',
	},
	{
		id: 'q21',
		topic: 'Pods & Workloads',
		question:
			'The Horizontal Pod Autoscaler needs which addon to read CPU/memory?',
		options: [
			'CoreDNS',
			'metrics-server',
			'kube-proxy',
			'Ingress controller',
		],
		correct: 1,
		explanation:
			'metrics-server supplies the resource metrics the HPA uses to scale.',
	},
	{
		id: 'q22',
		topic: 'Services & Networking',
		question: 'Setting `clusterIP: None` on a Service makes DNS return…',
		options: [
			'A single virtual IP',
			'The individual Pod IPs',
			'The node IPs',
			'An external CNAME',
		],
		correct: 1,
		explanation:
			'That is a headless Service — DNS returns each Pod IP instead of a load-balanced VIP.',
	},
	{
		id: 'q23',
		topic: 'Services & Networking',
		question:
			'Which Service type just maps to an external DNS name via CNAME?',
		options: ['NodePort', 'ClusterIP', 'ExternalName', 'LoadBalancer'],
		correct: 2,
		explanation:
			'ExternalName returns a CNAME to an external host — no proxying or selector.',
	},
	{
		id: 'q24',
		topic: 'Scheduling',
		question: 'A PodDisruptionBudget protects your app during…',
		options: [
			'Node hardware failure',
			'Voluntary disruptions like drains',
			'Image pull errors',
			'DNS outages',
		],
		correct: 1,
		explanation:
			'A PDB limits how many replicas voluntary operations (e.g. kubectl drain) may take down at once.',
	},
	{
		id: 'q25',
		topic: 'Scheduling',
		question: 'Which field spreads Pods evenly across zones or nodes?',
		options: [
			'nodeSelector',
			'topologySpreadConstraints',
			'resources.limits',
			'restartPolicy',
		],
		correct: 1,
		explanation:
			'topologySpreadConstraints use maxSkew to balance Pods across failure domains.',
	},
	{
		id: 'q26',
		topic: 'Config & Storage',
		question: 'volumeClaimTemplates are a feature of which workload?',
		options: ['Deployment', 'DaemonSet', 'StatefulSet', 'Job'],
		correct: 2,
		explanation:
			'StatefulSets create one PVC per Pod via volumeClaimTemplates, giving stable per-Pod storage.',
	},
	{
		id: 'q27',
		topic: 'Config & Storage',
		question: 'Which lets a container read its own labels and Pod IP?',
		options: ['Downward API', 'ConfigMap', 'StorageClass', 'CSI'],
		correct: 0,
		explanation:
			'The Downward API exposes Pod/container metadata via env vars or a mounted volume.',
	},
	{
		id: 'q28',
		topic: 'Security',
		question: 'Admission controllers run…',
		options: [
			'Before authentication',
			'After authZ, before the object is stored',
			'Only on deletes',
			'Inside the kubelet',
		],
		correct: 1,
		explanation:
			'Admission runs after authN/authZ and before persistence; mutating then validating.',
	},
	{
		id: 'q29',
		topic: 'Security',
		question: 'What is the built-in replacement for PodSecurityPolicy?',
		options: [
			'Network Policies',
			'Pod Security Admission',
			'RBAC',
			'Seccomp',
		],
		correct: 1,
		explanation:
			'Pod Security Admission enforces Privileged/Baseline/Restricted standards per namespace.',
	},
	{
		id: 'q30',
		topic: 'Troubleshooting',
		question: 'Which probe determines if a Pod should receive traffic?',
		options: ['Liveness', 'Readiness', 'Startup', 'Health'],
		correct: 1,
		explanation:
			'Readiness gates traffic; liveness restarts the container; startup delays liveness for slow starters.',
	},
	{
		id: 'q31',
		topic: 'Troubleshooting',
		question: 'First command to debug a CrashLoopBackOff container?',
		options: [
			'kubectl scale',
			'kubectl logs <pod> --previous',
			'kubectl delete pod',
			'kubectl cordon',
		],
		correct: 1,
		explanation:
			'Read the previous container logs to see why it crashed, then check describe Events.',
	},
	{
		id: 'q32',
		topic: 'Troubleshooting',
		question: 'A Pod is Pending. Where do you look first?',
		options: [
			'kubectl top',
			'kubectl describe pod (Events)',
			'kubectl rollout status',
			'kubectl proxy',
		],
		correct: 1,
		explanation:
			'The Events in describe explain scheduling failures — no resources, taints, or unbound PVCs.',
	},
];

export const QUIZ_TOPICS = Array.from(
	new Set(QUIZ_QUESTIONS.map(q => q.topic)),
);
export const INTERVIEW_TOPICS = Array.from(
	new Set(INTERVIEW_QUESTIONS.map(q => q.topic)),
);
