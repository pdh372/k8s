# Lesson 31 — RBAC (Role-Based Access Control)

## Theory

RBAC controls **who can do what on which resources**. It uses four object types:

| Object                 | Scope        | What it does                                                                |
| ---------------------- | ------------ | --------------------------------------------------------------------------- |
| **Role**               | Namespace    | Defines permissions within one namespace                                    |
| **ClusterRole**        | Cluster-wide | Defines permissions across all namespaces (or for cluster-scoped resources) |
| **RoleBinding**        | Namespace    | Grants a Role or ClusterRole to a subject within one namespace              |
| **ClusterRoleBinding** | Cluster-wide | Grants a ClusterRole to a subject across the whole cluster                  |

### Permission Structure

```yaml
rules:
    - apiGroups: [''] # "" = core API group (Pods, Services, ConfigMaps...)
      resources: ['pods'] # resource type
      verbs: ['get', 'list', 'watch'] # allowed actions
```

### Verbs Reference

| Verb               | HTTP Method         | Description             |
| ------------------ | ------------------- | ----------------------- |
| `get`              | GET                 | Read a single resource  |
| `list`             | GET (collection)    | Read multiple resources |
| `watch`            | GET + watch param   | Stream changes          |
| `create`           | POST                | Create a resource       |
| `update`           | PUT                 | Full replace            |
| `patch`            | PATCH               | Partial update          |
| `delete`           | DELETE              | Delete a resource       |
| `deletecollection` | DELETE (collection) | Delete multiple         |

### Subjects

A RoleBinding/ClusterRoleBinding grants to a **subject**:

- `kind: User` — a human user (name = CN in cert)
- `kind: Group` — a group (name = O in cert)
- `kind: ServiceAccount` — a ServiceAccount (needs namespace)

### `kubectl auth can-i`

Quickly check permissions:

```bash
kubectl auth can-i create pods                      # as current user
kubectl auth can-i create pods --as=alice           # impersonate alice
kubectl auth can-i create pods --as=alice -n dev    # in namespace dev
kubectl auth can-i '*' '*'                          # can I do everything?
```

---

## YAML

**Role:**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
    name: pod-reader
    namespace: default
rules:
    - apiGroups: ['']
      resources: ['pods']
      verbs: ['get', 'list', 'watch']
```

**RoleBinding:**

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
    name: alice-pod-reader
    namespace: default
subjects:
    - kind: User
      name: alice
      apiGroup: rbac.authorization.k8s.io
roleRef:
    kind: Role
    name: pod-reader
    apiGroup: rbac.authorization.k8s.io
```

---

## Lab

### 1. Check current permissions

```bash
kubectl auth can-i '*' '*'                  # as admin: yes
kubectl auth can-i create deployments       # as admin: yes
kubectl auth can-i delete nodes             # as admin: yes
```

### 2. Create a Role (namespace-scoped)

```bash
# Imperative
kubectl create role pod-reader \
  --verb=get,list,watch \
  --resource=pods \
  --namespace=default

# Or YAML
cat <<'EOF' | kubectl apply -f -
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dev-role
  namespace: default
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
EOF

kubectl get roles
kubectl describe role dev-role
```

### 3. Bind the Role to a user

```bash
kubectl create rolebinding alice-dev \
  --role=dev-role \
  --user=alice \
  --namespace=default

kubectl get rolebinding
kubectl describe rolebinding alice-dev
```

### 4. Test permissions with impersonation

```bash
kubectl auth can-i get pods --as=alice                   # yes
kubectl auth can-i delete pods --as=alice                # no
kubectl auth can-i create deployments --as=alice         # yes
kubectl auth can-i delete deployments --as=alice         # no
kubectl auth can-i get pods --as=alice -n kube-system    # no (role is in default)
```

### 5. ClusterRole and ClusterRoleBinding

```bash
# ClusterRole: read Pods across ALL namespaces
kubectl create clusterrole pod-cluster-reader \
  --verb=get,list,watch \
  --resource=pods

# Bind to a group (all developers)
kubectl create clusterrolebinding developers-read-pods \
  --clusterrole=pod-cluster-reader \
  --group=developers

# Test (alice is in group "developers" per her cert O=developers)
kubectl auth can-i get pods --as=alice -n kube-system    # yes now
```

### 6. ServiceAccount permissions

```bash
kubectl create serviceaccount my-app-sa
kubectl create role sa-role --verb=get,list --resource=configmaps
kubectl create rolebinding sa-binding --role=sa-role --serviceaccount=default:my-app-sa

# Test
kubectl auth can-i get configmaps \
  --as=system:serviceaccount:default:my-app-sa    # yes
kubectl auth can-i delete configmaps \
  --as=system:serviceaccount:default:my-app-sa    # no
```

### 7. Use a ClusterRole with a RoleBinding (restrict to one namespace)

A ClusterRole can be bound to a specific namespace via a RoleBinding (not ClusterRoleBinding). This lets you reuse a common set of permissions in a specific namespace.

```bash
kubectl create rolebinding alice-ns-admin \
  --clusterrole=admin \
  --user=alice \
  --namespace=dev    # alice is admin in dev only, not cluster-wide
```

### 8. List what a user can do

```bash
# Using auth can-i --list (shows all permissions for the current user)
kubectl auth can-i --list
kubectl auth can-i --list --as=alice
```

### Cleanup

```bash
kubectl delete role pod-reader dev-role 2>/dev/null; true
kubectl delete rolebinding alice-dev alice-ns-admin sa-binding 2>/dev/null; true
kubectl delete clusterrole pod-cluster-reader 2>/dev/null; true
kubectl delete clusterrolebinding developers-read-pods 2>/dev/null; true
kubectl delete serviceaccount my-app-sa 2>/dev/null; true
```

---

## Next

Move on to Lesson 32 — Image Security and Private Registries.
