# Lesson 18 — Rolling Updates and Rollbacks (Application Lifecycle)

## Theory

This lesson revisits Deployment update strategies from an **application lifecycle** perspective — focusing on zero-downtime release patterns beyond the basic rolling update.

### Deployment Strategies Recap

| Strategy       | `spec.strategy.type` | Downtime?                   |
| -------------- | -------------------- | --------------------------- |
| Rolling Update | `RollingUpdate`      | No (if `maxUnavailable: 0`) |
| Recreate       | `Recreate`           | Yes                         |

### Advanced Patterns (implemented via Kubernetes primitives)

**Blue-Green Deployment**

- Run two identical Deployments: `blue` (current) and `green` (new version).
- A Service routes to the active one via a label selector.
- Switch traffic instantly by changing the Service selector from `blue` to `green`.
- Instant rollback: change selector back.

```
Service selector: version=blue  →  change to  →  version=green
```

**Canary Deployment**

- Run mostly the old version, a small fraction on the new version.
- Both Deployments share the same Service label.
- Control traffic split by adjusting `replicas` ratio.

```
stable-deploy: replicas=9 (90%)
canary-deploy:  replicas=1 (10%)
Service selector: app=myapp  (matches both)
```

---

## Lab

### 1. Standard Rolling Update (review)

```bash
kubectl create deployment myapp --image=nginx:1.24 --replicas=4
kubectl rollout status deployment/myapp
kubectl set image deployment/myapp nginx=nginx:1.25
kubectl rollout status deployment/myapp
kubectl rollout history deployment/myapp
kubectl rollout undo deployment/myapp
```

### 2. Blue-Green Deployment

```bash
# Blue (current production)
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
        - name: nginx
          image: nginx:1.24
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-svc
spec:
  selector:
    app: myapp
    version: blue    # currently routing to blue
  ports:
    - port: 80
      targetPort: 80
EOF

# Green (new version, deploy but not yet live)
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
EOF

kubectl get pods --show-labels

# Test green is healthy before switching
kubectl run test --image=busybox --rm -it --restart=Never -- \
  wget -qO- myapp-svc

# Switch traffic to green (instant cutover)
kubectl patch service myapp-svc -p '{"spec":{"selector":{"version":"green"}}}'
kubectl describe service myapp-svc | grep Selector

# Rollback: switch back to blue in one command
kubectl patch service myapp-svc -p '{"spec":{"selector":{"version":"blue"}}}'
```

### 3. Canary Deployment

```bash
# Stable: 9 replicas
cat <<'EOF' | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-stable
spec:
  replicas: 9
  selector:
    matchLabels:
      app: canary-demo
      track: stable
  template:
    metadata:
      labels:
        app: canary-demo
        track: stable
    spec:
      containers:
        - name: nginx
          image: nginx:1.24
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-canary
spec:
  replicas: 1    # 10% of traffic
  selector:
    matchLabels:
      app: canary-demo
      track: canary
  template:
    metadata:
      labels:
        app: canary-demo
        track: canary
    spec:
      containers:
        - name: nginx
          image: nginx:1.25
---
apiVersion: v1
kind: Service
metadata:
  name: canary-svc
spec:
  selector:
    app: canary-demo    # matches BOTH stable and canary Pods
  ports:
    - port: 80
      targetPort: 80
EOF

kubectl get pods -l app=canary-demo --show-labels
kubectl get endpoints canary-svc    # 10 endpoints total

# Promote: increase canary replicas, decrease stable
kubectl scale deployment myapp-canary --replicas=5
kubectl scale deployment myapp-stable --replicas=5
# Eventually:
kubectl scale deployment myapp-canary --replicas=10
kubectl scale deployment myapp-stable --replicas=0
```

### Cleanup

```bash
kubectl delete deployment myapp myapp-blue myapp-green myapp-stable myapp-canary 2>/dev/null; true
kubectl delete service myapp-svc canary-svc 2>/dev/null; true
```

---

## Next

Move on to Lesson 19 — Commands and Arguments (Docker vs Kubernetes).
