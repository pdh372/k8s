import type { Lab } from '../lib/types';

/**
 * Real-world, end-to-end scenarios that run on a local Minikube cluster. Each
 * lab composes several primitives into something you'd actually do on the job.
 */
export const LABS: Lab[] = [
	{
		id: 'three-tier-app',
		title: 'Ship a real app: Postgres + web UI',
		scenario:
			'Deploy a database with persistent storage and a web UI that connects to it — wired together with a Secret, a PVC, Services and an Ingress, just like a real product.',
		difficulty: 'intermediate',
		minutes: 30,
		tags: ['Deployment', 'Service', 'Secret', 'PVC', 'Ingress'],
		prerequisites: [
			'A running Minikube cluster (minikube start)',
			'Ingress addon: minikube addons enable ingress',
		],
		whatYouLearn: [
			'Compose multiple tiers into one app',
			'Keep credentials in a Secret and data on a PersistentVolume',
			'Expose an internal Service to the outside via Ingress',
		],
		interviewAngle:
			'\u201cDeploy a multi-tier app\u201d is the classic take-home / whiteboard task. It proves you can wire Deployments, Services, config, storage and ingress together — not just recite what a Pod is.',
		steps: [
			{
				title: 'Create a namespace to keep it tidy',
				code: 'kubectl create namespace shop',
				lang: 'bash',
			},
			{
				title: 'Store the DB password in a Secret',
				body: 'Never bake credentials into an image or manifest — inject them from a Secret.',
				code: `kubectl -n shop create secret generic db-secret \\
  --from-literal=POSTGRES_PASSWORD='S3cret_pw!'`,
				lang: 'bash',
			},
			{
				title: 'Postgres: PVC + Deployment + Service',
				body: 'The PVC keeps data across restarts; the ClusterIP Service gives Postgres a stable in-cluster DNS name (postgres.shop).',
				code: `kubectl apply -n shop -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata: { name: pg-data }
spec:
  accessModes: ["ReadWriteOnce"]
  resources: { requests: { storage: 1Gi } }
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: postgres }
spec:
  selector: { matchLabels: { app: postgres } }
  template:
    metadata: { labels: { app: postgres } }
    spec:
      containers:
        - name: postgres
          image: postgres:16
          env:
            - name: POSTGRES_PASSWORD
              valueFrom: { secretKeyRef: { name: db-secret, key: POSTGRES_PASSWORD } }
            - name: PGDATA
              value: /var/lib/postgresql/data/pgdata
          ports: [{ containerPort: 5432 }]
          volumeMounts:
            - { name: data, mountPath: /var/lib/postgresql/data }
      volumes:
        - name: data
          persistentVolumeClaim: { claimName: pg-data }
---
apiVersion: v1
kind: Service
metadata: { name: postgres }
spec:
  selector: { app: postgres }
  ports: [{ port: 5432, targetPort: 5432 }]
EOF`,
				lang: 'bash',
			},
			{
				title: 'Web UI (Adminer) + Service',
				body: 'Adminer is a real DB admin UI. We point it at the postgres Service by DNS name.',
				code: `kubectl apply -n shop -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: adminer }
spec:
  selector: { matchLabels: { app: adminer } }
  template:
    metadata: { labels: { app: adminer } }
    spec:
      containers:
        - name: adminer
          image: adminer:4
          env:
            - { name: ADMINER_DEFAULT_SERVER, value: postgres }
          ports: [{ containerPort: 8080 }]
---
apiVersion: v1
kind: Service
metadata: { name: adminer }
spec:
  selector: { app: adminer }
  ports: [{ port: 8080, targetPort: 8080 }]
EOF`,
				lang: 'bash',
			},
			{
				title: 'Expose the UI with an Ingress',
				code: `kubectl apply -n shop -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: adminer
spec:
  rules:
    - host: shop.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: adminer, port: { number: 8080 } }
EOF
echo "$(minikube ip)  shop.local" | sudo tee -a /etc/hosts`,
				lang: 'bash',
			},
		],
		verify: [
			'kubectl -n shop get pods,svc,ingress,pvc',
			'Open http://shop.local in a browser (or: kubectl -n shop port-forward svc/adminer 8080:8080 then http://localhost:8080)',
			'In Adminer log in with System=PostgreSQL, Server=postgres, Username=postgres, Password=S3cret_pw! — a successful login means all tiers are wired up.',
		],
		cleanup: 'kubectl delete namespace shop',
	},
	{
		id: 'rolling-update-rollback',
		title: 'Zero-downtime release & instant rollback',
		scenario:
			'Ship v2 of a service without dropping a single request, watch a bad release get blocked by readiness probes, then roll back in seconds.',
		difficulty: 'intermediate',
		minutes: 20,
		tags: ['Deployment', 'RollingUpdate', 'readiness probe', 'rollout'],
		prerequisites: ['A running Minikube cluster'],
		whatYouLearn: [
			'Configure a safe rolling update (maxUnavailable: 0)',
			'How readiness probes gate a rollout and protect traffic',
			'Roll back to the previous revision instantly',
		],
		interviewAngle:
			'\u201cHow do you deploy without downtime, and what happens when a release is broken?\u201d is asked in almost every SRE/DevOps interview. This shows the mechanics, not just the buzzwords.',
		steps: [
			{
				title: 'Deploy v1 with a readiness probe and a safe strategy',
				code: `kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate: { maxUnavailable: 0, maxSurge: 1 }
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: web
          image: stefanprodan/podinfo:6.5.3
          ports: [{ containerPort: 9898 }]
          readinessProbe:
            httpGet: { path: /readyz, port: 9898 }
            initialDelaySeconds: 2
EOF
kubectl expose deployment web --port=9898`,
				lang: 'bash',
			},
			{
				title: 'Watch traffic in another terminal (should never fail)',
				body: 'Leave this loop running while you upgrade — it hits the Service continuously.',
				code: `kubectl run watcher --image=busybox --restart=Never -it --rm -- \\
  /bin/sh -c 'while true; do wget -qO- http://web:9898/version; echo; sleep 0.5; done'`,
				lang: 'bash',
			},
			{
				title: 'Roll out v2 and watch it progress',
				code: `kubectl set image deployment/web web=stefanprodan/podinfo:6.5.4
kubectl rollout status deployment/web`,
				lang: 'bash',
			},
			{
				title: 'Try a BROKEN release — the probe protects you',
				body: 'The new Pods never become Ready, so the rollout stalls and the old Pods keep serving. No downtime.',
				code: `kubectl set image deployment/web web=stefanprodan/podinfo:9.9.9
kubectl rollout status deployment/web --timeout=30s   # will report it's stuck
kubectl get pods -l app=web                            # new pod is ImagePullBackOff`,
				lang: 'bash',
			},
			{
				title: 'Roll back to the last good revision',
				code: `kubectl rollout undo deployment/web
kubectl rollout status deployment/web
kubectl rollout history deployment/web`,
				lang: 'bash',
			},
		],
		verify: [
			'The watcher loop kept printing a version the whole time (no connection errors).',
			'After the rollback, kubectl get pods -l app=web shows all Pods Running/Ready.',
		],
		cleanup: 'kubectl delete deployment web && kubectl delete service web',
	},
	{
		id: 'hpa-autoscale',
		title: 'Autoscale under load with the HPA',
		scenario:
			"A traffic spike hits your service. Instead of paging someone, Kubernetes adds replicas automatically based on CPU, then scales back down when it's quiet.",
		difficulty: 'intermediate',
		minutes: 20,
		tags: ['HPA', 'metrics-server', 'requests/limits'],
		prerequisites: [
			'A running Minikube cluster',
			'Metrics: minikube addons enable metrics-server',
		],
		whatYouLearn: [
			'Why resource requests are required for CPU-based autoscaling',
			'Create a HorizontalPodAutoscaler',
			'Watch scale-up under load and scale-down after',
		],
		interviewAngle:
			"Autoscaling is a favourite interview topic. The key insight they're looking for: the HPA needs metrics-server AND resource requests, and it scales on a target utilization.",
		steps: [
			{
				title: 'Deploy the classic CPU-burn demo with a CPU request',
				code: `kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: php-apache }
spec:
  selector: { matchLabels: { run: php-apache } }
  template:
    metadata: { labels: { run: php-apache } }
    spec:
      containers:
        - name: php-apache
          image: registry.k8s.io/hpa-example
          ports: [{ containerPort: 80 }]
          resources:
            requests: { cpu: 200m }
            limits: { cpu: 500m }
EOF
kubectl expose deployment php-apache --port=80`,
				lang: 'bash',
			},
			{
				title: 'Create the autoscaler: target 50% CPU, 1–10 replicas',
				code: 'kubectl autoscale deployment php-apache --cpu-percent=50 --min=1 --max=10',
				lang: 'bash',
			},
			{
				title: 'Generate load from another Pod',
				body: 'Leave this running and watch the HPA react.',
				code: `kubectl run -it --rm load --image=busybox --restart=Never -- \\
  /bin/sh -c 'while true; do wget -q -O- http://php-apache; done'`,
				lang: 'bash',
			},
			{
				title: 'Watch it scale up (in a second terminal)',
				code: 'kubectl get hpa php-apache --watch',
				lang: 'bash',
			},
			{
				title: 'Stop the load (Ctrl-C the load Pod) and watch scale-down',
				body: 'Scale-down is deliberately slow (a few minutes) to avoid flapping.',
				code: 'kubectl get hpa php-apache --watch',
				lang: 'bash',
			},
		],
		verify: [
			'Under load, REPLICAS in `kubectl get hpa` climbs above 1 (often to the max).',
			'After you stop the load, replicas gradually return to 1.',
		],
		cleanup:
			'kubectl delete hpa php-apache && kubectl delete deployment php-apache && kubectl delete service php-apache',
	},
	{
		id: 'rbac-namespace-lockdown',
		title: 'Lock down a namespace with RBAC',
		scenario:
			'A new developer needs to deploy to their own namespace — but must not touch anything else in the cluster. Give them a least-privilege ServiceAccount.',
		difficulty: 'intermediate',
		minutes: 20,
		tags: ['RBAC', 'ServiceAccount', 'Role', 'RoleBinding'],
		prerequisites: ['A running Minikube cluster'],
		whatYouLearn: [
			'Create a namespaced Role with specific verbs/resources',
			'Bind it to a ServiceAccount with a RoleBinding',
			'Prove the boundaries with kubectl auth can-i --as',
		],
		interviewAngle:
			'Least-privilege access is a security must. Being able to design and TEST an RBAC boundary (with `--as` impersonation) is exactly what interviewers probe for.',
		steps: [
			{
				title: 'Create the namespace and a ServiceAccount',
				code: `kubectl create namespace dev-team
kubectl -n dev-team create serviceaccount dev-user`,
				lang: 'bash',
			},
			{
				title: 'Grant only what a developer needs, in that namespace only',
				code: `kubectl apply -n dev-team -f - <<'EOF'
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata: { name: developer }
rules:
  - apiGroups: ["", "apps"]
    resources: ["deployments", "pods", "services", "configmaps"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata: { name: developer-binding }
subjects:
  - kind: ServiceAccount
    name: dev-user
    namespace: dev-team
roleRef:
  kind: Role
  name: developer
  apiGroup: rbac.authorization.k8s.io
EOF`,
				lang: 'bash',
			},
			{
				title: 'Test the boundary by impersonating the ServiceAccount',
				body: 'kubectl auth can-i answers yes/no without needing to log in as the SA.',
				code: `SA=system:serviceaccount:dev-team:dev-user
kubectl auth can-i create deployments -n dev-team --as=$SA   # yes
kubectl auth can-i delete pods        -n dev-team --as=$SA   # yes
kubectl auth can-i create deployments -n default  --as=$SA   # no
kubectl auth can-i get nodes                      --as=$SA   # no
kubectl auth can-i "*" "*"            -n dev-team --as=$SA   # no`,
				lang: 'bash',
			},
			{
				title: '(Optional) Mint a real token for that SA',
				code: 'kubectl -n dev-team create token dev-user --duration=1h',
				lang: 'bash',
			},
		],
		verify: [
			'The in-namespace checks print `yes`; the default-namespace and cluster-scoped checks print `no`.',
			'That yes/no pattern is the whole point — access is granted exactly where intended and nowhere else.',
		],
		cleanup: 'kubectl delete namespace dev-team',
	},
	{
		id: 'network-policy-zero-trust',
		title: 'Zero-trust networking with NetworkPolicies',
		scenario:
			'By default every Pod can talk to every other Pod. Lock a database down so ONLY the API tier can reach it — micro-segmentation.',
		difficulty: 'advanced',
		minutes: 25,
		tags: ['NetworkPolicy', 'CNI', 'security'],
		prerequisites: [
			'A policy-enforcing CNI. Start a fresh cluster with Calico:',
			'minikube delete && minikube start --cni=calico',
		],
		whatYouLearn: [
			'Prove the default is allow-all',
			'Apply a default-deny ingress policy',
			'Selectively allow traffic by Pod label',
		],
		interviewAngle:
			'NetworkPolicies are the answer to \u201chow do you restrict Pod-to-Pod traffic?\u201d. The gotcha they love: policies need a CNI that enforces them (Calico/Cilium), and selecting a Pod flips it to default-deny.',
		steps: [
			{
				title: 'Set up a db and two client Pods',
				code: `kubectl create namespace secure
kubectl -n secure run db --image=nginx --labels=app=db --port=80
kubectl -n secure expose pod db --port=80
kubectl -n secure run api  --image=busybox --labels=app=api  -- sleep 3600
kubectl -n secure run rogue --image=busybox --labels=app=rogue -- sleep 3600`,
				lang: 'bash',
			},
			{
				title: 'Confirm the default is allow-all (both reach db)',
				code: `kubectl -n secure exec api   -- wget -qO- --timeout=3 http://db && echo "api OK"
kubectl -n secure exec rogue -- wget -qO- --timeout=3 http://db && echo "rogue OK"`,
				lang: 'bash',
			},
			{
				title: 'Apply default-deny for all ingress in the namespace',
				code: `kubectl apply -n secure -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress }
spec:
  podSelector: {}
  policyTypes: ["Ingress"]
EOF`,
				lang: 'bash',
			},
			{
				title: 'Now BOTH clients are blocked',
				code: `kubectl -n secure exec api   -- wget -qO- --timeout=3 http://db || echo "api blocked"
kubectl -n secure exec rogue -- wget -qO- --timeout=3 http://db || echo "rogue blocked"`,
				lang: 'bash',
			},
			{
				title: 'Allow ONLY app=api to reach the db',
				code: `kubectl apply -n secure -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-api-to-db }
spec:
  podSelector: { matchLabels: { app: db } }
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - podSelector: { matchLabels: { app: api } }
EOF`,
				lang: 'bash',
			},
			{
				title: 'Verify: api can reach db, rogue still cannot',
				code: `kubectl -n secure exec api   -- wget -qO- --timeout=3 http://db && echo "api OK"
kubectl -n secure exec rogue -- wget -qO- --timeout=3 http://db || echo "rogue still blocked"`,
				lang: 'bash',
			},
		],
		verify: [
			'Step 2: both clients reach db. Step 4: both blocked. Step 6: only `api` reaches db.',
			"If NOTHING is ever blocked, your CNI isn't enforcing policies — restart Minikube with --cni=calico.",
		],
		cleanup: 'kubectl delete namespace secure',
	},
	{
		id: 'statefulset-database',
		title: 'Stateful database with a StatefulSet',
		scenario:
			"Run a database that keeps its data and a stable identity across restarts and rescheduling — the job Deployments can't do.",
		difficulty: 'advanced',
		minutes: 25,
		tags: [
			'StatefulSet',
			'headless Service',
			'volumeClaimTemplates',
			'PVC',
		],
		prerequisites: ['A running Minikube cluster'],
		whatYouLearn: [
			'Why StatefulSets exist (stable names + stable storage)',
			'Per-Pod PVCs via volumeClaimTemplates',
			'Data survives Pod deletion and rescheduling',
		],
		interviewAngle:
			'\u201cDeployment vs StatefulSet\u2014when and why?\u201d is a staple. The concrete proof: delete the Pod, it returns as the SAME name bound to the SAME PVC, with data intact.',
		steps: [
			{
				title: 'Create a headless Service for stable DNS',
				body: 'clusterIP: None gives each Pod its own DNS record (postgres-0.postgres).',
				code: `kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata: { name: postgres }
spec:
  clusterIP: None
  selector: { app: postgres }
  ports: [{ port: 5432 }]
EOF`,
				lang: 'bash',
			},
			{
				title: 'Create the StatefulSet with a per-Pod PVC',
				code: `kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: StatefulSet
metadata: { name: postgres }
spec:
  serviceName: postgres
  replicas: 1
  selector: { matchLabels: { app: postgres } }
  template:
    metadata: { labels: { app: postgres } }
    spec:
      containers:
        - name: postgres
          image: postgres:16
          env:
            - { name: POSTGRES_PASSWORD, value: pw }
            - { name: PGDATA, value: /var/lib/postgresql/data/pgdata }
          volumeMounts:
            - { name: data, mountPath: /var/lib/postgresql/data }
  volumeClaimTemplates:
    - metadata: { name: data }
      spec:
        accessModes: ["ReadWriteOnce"]
        resources: { requests: { storage: 1Gi } }
EOF
kubectl rollout status statefulset/postgres`,
				lang: 'bash',
			},
			{
				title: 'Write some data',
				code: `kubectl exec -it postgres-0 -- psql -U postgres -c \\
  "CREATE TABLE greetings(msg text); INSERT INTO greetings VALUES ('survives restarts');"`,
				lang: 'bash',
			},
			{
				title: 'Delete the Pod — it returns with the same identity',
				code: `kubectl delete pod postgres-0
kubectl rollout status statefulset/postgres
kubectl get pvc   # data-postgres-0 is the SAME PVC, reused`,
				lang: 'bash',
			},
			{
				title: 'Confirm the data survived',
				code: `kubectl exec -it postgres-0 -- psql -U postgres -c "SELECT * FROM greetings;"`,
				lang: 'bash',
			},
		],
		verify: [
			'After deleting the Pod it comes back as postgres-0 (same name), bound to the same PVC data-postgres-0.',
			"The SELECT still returns 'survives restarts' — the data persisted.",
		],
		cleanup:
			'kubectl delete statefulset postgres && kubectl delete service postgres && kubectl delete pvc data-postgres-0',
	},
];

export const LAB_TAGS = Array.from(new Set(LABS.flatMap(l => l.tags))).sort();

export function getLab(id: string): Lab | undefined {
	return LABS.find(l => l.id === id);
}
