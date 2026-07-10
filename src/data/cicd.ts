import type { Diagram } from '../lib/types';

/**
 * A typical CI/CD path from a developer's commit to running Pods: build & test
 * in CI, push an image to a registry, then deploy (push-based or GitOps) into
 * the cluster where the kubelet pulls the image.
 */
export const CICD_DIAGRAM: Diagram = {
	id: 'cicd',
	title: 'CI/CD → Cluster',
	subtitle:
		'Commit → build & test → image in a registry → deploy to the API → the cluster rolls out new Pods.',
	viewBox: '0 0 980 600',
	defaultSelected: 'cd',
	groups: {
		dev: { color: '#38bdf8', label: 'Developer' },
		scm: { color: '#a78bfa', label: 'Source control' },
		pipeline: { color: '#fbbf24', label: 'CI / CD' },
		registry: { color: '#f472b6', label: 'Registry' },
		cluster: { color: '#5B8DEF', label: 'Cluster API' },
		workload: { color: '#34d399', label: 'Workload' },
	},
	boxes: [
		{
			x: 40,
			y: 40,
			w: 900,
			h: 130,
			label: 'Build pipeline (CI)',
			variant: 'solid',
		},
		{
			x: 520,
			y: 210,
			w: 340,
			h: 350,
			label: 'Kubernetes cluster',
			variant: 'dashed',
		},
	],
	nodes: [
		{
			id: 'dev',
			label: 'Developer',
			group: 'dev',
			x: 60,
			y: 80,
			w: 150,
			h: 60,
			tagline: 'Pushes code',
			details:
				'A developer writes code and pushes to Git. From there the pipeline takes over — in a healthy setup nobody runs kubectl by hand against production.',
			questions: [
				{
					q: 'Why avoid manual `kubectl apply` in production?',
					a: "It isn't auditable or reproducible. CI/CD or GitOps versions every change so it can be reviewed and rolled back.",
				},
				{
					q: 'What kicks off the pipeline?',
					a: 'A git push or merge fires a webhook to the CI system.',
				},
			],
		},
		{
			id: 'git',
			label: 'Git repo',
			group: 'scm',
			x: 280,
			y: 80,
			w: 150,
			h: 60,
			tagline: 'Source of truth',
			details:
				'Holds the application code and, in GitOps, the desired Kubernetes manifests too. Every change is a reviewable, revertable commit.',
			questions: [
				{
					q: 'What is GitOps?',
					a: 'A model where Git is the source of truth and an in-cluster agent (Argo CD / Flux) continuously syncs the cluster to match it.',
				},
				{
					q: 'What lives in the manifests repo?',
					a: 'The desired-state YAML / Helm / Kustomize describing what should run in the cluster.',
				},
			],
		},
		{
			id: 'ci',
			label: 'CI pipeline',
			group: 'pipeline',
			x: 500,
			y: 80,
			w: 160,
			h: 60,
			tagline: 'Build & test the image',
			details:
				'On each push CI builds the app, runs tests, builds the container image, tags it (often with the git SHA) and pushes it to the registry.',
			questions: [
				{
					q: 'Why tag images with the git SHA instead of :latest?',
					a: 'Immutable, traceable deploys — you know exactly which commit is running and can roll back precisely.',
				},
				{
					q: "What is CI's output artifact?",
					a: 'A tested, versioned container image published to a registry.',
				},
			],
		},
		{
			id: 'registry',
			label: 'Registry',
			group: 'registry',
			x: 730,
			y: 80,
			w: 170,
			h: 60,
			tagline: 'Stores container images',
			details:
				"An OCI image registry (GHCR, ECR, Docker Hub, Harbor). CI pushes images here; the cluster's nodes pull from here at runtime.",
			questions: [
				{
					q: 'How do nodes pull a private image?',
					a: 'Via an imagePullSecret (registry credentials) referenced by the Pod or its ServiceAccount.',
				},
				{
					q: 'Who actually pulls the image?',
					a: 'The kubelet on the node where the Pod is scheduled, through the container runtime.',
				},
			],
		},
		{
			id: 'cd',
			label: 'CD / GitOps',
			group: 'pipeline',
			x: 250,
			y: 250,
			w: 180,
			h: 64,
			tagline: 'Applies the desired state',
			details:
				'Deploys manifests to the cluster. Either push-based (CI runs kubectl/helm) or pull-based GitOps, where an agent like Argo CD or Flux watches Git and syncs changes itself.',
			questions: [
				{
					q: 'Push-based vs pull-based deployment?',
					a: 'Push = CI calls the cluster API from outside. Pull = an in-cluster agent watches Git and applies changes from within.',
				},
				{
					q: 'How does Argo CD handle drift?',
					a: 'It continuously compares live state to Git and can auto-heal the cluster back to the declared state.',
				},
			],
		},
		{
			id: 'apiserver',
			label: 'kube-apiserver',
			group: 'cluster',
			x: 560,
			y: 250,
			w: 180,
			h: 64,
			tagline: 'Receives the desired state',
			details:
				'The CD tool talks to the apiserver to create/update objects. It authenticates (a ServiceAccount/kubeconfig), authorizes via RBAC, validates, and stores the desired state.',
			questions: [
				{
					q: 'How does a CD tool authenticate to the cluster?',
					a: 'With a kubeconfig or ServiceAccount token whose RBAC grants exactly the permissions it needs.',
				},
				{
					q: 'What does an apply actually change?',
					a: "It updates the object's desired state in etcd; controllers then reconcile the real state toward it.",
				},
			],
		},
		{
			id: 'deployment',
			label: 'Deployment',
			group: 'cluster',
			x: 560,
			y: 380,
			w: 180,
			h: 60,
			tagline: 'Declares desired replicas',
			details:
				'Declares the desired replica count and image. When the image tag changes, its controller performs a rolling update by shifting Pods from the old ReplicaSet to a new one.',
			questions: [
				{
					q: 'How does a new image version roll out?',
					a: "Updating the Deployment's image creates a new ReplicaSet and gradually replaces Pods (respecting maxSurge/maxUnavailable).",
				},
				{
					q: 'How do you roll back a bad deploy?',
					a: 'kubectl rollout undo, or in GitOps just revert the offending Git commit.',
				},
			],
		},
		{
			id: 'pods',
			label: 'Pods',
			group: 'workload',
			x: 560,
			y: 480,
			w: 180,
			h: 60,
			tagline: 'Run the new image',
			details:
				'The running containers, pulling the tagged image from the registry. Readiness probes gate whether the rollout is considered healthy.',
			questions: [
				{
					q: 'When is a rollout considered successful?',
					a: 'When the new Pods pass their readiness probes. If they crash-loop, the rollout stalls instead of taking down the app.',
				},
				{
					q: 'Where does the running image come from?',
					a: 'The kubelet pulls it from the registry using the tag in the Pod spec.',
				},
			],
		},
	],
	edges: [
		{ from: 'dev', to: 'git' },
		{ from: 'git', to: 'ci' },
		{ from: 'ci', to: 'registry' },
		{ from: 'ci', to: 'cd' },
		{ from: 'cd', to: 'apiserver' },
		{ from: 'apiserver', to: 'deployment' },
		{ from: 'deployment', to: 'pods' },
		{ from: 'registry', to: 'pods', dashed: true },
	],
};
