# Lesson 12 — Resource Requests and Limits

## Theory

Every container in a Pod can declare how much CPU and memory it needs. Kubernetes uses this to make scheduling decisions and to enforce fair resource usage.

### Requests vs Limits

|                 | Request                                                            | Limit                                                       |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| **Definition**  | Minimum guaranteed resources the container needs                   | Hard maximum the container can use                          |
| **Scheduling**  | Scheduler places Pod on a Node with at least this much _available_ | Not considered during scheduling                            |
| **Enforcement** | Node reserves this capacity                                        | Container is throttled (CPU) or killed (memory) if exceeded |

### Units

| Resource | Unit                | Examples                                             |
| -------- | ------------------- | ---------------------------------------------------- |
| CPU      | cores or millicores | `1` = 1 core, `500m` = 0.5 cores, `100m` = 0.1 cores |
| Memory   | bytes with suffix   | `128Mi`, `256Mi`, `1Gi`, `512M`                      |

> `Mi` = mebibytes (1024²), `M` = megabytes (1000²). Use `Mi`/`Gi` for Kubernetes.

### What Happens When Limits Are Exceeded

| Resource | Behaviour                                                               |
| -------- | ----------------------------------------------------------------------- |
| CPU      | Container is **throttled** (slowed down) — never killed for CPU overuse |
| Memory   | Container is **OOMKilled** (killed by the kernel) → Pod restarts        |

### QoS Classes (Kubernetes assigns automatically)

| Class        | Condition                               | Priority during eviction |
| ------------ | --------------------------------------- | ------------------------ |
| `Guaranteed` | requests == limits for all containers   | Last to be evicted       |
| `Burstable`  | At least one container has requests set | Middle priority          |
| `BestEffort` | No requests or limits set at all        | First to be evicted      |

---

## YAML

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: resource-demo
spec:
    containers:
        - name: app
          image: nginx:1.25
          resources:
              requests:
                  memory: '128Mi'
                  cpu: '250m'
              limits:
                  memory: '256Mi'
                  cpu: '500m'
```

---

## Lab

### 1. Create Pod with resource requirements

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: resource-demo
spec:
  containers:
    - name: app
      image: nginx:1.25
      resources:
        requests:
          memory: "64Mi"
          cpu: "100m"
        limits:
          memory: "128Mi"
          cpu: "200m"
EOF

kubectl get pod resource-demo
kubectl describe pod resource-demo | grep -A8 Requests
```

### 2. Check QoS class

```bash
kubectl get pod resource-demo -o jsonpath='{.status.qosClass}'
# → Burstable (requests != limits)

# Guaranteed: requests == limits
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: guaranteed-pod
spec:
  containers:
    - name: app
      image: nginx:1.25
      resources:
        requests:
          memory: "128Mi"
          cpu: "200m"
        limits:
          memory: "128Mi"
          cpu: "200m"
EOF
kubectl get pod guaranteed-pod -o jsonpath='{.status.qosClass}'
```

### 3. Monitor resource usage (requires Metrics Server)

Install Metrics Server if not present:

```bash
minikube addons enable metrics-server
kubectl top nodes
kubectl top pods
```

### 4. LimitRange — namespace defaults

Without LimitRange, Pods with no `resources` block are `BestEffort` and can consume everything.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: default
spec:
  limits:
    - type: Container
      default:
        cpu: "200m"
        memory: "256Mi"
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      max:
        cpu: "1"
        memory: "1Gi"
      min:
        cpu: "50m"
        memory: "64Mi"
EOF

# Any new Pod without resources will get the defaults injected
kubectl run auto-limits --image=nginx:1.25
kubectl describe pod auto-limits | grep -A6 Requests
```

### 5. ResourceQuota — namespace totals

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: default
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
    pods: "20"
EOF

kubectl describe resourcequota compute-quota
```

### 6. Simulate OOMKill

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: oom-demo
spec:
  containers:
    - name: memory-hog
      image: polinux/stress
      resources:
        requests:
          memory: "50Mi"
        limits:
          memory: "50Mi"
      command: ["stress"]
      args: ["--vm", "1", "--vm-bytes", "100M", "--vm-hang", "1"]
EOF

kubectl get pod oom-demo --watch    # watch for OOMKilled
kubectl describe pod oom-demo | grep -E 'OOMKilled|Reason|Exit Code'
```

### Cleanup

```bash
kubectl delete pod resource-demo guaranteed-pod auto-limits oom-demo 2>/dev/null; true
kubectl delete limitrange default-limits 2>/dev/null; true
kubectl delete resourcequota compute-quota 2>/dev/null; true
```

---

## Next

Move on to Lesson 13 — DaemonSets.
