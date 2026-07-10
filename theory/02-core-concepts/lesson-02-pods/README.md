# Lesson 2 — Pods

## Theory

A **Pod** is the smallest deployable unit in Kubernetes. It is a wrapper around one or more containers that always run together on the same Node, share the same network namespace (same IP, same ports), and can share storage volumes.

> **Why not just "containers"?** Kubernetes doesn't schedule containers directly — it schedules Pods. This lets you co-locate tightly coupled helpers (a log-shipper, a proxy sidecar) alongside the main container without any extra networking tricks.

### Key Properties

| Property           | Detail                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ephemeral**      | Pods are not healed — if a Pod dies, it is gone. The _controller_ above it (ReplicaSet, Deployment) is responsible for creating a replacement. |
| **One IP per Pod** | All containers in the same Pod share one IP address and port space. Two containers in the same Pod can talk via `localhost`.                   |
| **Shared volumes** | Volumes are attached to a Pod, not a container — so all containers in the Pod can read/write the same volume.                                  |
| **Restart policy** | Controlled by `spec.restartPolicy` (`Always` / `OnFailure` / `Never`). Default is `Always`.                                                    |

### Single-container vs multi-container Pods

Most Pods you'll write are **single-container** — one app, one Pod. Multi-container Pods are an advanced pattern (sidecar, ambassador, adapter) covered in a later lesson. Start with single-container.

### Pod lifecycle phases

```
Pending  →  Running  →  Succeeded
                    ↘
                     Failed
```

`Pending` means the Pod has been accepted by the cluster but its container(s) haven't started yet (still being scheduled / image still being pulled).

---

## YAML Anatomy

The minimal YAML for a Pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
    name: nginx-pod
    labels:
        app: nginx
spec:
    containers:
        - name: nginx
          image: nginx:1.25
          ports:
              - containerPort: 80
```

The four **mandatory top-level fields** for every Kubernetes object:

| Field        | Meaning                                                                         |
| ------------ | ------------------------------------------------------------------------------- |
| `apiVersion` | Which API group/version this object belongs to (`v1` for core types like Pod)   |
| `kind`       | The object type (`Pod`, `Deployment`, `Service`, …)                             |
| `metadata`   | Identity — at minimum a `name`; optionally `namespace`, `labels`, `annotations` |
| `spec`       | The _desired state_ — what you want Kubernetes to create/maintain               |

> **`ports.containerPort` is informational only.** It does NOT open a firewall port or expose the Pod. It's there purely for documentation — traffic reaches the container regardless. Exposure is handled by Services (Lesson 5).

---

## Lab

### 1. Run a Pod imperatively (fastest for practice & exam)

```bash
kubectl run nginx-pod --image=nginx:1.25
```

Check it appeared:

```bash
kubectl get pods
kubectl get pods -o wide    # also shows Node and IP
```

### 2. Inspect the Pod

```bash
kubectl describe pod nginx-pod
```

Look for:

- **Node** — which Node it was scheduled on
- **Status** — `Running`, `Pending`, etc.
- **Containers** section — image, state, restart count
- **Events** — at the bottom; shows `Scheduled`, `Pulling`, `Started`; errors like `ImagePullBackOff` also appear here

```bash
kubectl get pod nginx-pod -o yaml   # full spec + live status from the API
```

### 3. Get a shell inside the running container

```bash
kubectl exec -it nginx-pod -- /bin/bash
```

While inside, confirm the nginx process is running:

```bash
curl localhost      # should return the nginx welcome HTML
exit
```

### 4. Read container logs

```bash
kubectl logs nginx-pod
kubectl logs nginx-pod --follow    # stream in real time (Ctrl-C to stop)
```

### 5. Create a Pod from YAML

Save the file:

```bash
cat <<'EOF' > pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-yaml
  labels:
    app: nginx
    env: dev
spec:
  containers:
    - name: nginx
      image: nginx:1.25
      ports:
        - containerPort: 80
EOF
```

Apply it:

```bash
kubectl apply -f pod.yaml
kubectl get pods
```

### 6. Generate YAML from an imperative command (exam trick)

Instead of writing YAML from scratch, use `--dry-run=client -o yaml` to generate the template and save it:

```bash
kubectl run busybox-pod \
  --image=busybox \
  --dry-run=client \
  -o yaml \
  -- sleep 3600 > busybox-pod.yaml
```

Inspect the generated file, then apply:

```bash
cat busybox-pod.yaml
kubectl apply -f busybox-pod.yaml
```

### 7. Edit a live Pod

```bash
kubectl edit pod nginx-yaml
```

This opens the live spec in `$EDITOR`. Note: most fields are **immutable** on a running Pod (image, name, volumes) — you'll get an error trying to change them. For immutable changes you must delete + recreate (or use Deployments).

### 8. Cleanup

```bash
kubectl delete pod nginx-pod nginx-yaml busybox-pod
# or delete from the file:
kubectl delete -f pod.yaml
```

Confirm they're gone:

```bash
kubectl get pods
```

---

## Common Errors & What They Mean

| Status                              | Cause                                                           | Fix                                                               |
| ----------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `ImagePullBackOff` / `ErrImagePull` | Image name is wrong or doesn't exist in the registry            | Check `kubectl describe pod <name>` Events; fix the image name    |
| `CrashLoopBackOff`                  | Container starts then immediately exits (bad command, crash)    | Check `kubectl logs <pod>` and `kubectl describe pod <name>`      |
| `Pending` (stuck)                   | No Node has enough resources, or a taint is blocking scheduling | Check `kubectl describe pod <name>` Events for `FailedScheduling` |
| `OOMKilled`                         | Container exceeded its memory limit                             | Increase `resources.limits.memory` or fix the memory leak         |

---

## Next

Once you can create, inspect, exec into, and delete Pods both imperatively and from YAML, move on to Lesson 3 — ReplicaSets.
