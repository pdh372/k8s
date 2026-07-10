import type { Diagram } from '../lib/types';

/**
 * The RBAC authorization model: subjects are tied to Roles by bindings, and
 * Roles carry the allow-only rules (verbs on resources). Namespaced vs
 * cluster-scoped objects are grouped into the two dashed regions.
 */
export const RBAC_DIAGRAM: Diagram = {
	id: 'rbac',
	title: 'RBAC / Security',
	subtitle:
		"Who can do what: a Binding ties Subjects to a Role, and the Role's rules grant verbs on resources. Deny by default.",
	viewBox: '0 0 980 430',
	defaultSelected: 'rolebinding',
	groups: {
		flow: { color: '#fbbf24', label: 'Request path' },
		subject: { color: '#38bdf8', label: 'Subjects' },
		binding: { color: '#a78bfa', label: 'Bindings' },
		role: { color: '#5B8DEF', label: 'Roles' },
		resource: { color: '#34d399', label: 'Resources' },
	},
	boxes: [
		{
			x: 270,
			y: 130,
			w: 510,
			h: 122,
			label: 'Namespaced (one namespace)',
			variant: 'dashed',
		},
		{
			x: 270,
			y: 283,
			w: 510,
			h: 122,
			label: 'Cluster-scoped (all namespaces)',
			variant: 'dashed',
		},
	],
	nodes: [
		{
			id: 'apiserver',
			label: 'apiserver AuthZ',
			group: 'flow',
			x: 380,
			y: 20,
			w: 220,
			h: 54,
			tagline: 'Authenticates, then authorizes',
			details:
				'Every request is first authenticated (who are you?), then authorized. The RBAC authorizer checks whether any RoleBinding or ClusterRoleBinding grants the requested verb on the resource. There are no deny rules — access is denied unless something allows it.',
			questions: [
				{
					q: 'What are the request stages in the apiserver?',
					a: 'Authentication → Authorization (RBAC is one authorizer) → Admission control → persisted to etcd.',
				},
				{
					q: 'Is RBAC allow- or deny-based?',
					a: "Allow-only and deny-by-default. Rules only grant; if nothing grants the action, it's denied.",
				},
			],
		},
		{
			id: 'user',
			label: 'User',
			group: 'subject',
			x: 50,
			y: 140,
			w: 170,
			h: 58,
			tagline: 'A human identity',
			details:
				'Kubernetes has no User object. Users are external identities — a client-certificate Common Name, a bearer token, or an OIDC claim — that the authenticator turns into a username string.',
			questions: [
				{
					q: 'Where are Users defined?',
					a: 'Outside the cluster (cert CN, OIDC provider, etc.). The apiserver only sees the username and groups the authenticator produced.',
				},
				{
					q: 'How do you grant a User access?',
					a: 'List them as a subject in a RoleBinding/ClusterRoleBinding that references a Role/ClusterRole.',
				},
			],
		},
		{
			id: 'group',
			label: 'Group',
			group: 'subject',
			x: 50,
			y: 225,
			w: 170,
			h: 58,
			tagline: 'A set of users',
			details:
				"Like users, groups are just strings from the authenticator (e.g. a certificate's Organization field, or the OIDC groups claim). Binding a group grants the permission to every member.",
			questions: [
				{
					q: 'How is a user placed in a group?',
					a: 'By the authenticator — the O field of a client cert, or the groups claim from an OIDC token.',
				},
				{
					q: 'Why bind groups instead of individual users?',
					a: 'Easier management: add or remove people upstream without editing any RBAC objects.',
				},
			],
		},
		{
			id: 'serviceaccount',
			label: 'ServiceAccount',
			group: 'subject',
			x: 50,
			y: 310,
			w: 170,
			h: 58,
			tagline: 'An identity for Pods',
			details:
				'A namespaced identity that workloads use. A Pod authenticates as its ServiceAccount via a projected token, and RBAC on that SA decides what the workload may call in the API.',
			questions: [
				{
					q: 'What identity does a Pod use?',
					a: "Its ServiceAccount (the namespace's 'default' one if none is set); the token is mounted into the Pod.",
				},
				{
					q: 'How is a ServiceAccount named in RBAC?',
					a: 'system:serviceaccount:<namespace>:<name>, and every SA is also in the system:serviceaccounts group.',
				},
			],
		},
		{
			id: 'rolebinding',
			label: 'RoleBinding',
			group: 'binding',
			x: 300,
			y: 160,
			w: 200,
			h: 62,
			tagline: 'Grants a Role in one namespace',
			details:
				'Binds subjects to a Role (or a ClusterRole) but only within its own namespace. It has a list of subjects[] and a single roleRef.',
			questions: [
				{
					q: 'Can a RoleBinding reference a ClusterRole?',
					a: "Yes — it grants that ClusterRole's rules, but scoped to the RoleBinding's namespace. Great for reusing one common role everywhere.",
				},
				{
					q: "Can you edit a binding's roleRef?",
					a: 'No — roleRef is immutable. Delete and recreate the binding to point at a different role.',
				},
			],
		},
		{
			id: 'clusterrolebinding',
			label: 'ClusterRoleBinding',
			group: 'binding',
			x: 300,
			y: 313,
			w: 200,
			h: 62,
			tagline: 'Grants a ClusterRole everywhere',
			details:
				'Binds subjects to a ClusterRole across all namespaces and for cluster-scoped resources. This is the powerful one — use it carefully.',
			questions: [
				{
					q: 'When do you need a ClusterRoleBinding?',
					a: 'For cluster-wide access or cluster-scoped resources (nodes, PVs, namespaces), or to grant across every namespace at once.',
				},
				{
					q: "What's the risk of binding cluster-admin?",
					a: 'It hands the subject full control of the cluster. Grant it sparingly and audit who has it.',
				},
			],
		},
		{
			id: 'role',
			label: 'Role',
			group: 'role',
			x: 580,
			y: 160,
			w: 180,
			h: 62,
			tagline: 'Namespaced rules',
			details:
				'A namespaced set of allow-only rules. Each rule is apiGroups + resources + verbs, and it applies only within its own namespace.',
			questions: [
				{
					q: 'What does a single rule contain?',
					a: 'apiGroups, resources (optionally resourceNames), and verbs like get/list/watch/create/update/patch/delete.',
				},
				{
					q: 'Can a Role grant access to nodes?',
					a: 'No — nodes are cluster-scoped, so you need a ClusterRole for them.',
				},
			],
		},
		{
			id: 'clusterrole',
			label: 'ClusterRole',
			group: 'role',
			x: 580,
			y: 313,
			w: 180,
			h: 62,
			tagline: 'Cluster-wide, reusable rules',
			details:
				'Like a Role but cluster-scoped and reusable. Used for cluster-wide resources, non-resource URLs (e.g. /healthz), or to be referenced by many RoleBindings across namespaces.',
			questions: [
				{
					q: 'What are the three uses of a ClusterRole?',
					a: 'Cluster-scoped resources, non-resource endpoints, and namespaced resources across all namespaces (via ClusterRoleBinding or reused by RoleBindings).',
				},
				{
					q: 'What is ClusterRole aggregation?',
					a: "ClusterRoles can be auto-combined via aggregationRule label selectors — that's how the built-in admin/edit/view roles are assembled.",
				},
			],
		},
		{
			id: 'resources',
			label: 'Resources + verbs',
			group: 'resource',
			x: 800,
			y: 205,
			w: 160,
			h: 92,
			tagline: 'What the rules act on',
			details:
				'The API objects and actions a rule targets — e.g. get/list on pods, create on secrets. Each is identified by apiGroup + resource; some are namespaced, some cluster-scoped.',
			questions: [
				{
					q: 'How do you test whether you have access?',
					a: 'kubectl auth can-i <verb> <resource>, optionally with --as <user> to impersonate.',
				},
				{
					q: 'Which verbs give read-only access?',
					a: 'get, list, and watch.',
				},
			],
		},
	],
	edges: [
		{ from: 'apiserver', to: 'rolebinding', dashed: true },
		{ from: 'apiserver', to: 'clusterrolebinding', dashed: true },
		{ from: 'user', to: 'rolebinding' },
		{ from: 'group', to: 'rolebinding' },
		{ from: 'serviceaccount', to: 'rolebinding' },
		{ from: 'serviceaccount', to: 'clusterrolebinding' },
		{ from: 'rolebinding', to: 'role' },
		{ from: 'rolebinding', to: 'clusterrole', dashed: true },
		{ from: 'clusterrolebinding', to: 'clusterrole' },
		{ from: 'role', to: 'resources' },
		{ from: 'clusterrole', to: 'resources' },
	],
};
