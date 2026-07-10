# Lesson 24 — OS Upgrades (Node Maintenance)

## Theory

When you need to take a Node offline for maintenance (OS patching, hardware replacement, kernel upgrade), you must safely move its workloads off first. Kubernetes provides three commands for this:

| Command                   | Effect                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `kubectl cordon <node>`   | Marks Node as **unschedulable** — no new Pods will be placed here, existing Pods continue running |
| `kubectl drain <node>`    | Cordons the Node **and** evicts all Pods off it (gracefully), moving them to other Nodes          |
| `kubectl uncordon <node>` | Marks Node as **schedulable** again after maintenance                                             |

### `kubectl drain` Details

Drain evicts Pods via the Eviction API (respects `PodDisruptionBudgets`). It:

- Deletes standalone Pods (not owned by a controller) — they are **lost**
- Evicts Pods owned by ReplicaSets/Deployments (they are rescheduled elsewhere)
- **Does not evict** Pods with `local storage` unless `--delete-emptydir-data` is passed
- **Does not evict** DaemonSet-managed Pods unless `--ignore-daemonsets` is passed

### PodDisruptionBudget (PDB)

A PDB declares the minimum available (or maximum unavailable) replicas for a workload during voluntary disruptions (like drain). If draining would violate the PDB, the drain is blocked until the constraint can be satisfied.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
    name: my-pdb
spec:
    minAvailable: 2 # or: maxUnavailable: 1
    selector:
        matchLabels:
            app: nginx
```

### Node Conditions

```bash
kubectl describe node <node> | grep -A5 Conditions
```

| Condition            | Meaning                                  |
| -------------------- | ---------------------------------------- |
| `Ready`              | Node is healthy and ready to accept Pods |
| `MemoryPressure`     | Node is low on memory                    |
| `DiskPressure`       | Node is low on disk space                |
| `PIDPressure`        | Too many processes running               |
| `NetworkUnavailable` | Network is not configured                |

---

## Lab

### 1. Set up a workload

```bash
kubectl create deployment web --image=nginx:1.25 --replicas=3
kubectl get pods -o wide    # see which node they're on
```

### 2. Cordon — stop new Pods from scheduling

```bash
kubectl cordon minikube
kubectl get node minikube    # STATUS: Ready,SchedulingDisabled

kubectl get pods -o wide    # existing Pods still running
kubectl scale deployment web --replicas=5
kubectl get pods -o wide    # new Pods stay Pending — no schedulable node
```

### 3. Uncordon

```bash
kubectl uncordon minikube
kubectl get node minikube    # STATUS: Ready
kubectl get pods             # Pending Pods now schedule
```

### 4. Drain — evict all Pods

```bash
kubectl drain minikube --ignore-daemonsets --delete-emptydir-data
kubectl get node minikube    # Ready,SchedulingDisabled
kubectl get pods             # web Pods are gone (will reschedule once uncordoned)
```

On a single-node Minikube, Pods will be in `Pending` state (no other node to go to):

```bash
kubectl get pods    # Pending
```

### 5. Simulate maintenance, then restore

```bash
# (perform OS upgrade here)
echo "Maintenance done"

kubectl uncordon minikube
kubectl get pods    # Pods reschedule
```

### 6. PodDisruptionBudget

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: web-pdb
spec:
  maxUnavailable: 1
  selector:
    matchLabels:
      app: web
EOF

kubectl get pdb
kubectl describe pdb web-pdb
```

When you drain with a PDB, Kubernetes waits until enough healthy replicas are available before evicting the next Pod.

### Cleanup

```bash
kubectl delete deployment web 2>/dev/null; true
kubectl delete pdb web-pdb 2>/dev/null; true
kubectl uncordon minikube 2>/dev/null; true
```

---

## Next

Move on to Lesson 25 — Kubernetes Cluster Upgrade.
