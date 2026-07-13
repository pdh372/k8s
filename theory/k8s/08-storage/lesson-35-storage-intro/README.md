# Lesson 35 — Storage in Docker vs Kubernetes

## Theory

### Docker Storage

Docker uses a **layered filesystem** (overlay2):

- **Image layers**: read-only, shared between containers using the same image
- **Container layer**: thin writable layer on top — exists only while the container runs
- When the container is deleted, its writable layer is gone — data is lost

Docker **volumes** solve this: they mount a directory from the host (or a managed volume) into the container, surviving container restarts and deletion.

```bash
docker run -v /host/path:/container/path my-image    # bind mount
docker run -v my-volume:/container/path my-image     # named volume
```

### Kubernetes Storage

In Kubernetes, the same problem exists at Pod level: a Pod's container filesystem is ephemeral. But Kubernetes provides more abstractions:

| Concept                       | Scope      | Persists after Pod deleted? |
| ----------------------------- | ---------- | --------------------------- |
| `emptyDir`                    | Pod        | No — deleted with the Pod   |
| `hostPath`                    | Pod + Node | Yes (data stays on Node)    |
| `PersistentVolume (PV)`       | Cluster    | Yes — independent lifecycle |
| `PersistentVolumeClaim (PVC)` | Namespace  | Yes — PVC claims a PV       |

### Storage Lifecycle

```
[Admin] creates PersistentVolume (or StorageClass does it dynamically)
    ↓
[User] creates PersistentVolumeClaim requesting storage
    ↓
[Kubernetes] binds PVC to a matching PV
    ↓
[User] mounts PVC in a Pod spec
    ↓
Container reads/writes to /mount/path
    ↓
Data persists even if Pod is deleted
```

---

## Lab

### 1. `emptyDir` — temporary shared volume

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: emptydir-demo
spec:
  containers:
    - name: writer
      image: busybox
      command: ["/bin/sh", "-c", "echo hello > /data/hello.txt; sleep 3600"]
      volumeMounts:
        - name: shared
          mountPath: /data
    - name: reader
      image: busybox
      command: ["/bin/sh", "-c", "sleep 3; cat /data/hello.txt; sleep 3600"]
      volumeMounts:
        - name: shared
          mountPath: /data
  volumes:
    - name: shared
      emptyDir: {}
EOF

kubectl logs emptydir-demo -c reader    # → hello
```

Delete Pod — emptyDir data is gone:

```bash
kubectl delete pod emptydir-demo
# Data is permanently lost
```

### 2. `hostPath` — mount Node filesystem

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: hostpath-demo
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo 'data from pod' > /node-data/test.txt; sleep 3600"]
      volumeMounts:
        - name: host-vol
          mountPath: /node-data
  volumes:
    - name: host-vol
      hostPath:
        path: /tmp/k8s-hostpath    # path on the Node
        type: DirectoryOrCreate
EOF

# Verify data is on the Node
minikube ssh -- cat /tmp/k8s-hostpath/test.txt
```

`hostPath` is useful for log collection and monitoring agents, but **not for regular app data** — the data is tied to a specific Node.

### 3. Compare with Docker volume behavior

Docker named volumes are managed by Docker and persist across container restarts:

```bash
# (Outside Kubernetes — just for comparison)
docker run --rm -v mydata:/data busybox sh -c "echo hello > /data/test.txt"
docker run --rm -v mydata:/data busybox cat /data/test.txt   # still there
docker volume rm mydata                                       # explicit cleanup
```

The equivalent in Kubernetes: use a PersistentVolume + PersistentVolumeClaim.

### 4. Volume types quick reference

```bash
# ConfigMap as a volume (files from configmap keys)
kubectl create configmap app-config --from-literal=config.yaml="key: value"

cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: configmap-vol
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "cat /config/config.yaml; sleep 3600"]
      volumeMounts:
        - name: config
          mountPath: /config
  volumes:
    - name: config
      configMap:
        name: app-config
EOF

kubectl logs configmap-vol    # → key: value
```

### Cleanup

```bash
kubectl delete pod emptydir-demo hostpath-demo configmap-vol 2>/dev/null; true
kubectl delete configmap app-config 2>/dev/null; true
minikube ssh -- rm -rf /tmp/k8s-hostpath 2>/dev/null; true
```

---

## Next

Move on to Lesson 36 — Container Storage Interface (CSI).
