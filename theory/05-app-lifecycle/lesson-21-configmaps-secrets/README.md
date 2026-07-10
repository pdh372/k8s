# Lesson 21 — ConfigMaps and Secrets

## Theory

### ConfigMaps

A **ConfigMap** stores non-sensitive configuration data as key-value pairs. It decouples configuration from the container image so you can change settings without rebuilding.

**Sources:**

- `--from-literal`: key=value inline
- `--from-file`: file content as the value (key = filename)
- `--from-env-file`: `.env` style file (`KEY=value` per line)
- YAML `data:` block

**Consumed by Pods as:**

- Environment variables (`env` or `envFrom`)
- Volume mount (each key becomes a file in the mounted directory)
- Command-line arguments

### Secrets

A **Secret** stores sensitive data (passwords, tokens, TLS certs). It is functionally similar to ConfigMap but:

- Values are **base64-encoded** (not encrypted) by default.
- Kubernetes avoids writing Secret values to disk on the Node (uses `tmpfs`).
- RBAC lets you restrict who can read Secrets separately from ConfigMaps.
- Can be encrypted at rest with `EncryptionConfiguration` (covered below).

> ⚠️ Base64 is encoding, not encryption. Anyone with API access can decode a Secret. Use external secret managers (Vault, AWS Secrets Manager) or EncryptionConfiguration for real protection.

### Secret Types

| Type                                  | Use case                    |
| ------------------------------------- | --------------------------- |
| `Opaque` (default)                    | Arbitrary user-defined data |
| `kubernetes.io/tls`                   | TLS certificates            |
| `kubernetes.io/dockerconfigjson`      | Docker registry credentials |
| `kubernetes.io/service-account-token` | Service account tokens      |

---

## YAML

**ConfigMap:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
    name: app-config
data:
    LOG_LEVEL: 'debug'
    APP_COLOR: 'blue'
    config.properties: |
        server.port=8080
        server.threads=10
```

**Secret (base64-encoded values):**

```yaml
apiVersion: v1
kind: Secret
metadata:
    name: db-secret
type: Opaque
data:
    username: YWRtaW4= # base64 of "admin"
    password: cEBzc3dvcmQ= # base64 of "p@ssword"
```

Encode/decode:

```bash
echo -n "admin" | base64          # encode
echo -n "YWRtaW4=" | base64 -d   # decode
```

---

## Lab

### 1. Create ConfigMap — multiple methods

```bash
# From literals
kubectl create configmap app-config \
  --from-literal=ENV=production \
  --from-literal=LOG_LEVEL=info

# From a file
echo "server.port=8080" > app.properties
kubectl create configmap props-config --from-file=app.properties

# From an env file
cat > app.env << 'EOF'
DB_HOST=mysql
DB_PORT=3306
EOF
kubectl create configmap env-config --from-env-file=app.env

kubectl get configmap
kubectl describe configmap app-config
```

### 2. Mount ConfigMap as environment variables

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: cm-env-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "env | sort; sleep 3600"]
      envFrom:
        - configMapRef:
            name: app-config
EOF

kubectl logs cm-env-pod | grep -E 'ENV|LOG_LEVEL'
```

### 3. Mount ConfigMap as a volume

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: cm-vol-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "cat /config/app.properties; sleep 3600"]
      volumeMounts:
        - name: config-vol
          mountPath: /config
  volumes:
    - name: config-vol
      configMap:
        name: props-config
EOF

kubectl logs cm-vol-pod
# → server.port=8080
```

Volume mount: each key in the ConfigMap becomes a **file** in the mount directory. Live updates (ConfigMap changes) propagate to mounted files within ~60 seconds (not to env vars — those only update on Pod restart).

### 4. Create and use a Secret

```bash
kubectl create secret generic db-secret \
  --from-literal=username=admin \
  --from-literal=password='p@ssword!'

# View (values are base64-encoded)
kubectl get secret db-secret -o yaml
kubectl get secret db-secret -o jsonpath='{.data.password}' | base64 -d
```

Mount Secret as env:

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: secret-env-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo user=$DB_USER pass=$DB_PASS; sleep 3600"]
      env:
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: username
        - name: DB_PASS
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
EOF

kubectl logs secret-env-pod
```

### 5. Mount Secret as a volume

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: secret-vol-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "cat /secrets/username; echo; cat /secrets/password; sleep 3600"]
      volumeMounts:
        - name: secret-vol
          mountPath: /secrets
          readOnly: true
  volumes:
    - name: secret-vol
      secret:
        secretName: db-secret
EOF

kubectl logs secret-vol-pod
```

### 6. Encrypting Secrets at Rest

Check if encryption is configured:

```bash
minikube ssh
sudo cat /etc/kubernetes/manifests/kube-apiserver.yaml | grep encryption
exit
```

To enable, create an `EncryptionConfiguration` file and pass it to the API server with `--encryption-provider-config`. This encrypts Secret values in etcd using AES-CBC or AES-GCM.

```bash
# Verify a secret is encrypted in etcd (requires etcdctl access)
minikube ssh
sudo ETCDCTL_API=3 etcdctl \
  --endpoints=127.0.0.1:2379 \
  --cert=/etc/kubernetes/pki/etcd/server.crt \
  --key=/etc/kubernetes/pki/etcd/server.key \
  --cacert=/etc/kubernetes/pki/etcd/ca.crt \
  get /registry/secrets/default/db-secret | hexdump -C | head
exit
# Without encryption you'll see plaintext values
```

### Cleanup

```bash
kubectl delete pod cm-env-pod cm-vol-pod secret-env-pod secret-vol-pod 2>/dev/null; true
kubectl delete configmap app-config props-config env-config 2>/dev/null; true
kubectl delete secret db-secret 2>/dev/null; true
rm -f app.properties app.env
```

---

## Next

Move on to Lesson 22 — Multi-Container Pods.
