# Lesson 27 — Security Primitives

## Theory

Kubernetes security is built in layers. Every request to the API server passes through three gates:

```
kubectl / application
        ↓
[1] Authentication   — Who are you?
        ↓
[2] Authorization    — Are you allowed to do this?
        ↓
[3] Admission Control — Does this request comply with policy?
        ↓
     etcd (object stored)
```

### 1. Authentication — Who are you?

Kubernetes has **no built-in user database**. Users are external — authenticated via:

| Method                        | Used for                                                               |
| ----------------------------- | ---------------------------------------------------------------------- |
| **X.509 client certificates** | Human users (`kubectl`), component-to-component (kubelet → API server) |
| **Bearer tokens**             | ServiceAccounts (Pods), bootstrap tokens                               |
| **OIDC** (OpenID Connect)     | SSO/enterprise identity (Google, Okta, Dex)                            |
| **Webhook**                   | External auth service                                                  |

**ServiceAccounts** are the identity for Pods. Each namespace has a `default` ServiceAccount. Pods use it automatically.

### 2. Authorization — Are you allowed?

| Mode        | Description                                                                                |
| ----------- | ------------------------------------------------------------------------------------------ |
| **RBAC**    | Role-Based Access Control — the standard; uses Roles and Bindings                          |
| **ABAC**    | Attribute-Based Access Control — legacy, file-based, requires API server restart to change |
| **Webhook** | External authorization service                                                             |
| **Node**    | Special authorization for kubelets                                                         |

RBAC is always used. `--authorization-mode=Node,RBAC` is the default on kubeadm clusters.

### 3. Admission Controllers

Plugins that intercept requests after auth but before the object is persisted. They can **validate** (reject bad requests) or **mutate** (modify requests).

| Controller                   | Purpose                                    |
| ---------------------------- | ------------------------------------------ |
| `NamespaceLifecycle`         | Prevents objects in terminating namespaces |
| `LimitRanger`                | Enforces LimitRange                        |
| `ResourceQuota`              | Enforces ResourceQuota                     |
| `PodSecurity`                | Enforces Pod Security Standards            |
| `MutatingAdmissionWebhook`   | Custom mutation logic                      |
| `ValidatingAdmissionWebhook` | Custom validation logic                    |

```bash
kubectl describe pod kube-apiserver-minikube -n kube-system | grep enable-admission
```

### Securing the API Server

Key `kube-apiserver` flags:

```
--anonymous-auth=false
--authorization-mode=Node,RBAC
--enable-admission-plugins=...
--tls-cert-file / --tls-private-key-file
--client-ca-file
--etcd-certfile / --etcd-keyfile
```

---

## Lab

### 1. Inspect API server security flags

```bash
kubectl describe pod kube-apiserver-minikube -n kube-system | grep -E 'authorization-mode|admission|tls|anonymous'
```

Or read the static pod manifest directly:

```bash
minikube ssh
sudo cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep -E 'authorization|admission|tls'
exit
```

### 2. See all enabled admission controllers

```bash
kubectl exec -n kube-system kube-apiserver-minikube -- kube-apiserver --help 2>&1 | grep -A2 'enable-admission'
```

Or check what's already enabled:

```bash
kubectl describe pod kube-apiserver-minikube -n kube-system | grep enable-admission
```

### 3. ServiceAccount — Pod identity

```bash
# Create a custom ServiceAccount
kubectl create serviceaccount my-sa
kubectl get serviceaccount

# Pod using the custom SA
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: sa-pod
spec:
  serviceAccountName: my-sa
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "cat /var/run/secrets/kubernetes.io/serviceaccount/token; sleep 3600"]
EOF

kubectl logs sa-pod    # JWT token for this SA
```

### 4. Disable automatic ServiceAccount token mounting (security best practice)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: no-sa-pod
spec:
  automountServiceAccountToken: false
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "ls /var/run/secrets/ 2>&1; sleep 3600"]
EOF

kubectl logs no-sa-pod    # directory may not exist
```

### 5. Verify anonymous auth

```bash
# Try to reach the API server without credentials
APISERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
curl -k $APISERVER/api    # should return 403 or 401, not data
```

### Cleanup

```bash
kubectl delete pod sa-pod no-sa-pod 2>/dev/null; true
kubectl delete serviceaccount my-sa 2>/dev/null; true
```

---

## Next

Move on to Lesson 28 — Authentication.
