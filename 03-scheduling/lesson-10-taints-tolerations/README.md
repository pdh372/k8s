# Lesson 10 — Taints and Tolerations

## Theory

**Taints** are placed on **Nodes** to repel Pods. **Tolerations** are placed on **Pods** to allow (tolerate) specific taints. Together they control which Pods can be scheduled on which Nodes.

> ⚠️ Taints/tolerations do **not** guarantee a Pod lands on a specific Node — they only prevent or allow placement. To _attract_ a Pod to a specific Node, combine with Node Affinity (Lesson 11).

### Taint Effects

| Effect             | Behaviour                                                                                                  |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `NoSchedule`       | New Pods without a matching toleration will **not** be scheduled here. Existing Pods are unaffected.       |
| `PreferNoSchedule` | Kubernetes will _try_ to avoid scheduling here, but may if no other option. Soft version of NoSchedule.    |
| `NoExecute`        | New Pods without toleration won't be scheduled here, **and existing Pods without toleration are evicted**. |

### Format

```
key=value:effect
kubectl taint nodes <node> key=value:effect
```

### The Control Plane Taint

The control plane Node has a built-in taint that prevents regular workloads from being scheduled there:

```
node-role.kubernetes.io/control-plane:NoSchedule
```

On Minikube there's only one node that acts as both, so this taint is not applied by default.

---

## YAML — Toleration in a Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: tolerant-pod
spec:
    tolerations:
        - key: 'app'
          operator: 'Equal'
          value: 'blue'
          effect: 'NoSchedule'
    containers:
        - name: nginx
          image: nginx:1.25
```

### Toleration Operators

| Operator | Meaning                                                       |
| -------- | ------------------------------------------------------------- |
| `Equal`  | key + value + effect must all match                           |
| `Exists` | Only key (and optionally effect) must match; value is ignored |

Tolerate **any** taint:

```yaml
tolerations:
    - operator: 'Exists'
```

---

## Lab

> On single-node Minikube all Pods land on the same node regardless, but the scheduling decision (whether to schedule) is still enforced.

### 1. Add a taint to the Node

```bash
kubectl taint nodes minikube app=blue:NoSchedule
kubectl describe node minikube | grep Taints
```

### 2. Try to schedule a Pod without a toleration

```bash
kubectl run intolerant --image=nginx:1.25
kubectl get pod intolerant    # STATUS: Pending

kubectl describe pod intolerant | tail -10
# Events: 0/1 nodes are available: 1 node(s) had untolerated taint {app: blue}
```

### 3. Schedule a Pod with the matching toleration

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: tolerant-pod
spec:
  tolerations:
    - key: "app"
      operator: "Equal"
      value: "blue"
      effect: "NoSchedule"
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pod tolerant-pod    # Running
kubectl get pod intolerant      # still Pending
```

### 4. NoExecute — evicts running Pods

```bash
# First remove the NoSchedule taint so we can get a Pod running
kubectl taint nodes minikube app=blue:NoSchedule-

kubectl run eviction-test --image=nginx:1.25
kubectl get pod eviction-test    # Running

# Now apply NoExecute
kubectl taint nodes minikube app=blue:NoExecute

kubectl get pod eviction-test    # Evicted or Terminating within seconds
kubectl get pod tolerant-pod     # Still Running (it has a toleration)
```

### 5. Remove a taint

```bash
kubectl taint nodes minikube app=blue:NoExecute-    # trailing dash removes taint
kubectl describe node minikube | grep Taints        # should say "<none>"
```

### 6. View taints on all nodes

```bash
kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints
```

### Cleanup

```bash
kubectl taint nodes minikube app=blue:NoSchedule- 2>/dev/null; true
kubectl taint nodes minikube app=blue:NoExecute- 2>/dev/null; true
kubectl delete pod intolerant tolerant-pod eviction-test 2>/dev/null; true
```

---

## Next

Move on to Lesson 11 — Node Affinity (how to _attract_ Pods to specific Nodes).
