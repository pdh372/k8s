# Lesson 30 — KubeConfig

## Theory

`~/.kube/config` (the **kubeconfig** file) tells `kubectl` how to reach your cluster and which credentials to use. It has three top-level sections that are mixed-and-matched via **contexts**:

```
kubeconfig
├── clusters[]     — connection info for each cluster (API server URL, CA cert)
├── users[]        — credentials for each identity (client cert, token, exec plugin)
└── contexts[]     — (cluster, user, namespace) triplets
```

A **context** binds a specific user to a specific cluster (optionally in a specific namespace). `current-context` is the one `kubectl` uses by default.

### Multiple Clusters in One Config

Common in production — you might have `dev`, `staging`, and `prod` clusters in one kubeconfig:

```
contexts:
  - name: dev       → cluster: dev-cluster,  user: dev-admin
  - name: prod      → cluster: prod-cluster, user: prod-readonly
```

Switch with `kubectl config use-context prod`.

### Alternate kubeconfig Locations

| Method                               | Priority              |
| ------------------------------------ | --------------------- |
| `--kubeconfig=/path/to/file` flag    | Highest               |
| `KUBECONFIG=/path/a:/path/b` env var | Merges multiple files |
| `~/.kube/config`                     | Default               |

---

## Lab

### 1. View the kubeconfig

```bash
kubectl config view                    # full config (masked values)
kubectl config view --raw              # full config with actual cert data
kubectl config view --minify           # only current context
```

### 2. Understand the structure

```bash
# List all clusters, users, contexts
kubectl config get-clusters
kubectl config get-users
kubectl config get-contexts

# Current context
kubectl config current-context
```

### 3. Create a second cluster entry (simulated)

```bash
# Pretend we have a second cluster — we'll add its entry manually
# (On a real scenario you'd copy the kubeconfig from the other cluster)
kubectl config set-cluster dev-cluster \
  --server=https://192.168.1.100:6443 \
  --certificate-authority=/etc/kubernetes/pki/ca.crt \
  --embed-certs=true 2>/dev/null || \
kubectl config set-cluster dev-cluster \
  --server=https://192.168.1.100:6443 \
  --insecure-skip-tls-verify=true
```

### 4. Add credentials and context

```bash
# (re-use alice's cert from lesson 28 if available, else use a token)
kubectl config set-credentials alice \
  --token=dummy-token

kubectl config set-context dev-alice \
  --cluster=dev-cluster \
  --user=alice \
  --namespace=development

kubectl config get-contexts
```

### 5. Switch contexts

```bash
kubectl config use-context minikube     # switch to minikube
kubectl config current-context         # confirm

# Run a single command in a different context without switching
kubectl --context=dev-alice get pods 2>/dev/null || echo "expected failure (fake cluster)"
```

### 6. Set default namespace for a context

```bash
kubectl config set-context --current --namespace=kube-system
kubectl get pods    # now shows kube-system Pods by default

# Reset to default
kubectl config set-context --current --namespace=default
```

### 7. Merge multiple kubeconfig files

```bash
# If you have two kubeconfig files, merge them via KUBECONFIG env var
cp ~/.kube/config /tmp/config-backup.yaml

KUBECONFIG=~/.kube/config:/tmp/config-backup.yaml kubectl config view --flatten > /tmp/merged.yaml
cat /tmp/merged.yaml | head -20
```

### 8. Inspect kubeconfig structure with jsonpath

```bash
kubectl config view -o jsonpath='{.clusters[*].name}'
kubectl config view -o jsonpath='{.contexts[*].context.cluster}'
kubectl config view -o jsonpath='{.users[*].name}'
```

### 9. Delete a context

```bash
kubectl config delete-context dev-alice
kubectl config delete-cluster dev-cluster
kubectl config delete-user alice
kubectl config get-contexts    # cleaned up
```

### Cleanup

```bash
rm -f /tmp/config-backup.yaml /tmp/merged.yaml
```

---

## Next

Move on to Lesson 31 — RBAC (Role-Based Access Control).
