# Lesson 3 — ReplicaSets

## Theory

A **ReplicaSet** ensures a specified number of Pod replicas are running at any time. If a Pod crashes or is deleted, the ReplicaSet controller notices the actual count dropped below desired and creates a replacement.

> In practice you rarely write a ReplicaSet directly — you write a **Deployment**, which owns a ReplicaSet. But understanding ReplicaSets first makes Deployments much clearer.

### How the Controller Loop Works

1. You declare `replicas: 3` in the ReplicaSet spec.
2. The controller watches the API server and counts Pods matching the selector.
3. `actual < desired` → creates new Pods. `actual > desired` → deletes excess Pods.
4. This loop runs continuously — this is the "self-healing" behavior.

### ReplicaSet vs ReplicationController

`ReplicationController` is the older deprecated equivalent. The key difference: ReplicaSets support **set-based selectors** (`In`, `NotIn`, `Exists`) in addition to equality-based ones. Always use ReplicaSet (or Deployment) going forward.

### The Selector — Critical Detail

`spec.selector.matchLabels` **must exactly match** the labels on the Pod template (`spec.template.metadata.labels`). If they don't match, the API server rejects the object on creation.

---

## YAML

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
    name: nginx-rs
spec:
    replicas: 3
    selector:
        matchLabels:
            app: nginx # must match template labels below
    template:
        metadata:
            labels:
                app: nginx # must match selector above
        spec:
            containers:
                - name: nginx
                  image: nginx:1.25
```

`template` is a **Pod template** — it has exactly the same structure as a Pod spec (minus `apiVersion` and `kind`), embedded directly inside the ReplicaSet.

---

## Lab

### 1. Apply the ReplicaSet

```bash
cat <<'EOF' > replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
EOF

kubectl apply -f replicaset.yaml
kubectl get replicaset
kubectl get pods -l app=nginx
```

### 2. Test self-healing

Delete one Pod manually — watch it get recreated:

```bash
POD=$(kubectl get pods -l app=nginx -o jsonpath='{.items[0].metadata.name}')
kubectl delete pod "$POD"
kubectl get pods -l app=nginx    # a new Pod appears within seconds
```

### 3. Scale

Via `kubectl scale`:

```bash
kubectl scale replicaset nginx-rs --replicas=5
kubectl get pods -l app=nginx
```

Or edit the YAML and re-apply:

```bash
# edit replicas: 3 → replicas: 2 in replicaset.yaml
kubectl apply -f replicaset.yaml
```

Via `kubectl edit` (live):

```bash
kubectl edit replicaset nginx-rs   # change replicas inline
```

### 4. Adoption of pre-existing Pods

If a Pod with `app=nginx` exists _before_ the ReplicaSet is created, the RS will **adopt** it and count it toward `replicas` — no extra Pod is created.

```bash
kubectl run orphan-nginx --image=nginx:1.25 --labels=app=nginx
kubectl get pods -l app=nginx    # RS keeps total at replicas count (no extra Pod)
```

### 5. Inspect

```bash
kubectl describe replicaset nginx-rs
```

Look at **Pods Status** and the **Events** section at the bottom — shows create/delete events.

### Cleanup

```bash
kubectl delete -f replicaset.yaml
kubectl delete pod orphan-nginx 2>/dev/null; true
```

---

## Next

Once you understand how a ReplicaSet reconciles desired vs actual Pod count, move on to Lesson 4 — Deployments.
