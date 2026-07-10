# Lesson 4 — Deployments

## Theory

A **Deployment** is a higher-level object that manages ReplicaSets. You describe the desired state (image version, replica count, update strategy) and the Deployment controller handles rolling updates and rollbacks by creating and scaling ReplicaSets.

```
Deployment
    └── ReplicaSet (current, e.g. rev 2)      ← 3 Pods
    └── ReplicaSet (previous, e.g. rev 1)     ← 0 Pods (kept for rollback)
```

### Why Deployments Instead of ReplicaSets Directly?

A ReplicaSet can keep N replicas running, but **changing the Pod template doesn't replace running Pods** — it only affects new ones created by scaling events. A Deployment solves this with **rolling updates**:

1. Creates a new ReplicaSet with the new template.
2. Gradually scales the new RS up (adding Pods one by one).
3. Gradually scales the old RS down (removing Pods one by one).
4. Keeps the old RS at 0 replicas — enabling rollback.

### Update Strategies

| Strategy                  | Behaviour                                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `RollingUpdate` (default) | Replaces Pods incrementally — zero downtime. Controlled by `maxUnavailable` and `maxSurge`.                                  |
| `Recreate`                | Kills **all** old Pods first, then creates new ones. Causes downtime; useful when you can't run two versions simultaneously. |

### `maxUnavailable` and `maxSurge`

```
replicas: 4, maxUnavailable: 1, maxSurge: 1

During update: minimum 3 Pods running at any time
              maximum 5 Pods running at any time
```

Both accept absolute numbers or percentages (`25%`).

### Rollout Terminology

| Term         | Meaning                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------ |
| **Revision** | Each time the Pod template changes, a new revision is recorded (stored as old ReplicaSets) |
| **Rollback** | Revert to a previous revision — Deployment rescales the old ReplicaSet back up             |

---

## YAML

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: nginx-deploy
spec:
    replicas: 3
    selector:
        matchLabels:
            app: nginx
    strategy:
        type: RollingUpdate
        rollingUpdate:
            maxUnavailable: 1
            maxSurge: 1
    template:
        metadata:
            labels:
                app: nginx
        spec:
            containers:
                - name: nginx
                  image: nginx:1.25
```

---

## Lab

### 1. Create a Deployment

```bash
kubectl create deployment nginx-deploy --image=nginx:1.25 --replicas=3
kubectl get deployment
kubectl get replicaset    # RS created and owned by the Deployment
kubectl get pods
```

### 2. Watch a Rolling Update

```bash
# Open a second terminal and run: watch kubectl get pods

kubectl set image deployment/nginx-deploy nginx=nginx:1.26
kubectl rollout status deployment/nginx-deploy    # watch progress
```

Confirm new image:

```bash
kubectl describe deployment nginx-deploy | grep Image
```

### 3. Check Rollout History

```bash
kubectl rollout history deployment/nginx-deploy
```

Add a human-readable annotation to explain the change:

```bash
kubectl annotate deployment nginx-deploy kubernetes.io/change-cause="upgrade to nginx 1.26"
kubectl rollout history deployment/nginx-deploy
```

### 4. Rollback

```bash
kubectl rollout undo deployment/nginx-deploy                    # back to previous revision
kubectl rollout undo deployment/nginx-deploy --to-revision=1    # to specific revision

kubectl rollout status deployment/nginx-deploy
kubectl describe deployment nginx-deploy | grep Image           # back to nginx:1.25
```

### 5. Scale

```bash
kubectl scale deployment nginx-deploy --replicas=5
kubectl get pods
```

### 6. Pause & Resume (batch multiple changes into one rollout)

```bash
kubectl rollout pause deployment/nginx-deploy
kubectl set image deployment/nginx-deploy nginx=nginx:1.27
# make any other template changes...
kubectl rollout resume deployment/nginx-deploy    # ONE rollout fires for all changes
kubectl rollout status deployment/nginx-deploy
```

### 7. Generate YAML (exam shortcut)

```bash
kubectl create deployment myapp --image=nginx:1.25 --replicas=3 \
  --dry-run=client -o yaml > myapp-deploy.yaml
```

Edit the file to add environment variables, volume mounts, etc., then:

```bash
kubectl apply -f myapp-deploy.yaml
```

### Cleanup

```bash
kubectl delete deployment nginx-deploy myapp 2>/dev/null; true
```

---

## Next

Once you can create, update, roll back, and scale Deployments, move on to Lesson 5 — Services.
