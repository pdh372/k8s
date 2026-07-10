# Lesson 7 — Imperative vs Declarative

## Theory

Kubernetes supports two styles of managing resources:

| Style           | What you tell Kubernetes                                      | Example commands                                                                        |
| --------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Imperative**  | _What action to perform right now_                            | `kubectl run`, `kubectl create`, `kubectl expose`, `kubectl scale`, `kubectl set image` |
| **Declarative** | _What the desired state should be_ — K8s figures out the diff | `kubectl apply -f file.yaml`                                                            |

### When to Use Each

| Scenario                                               | Best approach                                     |
| ------------------------------------------------------ | ------------------------------------------------- |
| CKA exam (quick one-off tasks, time pressure)          | Imperative — fastest to type                      |
| Production infrastructure                              | Declarative — files in git, repeatable, auditable |
| Generating a YAML template to edit                     | Imperative + `--dry-run=client -o yaml`           |
| Updating an existing resource with many changed fields | Declarative (`apply`)                             |

### `kubectl create` vs `kubectl apply` vs `kubectl replace`

| Command           | Resource exists                         | Resource absent |
| ----------------- | --------------------------------------- | --------------- |
| `kubectl create`  | Error                                   | Creates it      |
| `kubectl replace` | Fully replaces (complete spec required) | Error           |
| `kubectl apply`   | Merges diff only                        | Creates it      |

`kubectl apply` stores the last-applied config as an annotation on the object. On subsequent applies it three-way merges: (last applied) vs (current live) vs (new file).

### The `--dry-run` Exam Trick

| Flag               | Effect                                                                  |
| ------------------ | ----------------------------------------------------------------------- |
| `--dry-run=client` | Validates locally only; nothing sent to cluster                         |
| `--dry-run=server` | Validates via cluster API (checks quotas, webhooks) but doesn't persist |

**Pattern used constantly in CKA:**

```bash
kubectl run nginx --image=nginx --dry-run=client -o yaml > pod.yaml
# edit pod.yaml to add whatever fields you need
kubectl apply -f pod.yaml
```

---

## Lab

### 1. Imperative creates

```bash
# Pod
kubectl run redis --image=redis:7 --labels="app=redis,tier=cache"

# Deployment
kubectl create deployment httpd --image=httpd:2.4 --replicas=2

# Service (expose existing Deployment)
kubectl expose deployment httpd --port=80 --name=httpd-svc

# ConfigMap from literals
kubectl create configmap app-config \
  --from-literal=ENV=production \
  --from-literal=LOG_LEVEL=info

# Secret from literals
kubectl create secret generic db-secret --from-literal=password=s3cr3t

# Namespace
kubectl create namespace staging
```

### 2. Generate YAML templates

```bash
# Pod
kubectl run busybox --image=busybox --dry-run=client -o yaml -- sleep 3600 > busybox.yaml

# Deployment
kubectl create deployment myapp --image=nginx:1.25 --replicas=3 \
  --dry-run=client -o yaml > myapp.yaml

# Service
kubectl expose deployment myapp --port=80 --dry-run=client -o yaml > myapp-svc.yaml

# ClusterRole
kubectl create clusterrole pod-reader \
  --verb=get,list,watch --resource=pods \
  --dry-run=client -o yaml > pod-reader-role.yaml
```

Inspect and edit `myapp.yaml` (add env vars, resource limits, etc.) then apply:

```bash
kubectl apply -f myapp.yaml
```

### 3. Apply is idempotent

```bash
kubectl apply -f myapp.yaml    # creates
kubectl apply -f myapp.yaml    # no-op (nothing changed)

# Edit replicas: 3 → 5 in myapp.yaml
kubectl apply -f myapp.yaml    # updates only the replicas field
kubectl get deployment myapp
```

### 4. Preview changes before applying

```bash
kubectl diff -f myapp.yaml    # shows what would change (like git diff)
```

### 5. `kubectl replace --force` (delete + recreate)

Use when you need to change an immutable field (e.g. Pod's container name):

```bash
kubectl replace --force -f busybox.yaml
```

⚠️ This deletes the object first — brief downtime. Not safe for Deployments in production; edit the Deployment template instead.

### 6. Common imperative shortcuts for the exam

```bash
# Create a Pod and immediately delete after running (one-shot)
kubectl run test --image=busybox --rm -it --restart=Never -- wget -qO- http://myservice

# Create a Job
kubectl create job pi --image=perl -- perl -Mbignum=bpi -wle 'print bpi(2000)'

# Create a CronJob
kubectl create cronjob hello --image=busybox --schedule="*/1 * * * *" -- echo hello

# Quick namespace
kubectl create ns dev

# Quickly label a node
kubectl label node minikube disk=ssd
```

### Cleanup

```bash
kubectl delete deployment httpd myapp 2>/dev/null; true
kubectl delete service httpd-svc 2>/dev/null; true
kubectl delete pod redis busybox 2>/dev/null; true
kubectl delete configmap app-config 2>/dev/null; true
kubectl delete secret db-secret 2>/dev/null; true
kubectl delete namespace staging 2>/dev/null; true
```

---

## Next

Core Concepts complete. Move on to Lesson 8 — Manual Scheduling (start of the Scheduling section).
