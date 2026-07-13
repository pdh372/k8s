# Lesson 8 — Manual Scheduling

## Theory

The **kube-scheduler** automatically selects a Node for every Pod that has `spec.nodeName` unset. If you want to bypass the scheduler — or if the scheduler is not running — you can manually assign a Pod to a Node by setting `spec.nodeName` directly.

### How It Works

1. A new Pod is created with `nodeName: ""` — it enters `Pending` state.
2. The scheduler watches for Pending Pods, runs its algorithm, and **binds** the Pod to a Node by updating `spec.nodeName`.
3. The kubelet on that Node sees the Pod assigned to it and starts the containers.

If you set `spec.nodeName` yourself, the scheduler is skipped entirely.

### Binding API (for already-running Pods)

`spec.nodeName` is **immutable** — you cannot change it on an existing Pod via `kubectl edit`. To reschedule an existing Pod to a different Node you must:

1. Delete the Pod and recreate it with the desired `nodeName`, **or**
2. POST a `Binding` object to the API server:

```bash
curl -X POST \
  http://<api-server>/api/v1/namespaces/default/pods/<pod-name>/binding \
  -H "Content-Type: application/json" \
  -d '{
    "apiVersion": "v1",
    "kind": "Binding",
    "metadata": {"name": "<pod-name>"},
    "target": {"apiVersion": "v1", "kind": "Node", "name": "<node-name>"}
  }'
```

---

## YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: nginx-manual
spec:
    nodeName: minikube # skip scheduler; force this Node
    containers:
        - name: nginx
          image: nginx:1.25
```

---

## Lab

### 1. Find available Nodes

```bash
kubectl get nodes
```

On Minikube there is only one Node: `minikube`. On a multi-node cluster there would be multiple.

### 2. Create a Pod with manual scheduling

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx-manual
spec:
  nodeName: minikube
  containers:
    - name: nginx
      image: nginx:1.25
EOF
```

Confirm it landed on the expected Node:

```bash
kubectl get pod nginx-manual -o wide    # NODE column should show "minikube"
kubectl describe pod nginx-manual | grep Node:
```

### 3. Observe what happens when the scheduler is absent

To simulate manual scheduling necessity, add an impossible `nodeSelector` so the scheduler can't place it — then fix it with `nodeName`:

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: stuck-pod
spec:
  nodeSelector:
    kubernetes.io/hostname: nonexistent-node
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pod stuck-pod    # STATUS: Pending
kubectl describe pod stuck-pod | tail -10    # Events: FailedScheduling
```

Delete and recreate with explicit `nodeName` instead:

```bash
kubectl delete pod stuck-pod

cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: fixed-pod
spec:
  nodeName: minikube
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pod fixed-pod -o wide
```

### 4. Multi-node simulation (Minikube)

If you want to practice with multiple nodes:

```bash
minikube node add    # adds a second node: m02
kubectl get nodes    # should show minikube + minikube-m02

# Schedule to the second node
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: nginx-node2
spec:
  nodeName: minikube-m02
  containers:
    - name: nginx
      image: nginx:1.25
EOF
kubectl get pod nginx-node2 -o wide

# Cleanup extra node when done
minikube node delete minikube-m02
```

### Cleanup

```bash
kubectl delete pod nginx-manual stuck-pod fixed-pod nginx-node2 2>/dev/null; true
```

---

## Next

Move on to Lesson 9 — Labels and Selectors.
