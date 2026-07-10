# Lesson 38 — PersistentVolumeClaims (PVC)

## Theory

A **PersistentVolumeClaim (PVC)** is a request for storage by a user. It specifies size, access mode, and optionally a StorageClass or label selector. Kubernetes finds a matching PV and **binds** them together.

### Binding Rules

A PVC binds to a PV when:

1. The PV's **access modes** include all access modes the PVC requests.
2. The PV's **capacity** is ≥ the PVC's requested size.
3. The PV's **storageClassName** matches the PVC's (or both are empty).
4. The PV's **labels** match the PVC's `selector` (if specified).

Binding is **one-to-one** — a PV can be bound to only one PVC at a time.

### Using a PVC in a Pod

```yaml
volumes:
    - name: my-vol
      persistentVolumeClaim:
          claimName: my-pvc # reference by name
```

### PVC Lifecycle

```
PVC created → finds matching PV → STATUS: Bound
Pod uses PVC → data written
Pod deleted → PVC still Bound (data safe)
PVC deleted → PV released → reclaim policy kicks in (Retain/Delete)
```

---

## YAML

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
    name: my-pvc
spec:
    accessModes:
        - ReadWriteOnce
    resources:
        requests:
            storage: 500Mi
    storageClassName: standard # or "" for no StorageClass
```

---

## Lab

### 1. Create a PV and matching PVC

```bash
minikube ssh -- mkdir -p /tmp/pvc-lab

cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
  name: lab-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /tmp/pvc-lab
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: lab-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 500Mi
  storageClassName: manual
EOF

kubectl get pv lab-pv      # STATUS: Bound
kubectl get pvc lab-pvc    # STATUS: Bound, VOLUME: lab-pv
```

PVC requested 500Mi, PV offered 1Gi — the binding succeeds (PV ≥ PVC). The full 1Gi is reserved for this PVC (no partial allocation).

### 2. Mount PVC in a Pod

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "echo 'persistent data' > /storage/data.txt; cat /storage/data.txt; sleep 3600"]
      volumeMounts:
        - name: storage
          mountPath: /storage
  volumes:
    - name: storage
      persistentVolumeClaim:
        claimName: lab-pvc
EOF

kubectl logs pvc-pod    # → persistent data
```

### 3. Data persists across Pod restarts

```bash
# Delete and recreate the Pod
kubectl delete pod pvc-pod

cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: pvc-pod-2
spec:
  containers:
    - name: app
      image: busybox
      command: ["/bin/sh", "-c", "cat /storage/data.txt; sleep 3600"]
      volumeMounts:
        - name: storage
          mountPath: /storage
  volumes:
    - name: storage
      persistentVolumeClaim:
        claimName: lab-pvc
EOF

kubectl logs pvc-pod-2    # → persistent data (still there!)
```

### 4. Dynamic provisioning with the default StorageClass

If you don't set `storageClassName` (or set it to the default), Kubernetes dynamically provisions a new PV:

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 200Mi
EOF

kubectl get pvc dynamic-pvc    # STATUS: Bound (auto-provisioned PV)
kubectl get pv                  # new PV auto-created
```

### 5. Expand a PVC (resize)

```bash
# Check if the StorageClass supports expansion
kubectl get storageclass standard -o jsonpath='{.allowVolumeExpansion}'

# Edit PVC to request more storage
kubectl patch pvc dynamic-pvc -p '{"spec":{"resources":{"requests":{"storage":"500Mi"}}}}'
kubectl get pvc dynamic-pvc    # watch for size update
```

### 6. What happens when PVC is deleted (Retain policy)

```bash
kubectl delete pod pvc-pod-2
kubectl delete pvc lab-pvc

kubectl get pv lab-pv    # STATUS: Released (not Available yet!)
# With Retain policy: data is preserved, PV is not re-usable until admin manually reclaims it

# To reclaim: admin must manually delete or edit the PV's claimRef
kubectl patch pv lab-pv --type=json \
  -p='[{"op":"remove","path":"/spec/claimRef"}]'

kubectl get pv lab-pv    # STATUS: Available again
```

### Cleanup

```bash
kubectl delete pod pvc-pod pvc-pod-2 2>/dev/null; true
kubectl delete pvc lab-pvc dynamic-pvc 2>/dev/null; true
kubectl delete pv lab-pv 2>/dev/null; true
```

---

## Next

Move on to Lesson 39 — Storage Classes.
