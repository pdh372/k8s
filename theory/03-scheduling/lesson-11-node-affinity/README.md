# Lesson 11 — Node Affinity

## Theory

**Node Affinity** lets you attract Pods to specific Nodes based on Node labels. It is the more powerful successor to the simpler `nodeSelector` field.

> **Taints/Tolerations vs Node Affinity:**
>
> - Taints/Tolerations = Node _repels_ Pods (opt-in via toleration)
> - Node Affinity = Pod _requests_ certain Nodes (pull toward, not push away)
> - **Both together** = full control: taint a Node so only certain Pods go there, AND use affinity so those Pods prefer that Node.

### nodeSelector (simple, legacy)

```yaml
spec:
    nodeSelector:
        disk: ssd # must have this exact label
```

One key-value pair, no expressions. Still valid and commonly used for simple cases.

### Node Affinity Types

| Type                                              | Scheduling                                                 | During execution                            |
| ------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| `requiredDuringSchedulingIgnoredDuringExecution`  | **Hard** rule — Pod won't be scheduled if no node matches  | Ignored (won't evict if node label changes) |
| `preferredDuringSchedulingIgnoredDuringExecution` | **Soft** rule — prefer matching nodes, fall back to others | Ignored                                     |

A future type `requiredDuringSchedulingRequiredDuringExecution` is planned (evicts Pods if node label changes) but not yet stable.

### Operators in Node Affinity

| Operator       | Meaning                                |
| -------------- | -------------------------------------- |
| `In`           | Label value is in the list             |
| `NotIn`        | Label value is not in the list         |
| `Exists`       | Label key exists (any value)           |
| `DoesNotExist` | Label key does not exist               |
| `Gt`           | Value is greater than (numeric string) |
| `Lt`           | Value is less than (numeric string)    |

---

## YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: affinity-pod
spec:
    affinity:
        nodeAffinity:
            requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                    - matchExpressions:
                          - key: disk
                            operator: In
                            values:
                                - ssd
                                - nvme
            preferredDuringSchedulingIgnoredDuringExecution:
                - weight: 80 # 1–100; higher weight = stronger preference
                  preference:
                      matchExpressions:
                          - key: region
                            operator: In
                            values:
                                - us-east-1
    containers:
        - name: nginx
          image: nginx:1.25
```

Multiple `nodeSelectorTerms` are OR'd. Multiple `matchExpressions` within one term are AND'd.

---

## Lab

### 1. Label the Node

```bash
kubectl label node minikube disk=ssd
kubectl label node minikube region=us-east-1
kubectl get nodes --show-labels
```

### 2. Required affinity — hard constraint

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: required-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: disk
                operator: In
                values:
                  - ssd
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pod required-affinity -o wide    # Scheduled on minikube (has disk=ssd)
```

### 3. Test with a label that doesn't exist

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: no-match-affinity
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: disk
                operator: In
                values:
                  - hdd
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pod no-match-affinity    # Pending — no node has disk=hdd
kubectl describe pod no-match-affinity | tail -5
```

### 4. Preferred affinity — soft constraint

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: preferred-affinity
spec:
  affinity:
    nodeAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          preference:
            matchExpressions:
              - key: disk
                operator: In
                values:
                  - nvme
  containers:
    - name: nginx
      image: nginx:1.25
EOF

kubectl get pod preferred-affinity -o wide    # Still Scheduled (preference, not required)
```

### 5. Combine Taints + Node Affinity

```bash
# Taint the node: only Pods with the toleration can schedule here
kubectl taint nodes minikube dedicated=gpu:NoSchedule

# Label the node for affinity
kubectl label node minikube gpu=true

# Pod that both tolerates the taint and uses affinity
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: gpu-pod
spec:
  tolerations:
    - key: dedicated
      operator: Equal
      value: gpu
      effect: NoSchedule
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: gpu
                operator: In
                values:
                  - "true"
  containers:
    - name: cuda-app
      image: nginx:1.25
EOF

kubectl get pod gpu-pod -o wide
```

### Cleanup

```bash
kubectl taint nodes minikube dedicated=gpu:NoSchedule- 2>/dev/null; true
kubectl label node minikube disk- region- gpu- 2>/dev/null; true
kubectl delete pod required-affinity no-match-affinity preferred-affinity gpu-pod 2>/dev/null; true
```

---

## Next

Move on to Lesson 12 — Resource Requests and Limits.
