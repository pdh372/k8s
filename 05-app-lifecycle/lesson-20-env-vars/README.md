# Lesson 20 — Environment Variables

## Theory

Environment variables are the standard Kubernetes mechanism for passing configuration into containers. They are set in `spec.containers[].env` or bulk-injected from a ConfigMap/Secret via `envFrom`.

### Ways to Set Environment Variables

| Method                   | YAML field                         | Source                      |
| ------------------------ | ---------------------------------- | --------------------------- |
| Direct literal           | `env[].value`                      | Inline value in the spec    |
| From ConfigMap key       | `env[].valueFrom.configMapKeyRef`  | Single key from a ConfigMap |
| From Secret key          | `env[].valueFrom.secretKeyRef`     | Single key from a Secret    |
| All keys from ConfigMap  | `envFrom[].configMapRef`           | All keys as env vars        |
| All keys from Secret     | `envFrom[].secretRef`              | All keys as env vars        |
| From Pod/Node metadata   | `env[].valueFrom.fieldRef`         | Downward API                |
| From container resources | `env[].valueFrom.resourceFieldRef` | Downward API                |

### Downward API

Kubernetes can inject metadata about the Pod itself as env vars — useful for logging, metrics, or self-identification:

```yaml
env:
    - name: MY_POD_NAME
      valueFrom:
          fieldRef:
              fieldPath: metadata.name
    - name: MY_POD_IP
      valueFrom:
          fieldRef:
              fieldPath: status.podIP
    - name: MY_CPU_LIMIT
      valueFrom:
          resourceFieldRef:
              resource: limits.cpu
```

---

## Lab

### 1. Direct literal env vars

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: env-demo
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "env | grep -E 'APP_|DB_' | sort; sleep 3600"]
      env:
        - name: APP_COLOR
          value: "blue"
        - name: APP_MODE
          value: "production"
        - name: DB_HOST
          value: "mysql.default.svc.cluster.local"
        - name: DB_PORT
          value: "3306"
EOF

kubectl logs env-demo
```

### 2. Inject from ConfigMap (single keys)

```bash
kubectl create configmap app-config \
  --from-literal=LOG_LEVEL=debug \
  --from-literal=CACHE_TTL=300

cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: env-from-cm
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "env | sort; sleep 3600"]
      env:
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: LOG_LEVEL
        - name: CACHE_TTL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: CACHE_TTL
EOF

kubectl logs env-from-cm | grep -E 'LOG_LEVEL|CACHE_TTL'
```

### 3. Inject all keys from ConfigMap with `envFrom`

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: env-from-all
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "env | sort; sleep 3600"]
      envFrom:
        - configMapRef:
            name: app-config
EOF

kubectl logs env-from-all | grep -E 'LOG_LEVEL|CACHE_TTL'
```

### 4. Inject from Secret

```bash
kubectl create secret generic db-secret \
  --from-literal=DB_USER=admin \
  --from-literal=DB_PASSWORD=s3cr3t

cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: env-from-secret
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo user=$DB_USER pass=$DB_PASSWORD; sleep 3600"]
      envFrom:
        - secretRef:
            name: db-secret
EOF

kubectl logs env-from-secret
```

### 5. Downward API — Pod self-awareness

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: downward-demo
  labels:
    app: myapp
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "env | grep MY_; sleep 3600"]
      resources:
        limits:
          cpu: "500m"
          memory: "128Mi"
      env:
        - name: MY_POD_NAME
          valueFrom:
            fieldRef:
              fieldPath: metadata.name
        - name: MY_NAMESPACE
          valueFrom:
            fieldRef:
              fieldPath: metadata.namespace
        - name: MY_POD_IP
          valueFrom:
            fieldRef:
              fieldPath: status.podIP
        - name: MY_CPU_LIMIT
          valueFrom:
            resourceFieldRef:
              resource: limits.cpu
        - name: MY_MEM_LIMIT
          valueFrom:
            resourceFieldRef:
              resource: limits.memory
EOF

kubectl logs downward-demo
```

### 6. Verify env in running container

```bash
kubectl exec env-demo -- env
kubectl exec env-demo -- printenv APP_COLOR
```

### Cleanup

```bash
kubectl delete pod env-demo env-from-cm env-from-all env-from-secret downward-demo 2>/dev/null; true
kubectl delete configmap app-config 2>/dev/null; true
kubectl delete secret db-secret 2>/dev/null; true
```

---

## Next

Move on to Lesson 21 — ConfigMaps and Secrets.
