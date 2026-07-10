# Lesson 34 — Network Policies

## Theory

By default, **all Pods can communicate with all other Pods** across all namespaces — there are no network restrictions. **NetworkPolicies** let you define firewall rules at the Pod level using label selectors.

> ⚠️ NetworkPolicies only work if your CNI plugin supports them. **Flannel does NOT support NetworkPolicies.** Use **Calico**, **Cilium**, or **Weave** (with NetworkPolicy support). Minikube default CNI does not enforce NetworkPolicies — this lesson is conceptual + YAML practice.

### Key Concepts

- A NetworkPolicy is **applied to a group of Pods** (via `podSelector`).
- It defines **ingress** (incoming) and/or **egress** (outgoing) rules.
- If a Pod has **at least one NetworkPolicy selecting it**, only traffic matching the rules is allowed. Otherwise all traffic is allowed.
- An empty `podSelector: {}` selects **all Pods** in the namespace.

### Default Behaviors (no NetworkPolicy → open)

| Without any NetworkPolicy | With at least one NetworkPolicy          |
| ------------------------- | ---------------------------------------- |
| All ingress allowed       | Only allowed ingress from matching rules |
| All egress allowed        | Only allowed egress from matching rules  |

### Rule Selectors

| Field               | Selects                                   |
| ------------------- | ----------------------------------------- |
| `podSelector`       | Pods (by label) within the same namespace |
| `namespaceSelector` | All Pods in matching namespaces           |
| `ipBlock`           | IP address ranges (CIDR)                  |

---

## YAML

**Deny all ingress (default-deny pattern):**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
    name: deny-all-ingress
    namespace: default
spec:
    podSelector: {} # applies to all Pods in namespace
    policyTypes:
        - Ingress
    # no ingress rules = deny all ingress
```

**Allow specific ingress:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
    name: allow-frontend-to-backend
spec:
    podSelector:
        matchLabels:
            app: backend # this policy applies to backend Pods
    policyTypes:
        - Ingress
    ingress:
        - from:
              - podSelector:
                    matchLabels:
                        app: frontend # only allow ingress from frontend Pods
          ports:
              - protocol: TCP
                port: 8080
```

**Allow egress to specific namespace:**

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
    name: allow-egress-to-db-ns
spec:
    podSelector:
        matchLabels:
            app: backend
    policyTypes:
        - Egress
    egress:
        - to:
              - namespaceSelector:
                    matchLabels:
                        kubernetes.io/metadata.name: database
          ports:
              - protocol: TCP
                port: 5432
        - ports: # allow DNS
              - protocol: UDP
                port: 53
              - protocol: TCP
                port: 53
```

---

## Lab

> Minikube's default bridge CNI doesn't enforce NetworkPolicies. The YAML applies cleanly but rules are not enforced. To test enforcement, use Minikube with Calico: `minikube start --cni=calico`.

### 1. Set up test Pods

```bash
kubectl run frontend --image=nginx:1.25 --labels="app=frontend"
kubectl run backend  --image=nginx:1.25 --labels="app=backend"
kubectl run db       --image=nginx:1.25 --labels="app=db"

kubectl expose pod frontend --port=80 --name=frontend-svc
kubectl expose pod backend  --port=80 --name=backend-svc
kubectl expose pod db       --port=80 --name=db-svc
```

### 2. Verify all Pods can talk before NetworkPolicy

```bash
# Frontend can reach backend
kubectl exec frontend -- wget -qO- backend-svc --timeout=2

# Backend can reach db
kubectl exec backend -- wget -qO- db-svc --timeout=2
```

### 3. Default-deny all ingress to backend

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-deny-all
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
EOF

# On a Calico-enabled cluster, this would now block:
kubectl exec frontend -- wget -qO- backend-svc --timeout=2
# → Times out (if CNI enforces)
```

### 4. Allow only frontend → backend on port 80

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 80
EOF

kubectl get networkpolicy
# frontend → backend: allowed
# db → backend: blocked
```

### 5. Allow cross-namespace traffic

```bash
kubectl create namespace monitoring
kubectl label namespace monitoring kubernetes.io/metadata.name=monitoring
kubectl run prometheus --image=nginx:1.25 -n monitoring

cat <<'EOF' | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-monitoring
  namespace: default
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: monitoring
EOF
```

### 6. List and describe NetworkPolicies

```bash
kubectl get networkpolicy
kubectl describe networkpolicy allow-frontend-to-backend
```

### Cleanup

```bash
kubectl delete pod frontend backend db 2>/dev/null; true
kubectl delete service frontend-svc backend-svc db-svc 2>/dev/null; true
kubectl delete networkpolicy backend-deny-all allow-frontend-to-backend allow-monitoring 2>/dev/null; true
kubectl delete namespace monitoring 2>/dev/null; true
```

---

## Next

Security section complete. Move on to Lesson 35 — Storage in Docker vs Kubernetes.
