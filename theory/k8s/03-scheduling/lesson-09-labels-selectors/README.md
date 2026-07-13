# Lesson 9 — Labels and Selectors

## Theory

**Labels** are key/value metadata attached to any Kubernetes object. **Selectors** filter objects by those labels. This is the core mechanism that ties objects together: Services find Pods via selectors, ReplicaSets own Pods via selectors, and `kubectl get` filters via `-l`.

### Label Rules

- Key: optional prefix + `/` + name. Prefix must be a DNS subdomain (≤253 chars). Name ≤ 63 chars, alphanumeric + `-._`.
- Value: ≤63 chars, alphanumeric + `-._`, or empty.
- Max 63 labels per object (in practice).

### Selector Types

**Equality-based** (simple `=` or `!=`):

```bash
kubectl get pods -l app=nginx
kubectl get pods -l environment!=production
```

**Set-based** (more expressive, required for ReplicaSet/Deployment selectors):

```bash
kubectl get pods -l 'environment in (production, staging)'
kubectl get pods -l 'tier notin (frontend)'
kubectl get pods -l 'app'          # exists
kubectl get pods -l '!app'         # does not exist
```

**Multiple selectors** (AND logic):

```bash
kubectl get pods -l app=nginx,environment=production
```

### Annotations vs Labels

|         | Labels                  | Annotations                                 |
| ------- | ----------------------- | ------------------------------------------- |
| Purpose | Selection & grouping    | Arbitrary metadata (no selection)           |
| Used by | Selectors, controllers  | Tools, humans, external systems             |
| Example | `app=nginx`, `env=prod` | `build-version=abc123`, `maintainer=team-a` |

---

## Lab

### 1. Add labels to objects

```bash
# At creation time
kubectl run nginx-prod --image=nginx:1.25 --labels="app=nginx,env=production,tier=frontend"
kubectl run nginx-dev  --image=nginx:1.25 --labels="app=nginx,env=dev,tier=frontend"
kubectl run redis-prod --image=redis:7    --labels="app=redis,env=production,tier=cache"
```

### 2. Query with selectors

```bash
kubectl get pods --show-labels                         # show all labels
kubectl get pods -l app=nginx                          # all nginx
kubectl get pods -l env=production                     # all production
kubectl get pods -l app=nginx,env=production           # nginx AND production
kubectl get pods -l 'env in (production,dev)'          # env is prod or dev
kubectl get pods -l 'app notin (redis)'                # not redis
kubectl get pods -l 'tier'                             # has tier label
```

### 3. Add/update/remove labels on running objects

```bash
kubectl label pod nginx-dev env=staging     # add / overwrite label
kubectl label pod nginx-dev env-            # remove label (trailing dash)
kubectl get pods --show-labels
```

### 4. Label Nodes (used for scheduling)

```bash
kubectl label node minikube disk=ssd
kubectl label node minikube region=us-east-1
kubectl get nodes --show-labels

# Schedule Pod to Nodes with disk=ssd
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: ssd-pod
spec:
  nodeSelector:
    disk: ssd
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pod ssd-pod -o wide    # should land on the labeled node
```

### 5. Annotations

```bash
kubectl annotate pod nginx-prod description="primary nginx for production"
kubectl annotate pod nginx-prod maintainer="team-platform"
kubectl describe pod nginx-prod | grep -A5 Annotations
```

### 6. Selector in Service (recap)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
spec:
  selector:
    tier: frontend      # matches nginx-prod and nginx-dev
  ports:
    - port: 80
      targetPort: 80
EOF

kubectl get endpoints frontend-svc    # should list both nginx Pod IPs
```

### Cleanup

```bash
kubectl delete pod nginx-prod nginx-dev redis-prod ssd-pod 2>/dev/null; true
kubectl delete service frontend-svc 2>/dev/null; true
kubectl label node minikube disk- region- 2>/dev/null; true
```

---

## Next

Move on to Lesson 10 — Taints and Tolerations.
