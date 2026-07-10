# Lesson 37 — Persistent Volumes (PV)

## Theory

A **PersistentVolume (PV)** is a piece of storage in the cluster provisioned by an admin (or dynamically by a StorageClass). It has an independent lifecycle from any Pod that uses it — when a Pod is deleted, the PV remains.

### PV vs PVC

| Object                          | Created by                     | Purpose                                  |
| ------------------------------- | ------------------------------ | ---------------------------------------- |
| **PersistentVolume (PV)**       | Admin (or dynamic provisioner) | Represents actual storage                |
| **PersistentVolumeClaim (PVC)** | Developer/user                 | Requests storage; binds to a matching PV |

This separation means developers don't need to know about the underlying storage infrastructure — they just request storage via a PVC.

### Access Modes

| Mode               | Short  | Meaning                                            |
| ------------------ | ------ | -------------------------------------------------- |
| `ReadWriteOnce`    | `RWO`  | Mounted read-write by a **single Node**            |
| `ReadOnlyMany`     | `ROX`  | Mounted read-only by **many Nodes**                |
| `ReadWriteMany`    | `RWX`  | Mounted read-write by **many Nodes**               |
| `ReadWriteOncePod` | `RWOP` | Mounted read-write by a **single Pod** (K8s 1.22+) |

> Not all storage backends support all access modes. AWS EBS supports only RWO. NFS supports RWX.

### Reclaim Policies

What happens when the PVC bound to a PV is deleted:

| Policy    | Behavior                                                                |
| --------- | ----------------------------------------------------------------------- |
| `Retain`  | PV stays with data; must be manually reclaimed                          |
| `Delete`  | PV and underlying storage are automatically deleted                     |
| `Recycle` | Deprecated — basic scrub (`rm -rf /volume/*`) then make available again |

### PV Phases

```
Available → Bound → Released → (Retain: needs manual cleanup) / (Delete: gone)
```

---

## YAML

**PersistentVolume (hostPath — for local dev):**

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
    name: pv-local
spec:
    capacity:
        storage: 1Gi
    accessModes:
        - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    hostPath:
        path: /tmp/pv-data
```

---

## Lab

### 1. Create a PersistentVolume

```bash
minikube ssh -- mkdir -p /tmp/pv-data
minikube ssh -- mkdir -p /tmp/pv-data-2

cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-1
spec:
  capacity:
    storage: 500Mi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /tmp/pv-data
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-2
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteMany
  persistentVolumeReclaimPolicy: Delete
  hostPath:
    path: /tmp/pv-data-2
EOF

kubectl get pv
# CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS      CLAIM
# 500Mi      RWO            Retain           Available
# 1Gi        RWX            Delete           Available
```

### 2. Inspect PV details

```bash
kubectl describe pv pv-1
kubectl describe pv pv-2
```

Note the **STATUS: Available** — no PVC has claimed it yet.

### 3. View what the Minikube default StorageClass PVs look like

```bash
kubectl get pv    # may also show auto-provisioned PVs from previous labs
kubectl describe pv -l provisioned-by     # filter by label
```

### 4. Labels and selectors on PVs (for targeted binding)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-ssd
  labels:
    type: ssd
spec:
  capacity:
    storage: 500Mi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /tmp/pv-ssd
EOF

# A PVC can use matchLabels to request this specific PV
```

### 5. Storage capacity planning

```bash
# See all PVs with status
kubectl get pv -o custom-columns=NAME:.metadata.name,CAPACITY:.spec.capacity.storage,STATUS:.status.phase,CLAIM:.spec.claimRef.name
```

### 6. PV storageClassName binding

Setting `storageClassName: ""` (empty) means "bind only to PVs with no storageClass" — prevents dynamic provisioning. Setting `storageClassName: manual` on both PV and PVC ensures they bind to each other.

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-manual
spec:
  capacity:
    storage: 500Mi
  accessModes:
    - ReadWriteOnce
  storageClassName: manual    # specific class name
  persistentVolumeReclaimPolicy: Retain
  hostPath:
    path: /tmp/pv-manual
EOF

minikube ssh -- mkdir -p /tmp/pv-manual
kubectl get pv pv-manual
```

### Cleanup

```bash
kubectl delete pv pv-1 pv-2 pv-ssd pv-manual 2>/dev/null; true
```

---

## Next

Move on to Lesson 38 — PersistentVolumeClaims (PVC).
