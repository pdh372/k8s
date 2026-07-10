# Lesson 6 — Namespaces

## Theory

A **Namespace** is a logical partition of a Kubernetes cluster. Objects in different namespaces are isolated by name — you can have two Deployments both named `nginx` as long as they live in different namespaces.

Namespaces do **not** provide network isolation by default (all Pods can still reach all other Pods). Network isolation is handled by NetworkPolicies (Lesson 34).

### Built-in Namespaces

| Namespace         | Purpose                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `default`         | Where objects land when you don't specify a namespace                   |
| `kube-system`     | Kubernetes internal components (API server, etcd, CoreDNS, kube-proxy…) |
| `kube-public`     | Readable by all users; holds the `cluster-info` ConfigMap               |
| `kube-node-lease` | Node heartbeat lease objects — internal, never touch                    |

### Namespace-scoped vs Cluster-scoped Resources

Some resources live inside a namespace (Pods, Deployments, Services, ConfigMaps, Secrets…). Others are cluster-wide (Nodes, PersistentVolumes, ClusterRoles, Namespaces themselves).

```bash
kubectl api-resources --namespaced=true     # namespace-scoped
kubectl api-resources --namespaced=false    # cluster-scoped
```

### Cross-Namespace DNS

```
Same namespace:       http://my-service
Other namespace:      http://my-service.other-ns.svc.cluster.local
```

---

## Lab

### 1. List namespaces

```bash
kubectl get namespaces
kubectl get ns    # short alias
```

### 2. Create namespaces

```bash
kubectl create namespace dev
kubectl create namespace prod
kubectl get ns
```

Or via YAML:

```yaml
apiVersion: v1
kind: Namespace
metadata:
    name: staging
```

### 3. Run objects in a specific namespace

```bash
kubectl run nginx-dev --image=nginx:1.25 -n dev
kubectl get pods -n dev
kubectl get pods          # only default namespace shown
kubectl get pods -A       # all namespaces
```

### 4. Set default namespace for your current context

```bash
kubectl config set-context --current --namespace=dev
kubectl get pods    # now defaults to dev without -n flag

# Reset
kubectl config set-context --current --namespace=default
```

### 5. Cross-namespace communication

```bash
kubectl expose pod nginx-dev --port=80 --name=nginx-svc -n dev

# From default namespace, reach the service in dev
kubectl run test --image=busybox --rm -it --restart=Never -- \
  wget -qO- nginx-svc.dev.svc.cluster.local
```

### 6. ResourceQuota — limit resources per namespace

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: dev-quota
  namespace: dev
spec:
  hard:
    pods: "10"
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
EOF

kubectl describe resourcequota dev-quota -n dev
```

Try to exceed the quota and see the error:

```bash
kubectl create deployment quota-test --image=nginx --replicas=20 -n dev
kubectl get replicaset -n dev    # RS will show failed events
kubectl describe replicaset -n dev    # see quota exceeded error
```

### 7. LimitRange — set per-Pod defaults in a namespace

Without LimitRange, Pods with no `resources` specified have no limits. LimitRange injects defaults:

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: dev-limits
  namespace: dev
spec:
  limits:
    - type: Container
      default:
        cpu: 200m
        memory: 256Mi
      defaultRequest:
        cpu: 100m
        memory: 128Mi
EOF
```

### Cleanup

```bash
kubectl delete namespace dev prod    # deletes everything inside
```

---

## Next

Move on to Lesson 7 — Imperative vs Declarative Commands.
