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
	{
		id: 'blue-green-canary',
		title: 'Blue-green & canary releases',
		scenario:
			'Cut all traffic from v1 to v2 instantly by flipping a Service selector (blue-green), then shift traffic gradually by mixing replicas behind one Service (canary).',
		difficulty: 'intermediate',
		minutes: 20,
		tags: ['Deployment', 'Service', 'blue-green', 'canary'],
		prerequisites: ['A running Minikube cluster'],
		whatYouLearn: [
			'Blue-green cutover by switching a Service label selector',
			'Instant rollback by flipping the selector back',
			'Canary by sharing one selector and tuning replica ratios',
		],
		interviewAngle:
			'\u201cHow do you release safely?\u201d Blue-green gives an instant, reversible cutover; canary exposes the new version to a slice of traffic first. Showing it is just labels + selectors proves real understanding.',
		steps: [
			{
				title: 'Deploy blue (v1) and green (v2)',
				body: 'Both are labelled app=web, but with different version labels.',
				code: `kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: web-blue }
spec:
  replicas: 3
  selector: { matchLabels: { app: web, version: blue } }
  template:
    metadata: { labels: { app: web, version: blue } }
    spec:
      containers:
        - { name: web, image: stefanprodan/podinfo:6.5.3, ports: [{ containerPort: 9898 }] }
---
apiVersion: apps/v1
kind: Deployment
metadata: { name: web-green }
spec:
  replicas: 3
  selector: { matchLabels: { app: web, version: green } }
  template:
    metadata: { labels: { app: web, version: green } }
    spec:
      containers:
        - { name: web, image: stefanprodan/podinfo:6.5.4, ports: [{ containerPort: 9898 }] }
EOF`,
				lang: 'bash',
			},
			{
				title: 'Point the Service at BLUE only, then test',
				code: `kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Service
metadata: { name: web }
spec:
  selector: { app: web, version: blue }
  ports: [{ port: 9898, targetPort: 9898 }]
EOF
kubectl run curl --image=curlimages/curl --restart=Never -it --rm -- \\
  sh -c 'for i in $(seq 5); do curl -s web:9898/version; echo; done'`,
				lang: 'bash',
			},
			{
				title: 'Blue-green cutover: flip the selector to GREEN',
				body: 'All traffic moves to v2 in one atomic change. Roll back with the same command using "blue".',
				code: `kubectl patch service web -p '{"spec":{"selector":{"app":"web","version":"green"}}}'
kubectl run curl --image=curlimages/curl --restart=Never -it --rm -- \\
  sh -c 'for i in $(seq 5); do curl -s web:9898/version; echo; done'`,
				lang: 'bash',
			},
			{
				title: 'Canary: send a fraction of traffic to green',
				body: 'Drop the version from the selector so the Service balances across BOTH deployments, then use replica counts as the traffic ratio (5 blue : 1 green \u2248 17% canary).',
				code: `kubectl patch service web -p '{"spec":{"selector":{"app":"web"}}}'
kubectl scale deployment web-blue --replicas=5
kubectl scale deployment web-green --replicas=1
kubectl run curl --image=curlimages/curl --restart=Never -it --rm -- \\
  sh -c 'for i in $(seq 30); do curl -s web:9898/version; echo; done | sort | uniq -c'`,
				lang: 'bash',
			},
		],
		verify: [
			'After the cutover every response reports version 6.5.4 (green); patch back to blue for an instant rollback.',
			'In canary mode the uniq -c counts show mostly 6.5.3 with a few 6.5.4 \u2014 raise green replicas to shift more traffic.',
		],
		cleanup:
			'kubectl delete deploy web-blue web-green && kubectl delete service web',
	},
	{
		id: 'etcd-backup-restore',
		title: 'Back up & restore etcd (cluster DR)',
		scenario:
			'etcd holds all cluster state. Take a point-in-time snapshot, inspect it, and understand the restore flow \u2014 the skill that saves a cluster from disaster.',
		difficulty: 'advanced',
		minutes: 25,
		tags: ['etcd', 'backup', 'disaster recovery', 'CronJob'],
		prerequisites: [
			'A kubeadm-style Minikube cluster (the default docker driver)',
			'etcd runs as a static Pod in kube-system',
		],
		whatYouLearn: [
			'Take an etcd snapshot with the right endpoint + certs',
			'Verify a snapshot with snapshot status',
			'The restore procedure (new data dir) and how to automate backups',
		],
		interviewAngle:
			'etcd backup/restore is THE disaster-recovery question for CKA and ops roles. They want the etcdctl flags (endpoints, cacert, cert, key) and the key fact that restore creates a NEW data dir you must point etcd at.',
		steps: [
			{
				title: 'Find the etcd Pod name',
				code: `ETCD=$(kubectl -n kube-system get pod -l component=etcd \\
  -o jsonpath='{.items[0].metadata.name}')
echo "$ETCD"`,
				lang: 'bash',
			},
			{
				title: 'Take a snapshot (etcdctl runs inside the etcd Pod)',
				body: 'The etcd image ships etcdctl; recent versions default to API v3 so no ETCDCTL_API needed.',
				code: `kubectl -n kube-system exec "$ETCD" -- etcdctl \\
  --endpoints=https://127.0.0.1:2379 \\
  --cacert=/var/lib/minikube/certs/etcd/ca.crt \\
  --cert=/var/lib/minikube/certs/etcd/server.crt \\
  --key=/var/lib/minikube/certs/etcd/server.key \\
  snapshot save /var/lib/minikube/etcd/snapshot.db`,
				lang: 'bash',
			},
			{
				title: 'Verify the snapshot',
				code: `kubectl -n kube-system exec "$ETCD" -- etcdctl \\
  --write-out=table snapshot status /var/lib/minikube/etcd/snapshot.db`,
				lang: 'bash',
			},
			{
				title: 'Restore procedure (⚠️ destructive — read before running)',
				body: 'Restore never overwrites live data in place: it writes a NEW data dir, then you point etcd at it. On kubeadm/Minikube you edit the etcd static-Pod manifest so the kubelet restarts etcd from the restored dir.',
				code: `# On the node (minikube ssh), restore into a fresh directory:
sudo etcdctl snapshot restore /var/lib/minikube/etcd/snapshot.db \\
  --data-dir /var/lib/minikube/etcd-restore

# Then edit /etc/kubernetes/manifests/etcd.yaml and change the
# etcd-data hostPath volume to /var/lib/minikube/etcd-restore.
# The kubelet detects the change and restarts etcd from the snapshot.`,
				lang: 'bash',
			},
			{
				title: 'Bonus: automate nightly backups with a CronJob',
				body: 'Runs on the control-plane node with hostNetwork + the etcd certs mounted from the host.',
				code: `kubectl apply -f - <<'EOF'
apiVersion: batch/v1
kind: CronJob
metadata: { name: etcd-backup, namespace: kube-system }
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          hostNetwork: true
          nodeSelector: { node-role.kubernetes.io/control-plane: "" }
          tolerations: [{ operator: Exists }]
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: registry.k8s.io/etcd:3.5.15-0
              command: ["etcdctl"]
              args:
                - "--endpoints=https://127.0.0.1:2379"
                - "--cacert=/certs/ca.crt"
                - "--cert=/certs/server.crt"
                - "--key=/certs/server.key"
                - "snapshot"
                - "save"
                - "/backup/etcd-snapshot.db"
              volumeMounts:
                - { name: certs, mountPath: /certs, readOnly: true }
                - { name: backup, mountPath: /backup }
          volumes:
            - name: certs
              hostPath: { path: /var/lib/minikube/certs/etcd }
            - name: backup
              hostPath: { path: /var/lib/minikube/etcd-backups }
EOF`,
				lang: 'bash',
			},
		],
		verify: [
			'snapshot status prints a table with a hash, revision and total key count — that means the snapshot is valid.',
			'kubectl -n kube-system get cronjob etcd-backup shows the schedule; trigger it now with: kubectl -n kube-system create job --from=cronjob/etcd-backup manual-backup',
			'In production you ship the snapshot OFF the node (to object storage) — a backup on the same disk as etcd is not a backup.',
		],
		cleanup:
			'kubectl -n kube-system delete cronjob etcd-backup --ignore-not-found && kubectl -n kube-system delete job manual-backup --ignore-not-found',
	},
	{
		id: 'ingress-tls',
		title: 'HTTPS at the Ingress with a self-signed cert',
		scenario:
			'Serve an app over HTTPS by terminating TLS at the Ingress using a certificate stored in a Secret \u2014 exactly how real ingress TLS works.',
		difficulty: 'intermediate',
		minutes: 20,
		tags: ['Ingress', 'TLS', 'Secret'],
		prerequisites: [
			'Ingress addon: minikube addons enable ingress',
			'openssl installed locally',
		],
		whatYouLearn: [
			'Create a kubernetes.io/tls Secret from a cert + key',
			'Reference it in an Ingress tls block',
			'Verify the TLS handshake end to end',
		],
		interviewAngle:
			'\u201cHow does Ingress do TLS?\u201d The answer: a tls Secret referenced by the Ingress, and the controller terminates TLS then forwards plaintext to the Service. Being able to wire it up is a common real task.',
		steps: [
			{
				title: 'Deploy an app to put behind HTTPS',
				code: `kubectl create deployment web --image=stefanprodan/podinfo:6.5.4
kubectl expose deployment web --port=9898`,
				lang: 'bash',
			},
			{
				title: 'Generate a self-signed cert for demo.local',
				code: `openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\
  -keyout tls.key -out tls.crt \\
  -subj "/CN=demo.local/O=demo" \\
  -addext "subjectAltName=DNS:demo.local"`,
				lang: 'bash',
			},
			{
				title: 'Store the cert in a TLS Secret',
				code: 'kubectl create secret tls demo-tls --cert=tls.crt --key=tls.key',
				lang: 'bash',
			},
			{
				title: 'Create the Ingress with a tls block',
				code: `kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: web }
spec:
  tls:
    - hosts: [demo.local]
      secretName: demo-tls
  rules:
    - host: demo.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: web, port: { number: 9898 } }
EOF
echo "$(minikube ip)  demo.local" | sudo tee -a /etc/hosts`,
				lang: 'bash',
			},
			{
				title: 'Test HTTPS',
				body: '-k skips trust (self-signed); --cacert tls.crt validates against your own cert.',
				code: `curl -k https://demo.local/
curl --cacert tls.crt https://demo.local/version`,
				lang: 'bash',
			},
		],
		verify: [
			'curl -kv https://demo.local shows a TLS handshake and the app response.',
			'The served certificate has CN=demo.local — the one you created, loaded from the Secret.',
		],
		cleanup:
			'kubectl delete ingress web && kubectl delete secret demo-tls && kubectl delete deployment web && kubectl delete service web && rm -f tls.key tls.crt',
	},
	{
		id: 'configmap-hot-reload',
		title: 'ConfigMap hot-reload (volume vs env)',
		scenario:
			'Change app config without rebuilding an image \u2014 and learn the gotcha: a mounted ConfigMap updates live, but env vars from a ConfigMap do NOT.',
		difficulty: 'intermediate',
		minutes: 15,
		tags: ['ConfigMap', 'volume', 'hot-reload'],
		prerequisites: ['A running Minikube cluster'],
		whatYouLearn: [
			'Mount a ConfigMap as a volume and as env vars',
			'Volume-mounted config refreshes live (~1 min); env vars are frozen at start',
			'Use rollout restart to pick up env changes',
		],
		interviewAngle:
			'\u201cIf you edit a ConfigMap, does the Pod see it?\u201d Volume mount: yes, after the kubelet sync (~1 min). Env var: no \u2014 you must restart the Pod. This nuance is a frequent trick question.',
		steps: [
			{
				title: 'Create a ConfigMap',
				code: `kubectl create configmap app-config --from-literal=greeting='hello v1'`,
				lang: 'bash',
			},
			{
				title: 'Deploy a Pod that consumes it BOTH ways',
				code: `kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: config-demo }
spec:
  selector: { matchLabels: { app: config-demo } }
  template:
    metadata: { labels: { app: config-demo } }
    spec:
      containers:
        - name: app
          image: busybox
          command: ["sh", "-c", "sleep 3600"]
          env:
            - name: GREETING
              valueFrom: { configMapKeyRef: { name: app-config, key: greeting } }
          volumeMounts:
            - { name: cfg, mountPath: /config }
      volumes:
        - name: cfg
          configMap: { name: app-config }
EOF
kubectl rollout status deployment/config-demo`,
				lang: 'bash',
			},
			{
				title: 'Read both sources (should show v1)',
				code: `kubectl exec deploy/config-demo -- cat /config/greeting; echo
kubectl exec deploy/config-demo -- printenv GREETING`,
				lang: 'bash',
			},
			{
				title: 'Update the ConfigMap to v2',
				code: `kubectl create configmap app-config --from-literal=greeting='hello v2' \\
  --dry-run=client -o yaml | kubectl apply -f -`,
				lang: 'bash',
			},
			{
				title: 'Wait ~60s, then read again',
				body: 'The mounted FILE now shows v2; the ENV VAR is still v1.',
				code: `sleep 70
kubectl exec deploy/config-demo -- cat /config/greeting; echo   # hello v2
kubectl exec deploy/config-demo -- printenv GREETING            # still hello v1`,
				lang: 'bash',
			},
			{
				title: 'Restart to refresh the env var',
				code: `kubectl rollout restart deployment/config-demo
kubectl rollout status deployment/config-demo
kubectl exec deploy/config-demo -- printenv GREETING            # now hello v2`,
				lang: 'bash',
			},
		],
		verify: [
			'After the update the mounted file becomes "hello v2" with no restart; the env var stays "hello v1".',
			'Only after rollout restart does the env var become "hello v2".',
		],
		cleanup:
			'kubectl delete deployment config-demo && kubectl delete configmap app-config',
	},
	{
		id: 'scheduling-taints-affinity',
		title: 'Steer Pods with taints, tolerations & affinity',
		scenario:
			'Reserve a node for special workloads so ordinary Pods stay off it, and pull the right Pods onto it \u2014 the core of real scheduling control.',
		difficulty: 'intermediate',
		minutes: 20,
		tags: ['taints', 'tolerations', 'node affinity', 'scheduling'],
		prerequisites: [
			'A 2-node cluster so placement is observable:',
			'minikube start --nodes 2',
		],
		whatYouLearn: [
			'Taint a node so untolerated Pods avoid it (NoSchedule)',
			'Add a toleration so a Pod is allowed onto it',
			'Use nodeAffinity to REQUIRE placement on a labelled node',
		],
		interviewAngle:
			'The classic distinction: taints REPEL from the node side; affinity ATTRACTS from the Pod side. A toleration only permits placement \u2014 it does not force it; that is what nodeAffinity is for.',
		steps: [
			{
				title: 'Label and taint the second node',
				code: `kubectl label node minikube-m02 tier=gpu
kubectl taint node minikube-m02 dedicated=gpu:NoSchedule
kubectl describe node minikube-m02 | grep -A2 Taints`,
				lang: 'bash',
			},
			{
				title: 'Deploy a normal app — it avoids the tainted node',
				code: `kubectl create deployment normal --image=nginx --replicas=4
kubectl get pods -l app=normal -o wide   # all on minikube (node 1), none on m02`,
				lang: 'bash',
			},
			{
				title: 'Deploy a workload that tolerates the taint AND requires the node',
				body: 'The toleration lets it onto m02; the nodeAffinity forces it there.',
				code: `kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata: { name: gpu-app }
spec:
  replicas: 2
  selector: { matchLabels: { app: gpu-app } }
  template:
    metadata: { labels: { app: gpu-app } }
    spec:
      tolerations:
        - { key: dedicated, operator: Equal, value: gpu, effect: NoSchedule }
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
              - matchExpressions:
                  - { key: tier, operator: In, values: [gpu] }
      containers:
        - { name: app, image: nginx }
EOF
kubectl get pods -l app=gpu-app -o wide   # both on minikube-m02`,
				lang: 'bash',
			},
		],
		verify: [
			'kubectl get pods -o wide: the "normal" Pods are all on node 1; the "gpu-app" Pods are on minikube-m02.',
			'Remove just the toleration OR the affinity and re-apply to see how each part changes placement.',
		],
		cleanup:
			'kubectl delete deploy normal gpu-app && kubectl taint node minikube-m02 dedicated=gpu:NoSchedule- && kubectl label node minikube-m02 tier-',
	},
	{
		id: 'jobs-parallelism',
		title: 'Batch work with Jobs & parallelism',
		scenario:
			'Run a batch workload to completion — process a fixed number of work items across several Pods in parallel, with retries and auto-cleanup.',
		difficulty: 'intermediate',
		minutes: 15,
		tags: ['Job', 'parallelism', 'batch'],
		prerequisites: ['A running Minikube cluster'],
		whatYouLearn: [
			'completions vs parallelism',
			'backoffLimit for retries and ttlSecondsAfterFinished for cleanup',
			'Indexed Jobs where each Pod gets a unique shard number',
		],
		interviewAngle:
			'\u201cDeployment vs Job?\u201d A Deployment keeps Pods running forever; a Job runs Pods to completion. Knowing completions/parallelism/backoffLimit and Indexed mode proves you understand batch workloads.',
		steps: [
			{
				title: 'Run a parallel Job: 6 items, 2 at a time',
				code: `kubectl apply -f - <<'EOF'
apiVersion: batch/v1
kind: Job
metadata: { name: batch }
spec:
  completions: 6
  parallelism: 2
  backoffLimit: 4
  ttlSecondsAfterFinished: 120
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: work
          image: busybox
          command: ["sh", "-c", "echo processing on $(hostname); sleep 5"]
EOF`,
				lang: 'bash',
			},
			{
				title: 'Watch Pods run two at a time until 6 complete',
				code: `kubectl get pods -l job-name=batch -w
# in another view:
kubectl get job batch   # COMPLETIONS climbs to 6/6`,
				lang: 'bash',
			},
			{
				title: 'Indexed Job — each Pod knows its own shard',
				body: 'completionMode: Indexed injects JOB_COMPLETION_INDEX (0..N-1), so each Pod can own a distinct slice of the work.',
				code: `kubectl apply -f - <<'EOF'
apiVersion: batch/v1
kind: Job
metadata: { name: shards }
spec:
  completions: 4
  parallelism: 4
  completionMode: Indexed
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: work
          image: busybox
          command: ["sh", "-c", "echo I am shard $JOB_COMPLETION_INDEX; sleep 3"]
EOF
kubectl wait --for=condition=complete job/shards --timeout=60s
kubectl logs -l job-name=shards --prefix | sort`,
				lang: 'bash',
			},
		],
		verify: [
			'kubectl get job batch shows COMPLETIONS 6/6; only 2 Pods ran at any moment.',
			'The shards Job logs print "I am shard 0/1/2/3" — one unique index per Pod.',
		],
		cleanup: 'kubectl delete job batch shards --ignore-not-found',
	},
	{
		id: 'pdb-drain',
		title: 'Protect availability during a node drain (PDB)',
		scenario:
			'Drain a node for maintenance without letting your app dip below a safe number of replicas — a PodDisruptionBudget blocks disruptive evictions.',
		difficulty: 'advanced',
		minutes: 20,
		tags: ['PodDisruptionBudget', 'drain', 'availability'],
		prerequisites: [
			'A 2-node cluster so Pods can move during a drain:',
			'minikube start --nodes 2',
		],
		whatYouLearn: [
			'Set a PDB with minAvailable',
			'How kubectl drain evicts Pods while respecting the PDB',
			'When a PDB blocks a drain entirely',
		],
		interviewAngle:
			'\u201cHow do you keep an app available during node maintenance?\u201d A PDB. The subtlety they probe: a PDB only guards VOLUNTARY disruptions (drain / the eviction API), not a node crash.',
		steps: [
			{
				title: 'Deploy 3 replicas and a PDB requiring 2 to stay up',
				code: `kubectl create deployment web --image=stefanprodan/podinfo:6.5.4 --replicas=3
kubectl apply -f - <<'EOF'
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: web-pdb }
spec:
  minAvailable: 2
  selector: { matchLabels: { app: web } }
EOF
kubectl get pods -l app=web -o wide   # note which node each is on`,
				lang: 'bash',
			},
			{
				title: 'Drain a worker node — the PDB paces the eviction',
				body: 'Drain evicts Pods one at a time; it will not drop below minAvailable=2, so the Deployment reschedules onto the other node between evictions.',
				code: `kubectl drain minikube-m02 --ignore-daemonsets --delete-emptydir-data
kubectl get pods -l app=web -o wide   # all Pods now on node 1, none lost`,
				lang: 'bash',
			},
			{
				title: 'Uncordon, then make the PDB BLOCK a drain',
				body: 'With 2 replicas and minAvailable: 2, evicting even one Pod would violate the budget — so drain refuses.',
				code: `kubectl uncordon minikube-m02
kubectl scale deployment web --replicas=2
kubectl get pdb web-pdb        # ALLOWED DISRUPTIONS: 0
kubectl drain minikube-m02 --ignore-daemonsets --delete-emptydir-data --timeout=20s
# -> "Cannot evict pod ... would violate the pod's disruption budget."`,
				lang: 'bash',
			},
		],
		verify: [
			'During the first drain, kubectl get pdb shows ALLOWED DISRUPTIONS \u2265 1 and no downtime.',
			'After scaling to 2 with minAvailable 2, the drain is refused with the disruption-budget message.',
		],
		cleanup:
			'kubectl uncordon minikube-m02 ; kubectl delete deployment web && kubectl delete pdb web-pdb',
	},
	{
		id: 'hpa-custom-metrics',
		title: 'Autoscale on custom metrics (requests/sec)',
		scenario:
			'Scale on a business signal like HTTP requests-per-second instead of CPU, by exposing app metrics to the HPA through the custom metrics API.',
		difficulty: 'advanced',
		minutes: 30,
		tags: ['HPA', 'custom metrics', 'Prometheus', 'autoscaling'],
		prerequisites: [
			'A running Minikube cluster with Helm installed',
			'Understand the CPU-based HPA lab first',
		],
		whatYouLearn: [
			'The custom.metrics.k8s.io API and how an adapter serves it',
			'Wire Prometheus + prometheus-adapter to feed the HPA',
			'An autoscaling/v2 HPA that targets a Pods metric',
		],
		interviewAngle:
			'\u201cCan the HPA scale on anything other than CPU?\u201d Yes \u2014 CPU/memory come from metrics-server, but custom/external metrics come from an adapter (prometheus-adapter or KEDA) serving the custom.metrics.k8s.io API. Naming the moving parts is what they want.',
		steps: [
			{
				title: 'The pipeline',
				body: 'App exposes /metrics → Prometheus scrapes it → prometheus-adapter serves custom.metrics.k8s.io → the HPA reads the metric. (KEDA is a simpler production alternative that ships its own metrics adapter.)',
			},
			{
				title: 'Install Prometheus + the adapter with Helm',
				code: `helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prom prometheus-community/kube-prometheus-stack \\
  -n monitoring --create-namespace
helm install padapter prometheus-community/prometheus-adapter -n monitoring \\
  --set prometheus.url=http://prom-kube-prometheus-stack-prometheus.monitoring.svc \\
  --set prometheus.port=9090`,
				lang: 'bash',
			},
			{
				title: 'Deploy an app that exports a request metric',
				body: 'podinfo exposes http_requests_total; a ServiceMonitor tells Prometheus to scrape it.',
				code: `kubectl create deployment podinfo --image=stefanprodan/podinfo:6.5.4
kubectl expose deployment podinfo --port=9898
kubectl label deployment podinfo app=podinfo --overwrite
kubectl apply -f - <<'EOF'
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata: { name: podinfo, labels: { release: prom } }
spec:
  selector: { matchLabels: { app: podinfo } }
  endpoints: [{ port: "9898", path: /metrics, interval: 15s }]
EOF`,
				lang: 'bash',
			},
			{
				title: 'Confirm the custom metric is being served',
				body: 'Once the adapter maps the Prometheus series, the custom metrics API returns a value. (Adapter rules map the raw series to a metric name — the fiddly part; the chart ships sensible defaults for http_requests.)',
				code: `kubectl get --raw \\
  "/apis/custom.metrics.k8s.io/v1beta1/namespaces/default/pods/*/http_requests" | jq .`,
				lang: 'bash',
			},
			{
				title: 'Create an autoscaling/v2 HPA on the custom metric',
				code: `kubectl apply -f - <<'EOF'
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: podinfo }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: podinfo }
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: Pods
      pods:
        metric: { name: http_requests }
        target: { type: AverageValue, averageValue: "10" }
EOF
kubectl get hpa podinfo -w`,
				lang: 'bash',
			},
			{
				title: 'Generate load and watch it scale on RPS',
				code: `kubectl run -it --rm load --image=busybox --restart=Never -- \\
  /bin/sh -c 'while true; do wget -q -O- http://podinfo:9898 >/dev/null; done'`,
				lang: 'bash',
			},
		],
		verify: [
			'kubectl get --raw .../custom.metrics.k8s.io/... returns a numeric value for http_requests.',
			'Under load, kubectl get hpa podinfo shows the TARGETS column tracking requests/sec and REPLICAS climbing.',
		],
		cleanup:
			'kubectl delete hpa podinfo && kubectl delete deployment podinfo && kubectl delete svc podinfo && kubectl delete servicemonitor podinfo -n default --ignore-not-found ; helm uninstall padapter -n monitoring ; helm uninstall prom -n monitoring',
	},
];

export const LAB_TAGS = Array.from(new Set(LABS.flatMap(l => l.tags))).sort();

export function getLab(id: string): Lab | undefined {
	return LABS.find(l => l.id === id);
}
