import type { InterviewQuestion, QuizQuestion } from '../lib/types';

/** Flashcard-style interview questions grouped by topic. */
export const GCP_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
	// Compute
	{
		id: 'gcp-compute-1',
		topic: 'Compute',
		difficulty: 'basic',
		question: 'What is the difference between a Compute Engine machine family and a machine type?',
		answer: 'Family is the broad category (E2 general-purpose, C2 compute-optimized, M2 memory-optimized, A2 accelerator-optimized); machine type is a specific vCPU/RAM combo within that family, e.g. e2-medium.',
	},
	{
		id: 'gcp-compute-2',
		topic: 'Compute',
		difficulty: 'intermediate',
		question: 'When would you choose a Spot VM over a standard on-demand VM?',
		answer: 'For fault-tolerant, interruptible workloads (batch jobs, CI runners) — Spot VMs are up to ~91% cheaper but Google can reclaim them with short notice, so they\'re unsuitable for anything needing guaranteed uptime.',
	},
	{
		id: 'gcp-compute-3',
		topic: 'Compute',
		difficulty: 'basic',
		question: 'What is the least-operational-overhead way to run Kubernetes on GCP?',
		answer: 'GKE Autopilot — no Node Pools to manage, billed per Pod resource request instead of per Node.',
	},
	// Storage
	{
		id: 'gcp-storage-1',
		topic: 'Storage',
		difficulty: 'basic',
		question: 'What\'s the difference between the Standard and Archive Cloud Storage classes?',
		answer: 'Same durability/latency/throughput for both — Archive is cheaper to store but expensive to retrieve early and has a 365-day minimum storage duration, meant for data accessed once a year or less.',
	},
	{
		id: 'gcp-storage-2',
		topic: 'Storage',
		difficulty: 'intermediate',
		question: 'Local SSD vs. Persistent Disk — which survives VM deletion?',
		answer: 'Persistent Disk survives (unless explicitly configured to auto-delete with the VM) and can be detached/reattached elsewhere. Local SSD is always ephemeral — data is lost if the VM stops or is migrated.',
	},
	{
		id: 'gcp-storage-3',
		topic: 'Storage',
		difficulty: 'advanced',
		question: 'How would you guarantee stored data can be made permanently unreadable on demand, even if copies exist?',
		answer: 'Encrypt it with a Customer-Managed Encryption Key (CMEK) via Cloud KMS — disabling or destroying the key version makes all data encrypted with it permanently unreadable ("crypto-shredding").',
	},
	// IAM
	{
		id: 'gcp-iam-1',
		topic: 'IAM',
		difficulty: 'basic',
		question: 'Why are Basic roles (Owner/Editor/Viewer) generally discouraged in production?',
		answer: 'They\'re broad and project-wide, violating least privilege. Predefined (service-specific) roles — or Custom roles when nothing predefined fits — should be preferred.',
	},
	{
		id: 'gcp-iam-2',
		topic: 'IAM',
		difficulty: 'intermediate',
		question: 'What identity should a VM use to call another GCP API, and why avoid a downloaded key file?',
		answer: 'A Service Account attached directly to the VM (or Workload Identity on GKE) — key files are a standing credential that must be rotated/secured, while an attached service account needs no key management at all.',
	},
	{
		id: 'gcp-iam-3',
		topic: 'IAM',
		difficulty: 'advanced',
		question: 'A role is granted at the Organization level. Can a Project Owner revoke it just for their project?',
		answer: 'No — IAM policy only adds permissions going down the resource hierarchy, it can\'t be subtracted at a lower level. The binding must be changed at the level it was originally granted (the Organization).',
	},
	// Networking
	{
		id: 'gcp-net-1',
		topic: 'Networking',
		difficulty: 'basic',
		question: 'Is a VPC a regional or global resource? What about its subnets?',
		answer: 'The VPC network itself is global; its subnets are regional — each subnet is tied to exactly one region.',
	},
	{
		id: 'gcp-net-2',
		topic: 'Networking',
		difficulty: 'intermediate',
		question: 'What do custom-mode VPC firewall rules allow/deny by default?',
		answer: 'Deny all ingress, allow all egress — you must explicitly create an ingress rule for anything (like SSH) you want to reach your VMs.',
	},
	{
		id: 'gcp-net-3',
		topic: 'Networking',
		difficulty: 'advanced',
		question: 'Is VPC Peering transitive? If A peers with B, and B peers with C, can A reach C?',
		answer: 'No — VPC Peering is non-transitive. A cannot reach C automatically; A and C would need to peer directly.',
	},
	// Databases
	{
		id: 'gcp-db-1',
		topic: 'Databases',
		difficulty: 'basic',
		question: 'Cloud SQL vs. Cloud Spanner — when do you need Spanner specifically?',
		answer: 'When you need horizontal scalability with strong consistency across regions/globally — Cloud SQL is simpler and cheaper but scales mainly vertically within one region.',
	},
	{
		id: 'gcp-db-2',
		topic: 'Databases',
		difficulty: 'intermediate',
		question: 'Which GCP database is purpose-built for OLAP-style analytical queries over huge datasets?',
		answer: 'BigQuery — a serverless data warehouse billed by data scanned, built for aggregations over billions of rows rather than row-by-row transactional updates.',
	},
	{
		id: 'gcp-db-3',
		topic: 'Databases',
		difficulty: 'intermediate',
		question: 'What is RPO, and how does it differ from RTO?',
		answer: 'RPO (Recovery Point Objective) measures how much data you can afford to lose, in time; RTO (Recovery Time Objective) measures how long you can be down before recovering — independent dimensions of resilience.',
	},
	// GKE / Kubernetes
	{
		id: 'gcp-gke-1',
		topic: 'GKE',
		difficulty: 'basic',
		question: 'What does GKE manage for you that a self-hosted Kubernetes cluster would not?',
		answer: 'The entire control plane (kube-apiserver, etcd, scheduler, controller-manager) — patched, secured, and made highly available by Google, invisible to you.',
	},
	{
		id: 'gcp-gke-2',
		topic: 'GKE',
		difficulty: 'intermediate',
		question: 'GKE Standard vs. Autopilot billing — what\'s the key difference?',
		answer: 'Standard bills for the Nodes you provision, whether fully utilized or not; Autopilot bills per Pod resource request, with no Nodes to manage or pay for idle capacity on.',
	},
	{
		id: 'gcp-gke-3',
		topic: 'GKE',
		difficulty: 'advanced',
		question: 'How does Cluster Autoscaler differ from Horizontal Pod Autoscaler?',
		answer: 'HPA adds/removes Pod replicas based on load; Cluster Autoscaler adds/removes Nodes based on unschedulable Pods — HPA operates on Pods, Cluster Autoscaler exists to make sure Nodes have room for whatever HPA decides.',
	},
	// Operations & Cost
	{
		id: 'gcp-ops-1',
		topic: 'Operations & Cost',
		difficulty: 'basic',
		question: 'Which audit log type is always on and cannot be disabled?',
		answer: 'Admin Activity — it records configuration/metadata changes (e.g. creating a VM, changing an IAM policy) and is always enabled, unlike Data Access logs which are mostly off by default.',
	},
	{
		id: 'gcp-ops-2',
		topic: 'Operations & Cost',
		difficulty: 'intermediate',
		question: 'What\'s the single most effective first step before running any hands-on GCP lab?',
		answer: 'Set a budget alert with a low threshold — it emails you when spend crosses it (it doesn\'t stop spending automatically), giving an early warning before a forgotten resource runs up a real bill.',
	},
	{
		id: 'gcp-ops-3',
		topic: 'Operations & Cost',
		difficulty: 'intermediate',
		question: 'Name three GCP resources that keep costing money even when "idle" if you forget to delete them.',
		answer: 'A Load Balancer\'s forwarding rule, an unattached static external IP, and a running Cloud SQL instance — none of these are free just because nothing is actively using them.',
	},
];

/** Multiple-choice quiz questions grouped by topic. */
export const GCP_QUIZ_QUESTIONS: QuizQuestion[] = [
	// Compute
	{
		id: 'gcpq-1',
		topic: 'Compute',
		question: 'Which Compute Engine discount requires no upfront commitment and applies automatically?',
		options: ['Committed Use Discount', 'Sustained Use Discount', 'Spot VM pricing', 'Reserved Instance pricing'],
		correct: 1,
		explanation: 'Sustained Use Discounts kick in automatically the longer a VM runs continuously within a billing month — no commitment or action needed.',
	},
	{
		id: 'gcpq-2',
		topic: 'Compute',
		question: 'A team needs the cheapest way to run a fault-tolerant nightly batch job. What should they use?',
		options: ['On-demand standard VM', 'Committed Use VM', 'Spot VM', 'Sole-tenant node'],
		correct: 2,
		explanation: 'Spot VMs offer the deepest discount (up to ~91%) and are ideal for interruptible, fault-tolerant workloads like batch jobs.',
	},
	{
		id: 'gcpq-3',
		topic: 'Compute',
		question: 'What is a Managed Instance Group\'s "autohealing" feature responsible for?',
		options: ['Encrypting VM disks automatically', 'Recreating instances that fail a health check', 'Patching the OS automatically', 'Load balancing traffic across zones'],
		correct: 1,
		explanation: 'Autohealing uses a health check to detect unhealthy instances and automatically recreates them — separate from autoscaling, which changes the instance count based on load.',
	},
	{
		id: 'gcpq-4',
		topic: 'Compute',
		question: 'Which is a zonal resource?',
		options: ['A Compute Engine VM', 'A VPC network', 'A Cloud Storage multi-region bucket', 'A disk Image'],
		correct: 0,
		explanation: 'A VM (and its Persistent Disk) is zonal — tied to exactly one zone. VPC networks and Images are global; some bucket configurations are multi-regional.',
	},
	// Storage
	{
		id: 'gcpq-5',
		topic: 'Storage',
		question: 'Which Cloud Storage class fits data accessed roughly once a quarter?',
		options: ['Standard', 'Nearline', 'Coldline', 'Archive'],
		correct: 2,
		explanation: 'Coldline has a 90-day minimum storage duration and fits access patterns of about once per quarter — Nearline targets monthly access, Archive targets yearly or less.',
	},
	{
		id: 'gcpq-6',
		topic: 'Storage',
		question: 'What protects against an accidental overwrite of a Cloud Storage object?',
		options: ['Lifecycle rules', 'Object Versioning', 'A larger storage class', 'IAM Viewer role'],
		correct: 1,
		explanation: 'Versioning keeps prior versions instead of destroying them on overwrite/delete — Lifecycle rules manage aging/deleting objects, not protecting against accidental overwrites.',
	},
	{
		id: 'gcpq-7',
		topic: 'Storage',
		question: 'A shared filesystem needs to be mounted by many VMs at once. Which service fits?',
		options: ['Persistent Disk', 'Local SSD', 'Filestore', 'Cloud Storage'],
		correct: 2,
		explanation: 'Filestore is GCP\'s managed NFS file storage, designed to be mounted concurrently by multiple VMs — Persistent Disk attaches to only one VM at a time (in read-write mode).',
	},
	// IAM
	{
		id: 'gcpq-8',
		topic: 'IAM',
		question: 'What is the recommended way to grant the same role to 50 engineers?',
		options: ['Add each engineer individually to the IAM policy', 'Grant the role to a Google Group they all belong to', 'Give everyone the Owner Basic role', 'Create 50 custom roles'],
		correct: 1,
		explanation: 'Granting to a Group centralizes management — adding/removing people from the group handles access, instead of editing every resource\'s policy individually.',
	},
	{
		id: 'gcpq-9',
		topic: 'IAM',
		question: 'What does Organization Policy control that IAM does not?',
		options: ['Who can access a specific bucket', 'What resource configurations are allowed to exist at all, regardless of identity', 'Billing account permissions', 'Service account key rotation'],
		correct: 1,
		explanation: 'Organization Policy is a guardrail layer above IAM — it can forbid a configuration (e.g. VMs with public IPs) org-wide, which even an Owner cannot override via IAM alone.',
	},
	{
		id: 'gcpq-10',
		topic: 'IAM',
		question: 'Which role lets a user deploy a resource using a service account, without granting full control over that service account?',
		options: ['roles/iam.serviceAccountAdmin', 'roles/iam.serviceAccountUser', 'roles/owner', 'roles/iam.serviceAccountTokenCreator'],
		correct: 1,
		explanation: 'roles/iam.serviceAccountUser lets someone deploy resources as a service account without granting them administrative control over that service account itself.',
	},
	// Networking
	{
		id: 'gcpq-11',
		topic: 'Networking',
		question: 'By default, what happens to inbound traffic on a freshly created custom-mode VPC?',
		options: ['All ingress is allowed', 'All ingress is denied until you create a rule', 'Only SSH (port 22) is allowed', 'Only HTTPS is allowed'],
		correct: 1,
		explanation: 'Custom-mode VPCs deny all ingress and allow all egress by default — you must explicitly create firewall rules for anything you want to reach your VMs.',
	},
	{
		id: 'gcpq-12',
		topic: 'Networking',
		question: 'Which connects an on-premises network to a VPC over the public internet with encryption, fastest to set up?',
		options: ['Cloud Interconnect', 'VPC Peering', 'Cloud VPN', 'Shared VPC'],
		correct: 2,
		explanation: 'Cloud VPN is an encrypted tunnel over the public internet — quick to set up, though subject to internet variability. Cloud Interconnect is a dedicated physical connection, higher bandwidth but more complex/expensive.',
	},
	{
		id: 'gcpq-13',
		topic: 'Networking',
		question: 'What must be true of two VPCs before they can be peered?',
		options: ['They must be in the same project', 'Their IP ranges must not overlap', 'They must both be in auto mode', 'They must be in the same region'],
		correct: 1,
		explanation: 'Peered VPCs must have non-overlapping IP ranges — overlapping ranges make routing between them ambiguous.',
	},
	// Databases
	{
		id: 'gcpq-14',
		topic: 'Databases',
		question: 'A global financial ledger needs strong consistency across continents. Which database fits?',
		options: ['Cloud SQL', 'Cloud Spanner', 'Bigtable', 'Memorystore'],
		correct: 1,
		explanation: 'Cloud Spanner is the only option here offering horizontal scale with strong consistency across regions — its signature feature.',
	},
	{
		id: 'gcpq-15',
		topic: 'Databases',
		question: 'Which database is built for massive-scale, single-digit-millisecond key-based lookups (e.g. IoT sensor data)?',
		options: ['BigQuery', 'Firestore', 'Bigtable', 'Cloud SQL'],
		correct: 2,
		explanation: 'Bigtable is a wide-column store built for huge-scale, low-latency workloads like IoT/time-series/ad-tech data.',
	},
	{
		id: 'gcpq-16',
		topic: 'Databases',
		question: 'What is Memorystore primarily used for?',
		options: ['Long-term archival storage', 'A caching layer / sub-millisecond lookups in front of a primary database', 'Running analytical SQL queries', 'Storing unstructured objects'],
		correct: 1,
		explanation: 'Memorystore (managed Redis/Memcached) is used for caching and fast lookups — it\'s typically not the source of truth, just a fast layer in front of one.',
	},
	// GKE
	{
		id: 'gcpq-17',
		topic: 'GKE',
		question: 'Which GKE mode is billed per Pod resource request rather than per Node?',
		options: ['Standard', 'Autopilot', 'Both are billed identically', 'Neither — GKE is always billed per cluster'],
		correct: 1,
		explanation: 'Autopilot bills based on the CPU/memory actually requested by your Pods; Standard bills for the Nodes you provision regardless of utilization.',
	},
	{
		id: 'gcpq-18',
		topic: 'GKE',
		question: 'What does a Regional GKE cluster protect against that a Zonal cluster does not?',
		options: ['Application-level bugs', 'A single zone becoming unavailable', 'DDoS attacks', 'IAM misconfiguration'],
		correct: 1,
		explanation: 'A Regional cluster replicates the control plane and nodes across multiple zones in a region, surviving a single-zone outage — a Zonal cluster cannot.',
	},
	{
		id: 'gcpq-19',
		topic: 'GKE',
		question: 'Which lets a GKE Pod call a GCP API securely without managing a key file?',
		options: ['A service account key mounted as a Secret', 'Workload Identity', 'A hardcoded API key', 'Basic Auth'],
		correct: 1,
		explanation: 'Workload Identity lets a Kubernetes Pod impersonate a GCP service account directly — no key file to generate, store, or rotate.',
	},
	// Operations & Cost
	{
		id: 'gcpq-20',
		topic: 'Operations & Cost',
		question: 'Which log type would show exactly who deleted a specific Compute Engine instance?',
		options: ['Data Access audit log', 'Admin Activity audit log', 'VPC Flow Logs', 'Cloud Trace'],
		correct: 1,
		explanation: 'Admin Activity audit logs record configuration/metadata changes like deleting a VM, and are always enabled — no setup required.',
	},
	{
		id: 'gcpq-21',
		topic: 'Operations & Cost',
		question: 'Does setting a budget alert stop GCP spending automatically once the threshold is crossed?',
		options: ['Yes, it disables billing automatically', 'No — it only sends a notification; spending continues', 'Yes, but only for Compute Engine', 'It pauses the project until manually resumed'],
		correct: 1,
		explanation: 'A budget alert is a notification tripwire, not a spending cap — it emails you when a threshold is crossed but does not stop any resources from running or billing.',
	},
	{
		id: 'gcpq-22',
		topic: 'Operations & Cost',
		question: 'A Compute Engine VM has been stopped for a week. Is anything still being billed?',
		options: ['No, stopped VMs never incur any cost', 'Yes — its Persistent Disk storage (and any unattached static IP) still costs money', 'Yes, but only network egress', 'Only if the VM has a GPU attached'],
		correct: 1,
		explanation: 'A stopped VM stops incurring compute charges, but its Persistent Disk (and any static external IP no longer attached to a running VM) continues to cost money until deleted/released.',
	},
];

export const GCP_QUIZ_TOPICS = Array.from(
	new Set(GCP_QUIZ_QUESTIONS.map(q => q.topic)),
);
export const GCP_INTERVIEW_TOPICS = Array.from(
	new Set(GCP_INTERVIEW_QUESTIONS.map(q => q.topic)),
);
