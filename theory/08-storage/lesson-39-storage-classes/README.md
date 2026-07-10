# Lesson 39 — Storage Classes

## Theory

A **StorageClass** defines a "class" of storage — specifying the provisioner, parameters, and reclaim policy for dynamically provisioned PersistentVolumes. Instead of an admin pre-creating PVs, a StorageClass + PVC triggers **automatic PV creation**.

### Static vs Dynamic Provisioning

|               | Static                                      | Dynamic                                           |
| ------------- | ------------------------------------------- | ------------------------------------------------- |
| PV created by | Admin (manual)                              | StorageClass provisioner (automatic)              |
| Workflow      | Admin creates PV → user creates PVC → binds | User creates PVC → provisioner creates PV + binds |
| When to use   | On-prem, custom storage                     | Cloud, standard storage                           |

### StorageClass Fields

| Field                  | Description                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `provisioner`          | The plugin that creates the underlying storage (e.g. `kubernetes.io/aws-ebs`, `pd.csi.storage.gke.io`) |
| `parameters`           | Provisioner-specific settings (disk type, IOPS, encryption…)                                           |
| `reclaimPolicy`        | `Delete` (default) or `Retain`                                                                         |
| `allowVolumeExpansion` | Whether PVCs can be resized after creation                                                             |
| `volumeBindingMode`    | `Immediate` or `WaitForFirstConsumer`                                                                  |

### `volumeBindingMode: WaitForFirstConsumer`

With `Immediate` (default), the PV is provisioned as soon as the PVC is created — regardless of where the Pod will be scheduled. This can fail on zone-specific storage (e.g. AWS EBS in us-east-1a but Pod scheduled in us-east-1b).

`WaitForFirstConsumer` delays PV provisioning until a Pod using the PVC is scheduled. The provisioner then creates the PV in the same zone as the Pod.

---

## YAML

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
    name: fast-ssd
provisioner: pd.csi.storage.gke.io # GKE example
parameters:
    type: pd-ssd
    replication-type: regional-pd
reclaimPolicy: Retain
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

---

## Lab

### 1. View existing StorageClasses

```bash
kubectl get storageclass
kubectl get sc    # short alias

kubectl describe storageclass standard
```

Look for:

- `Provisioner` — plugin name
- `ReclaimPolicy` — Delete or Retain
- `VolumeBindingMode` — Immediate or WaitForFirstConsumer
- `AllowVolumeExpansion` — true/false

### 2. Default StorageClass

The StorageClass with annotation `storageclass.kubernetes.io/is-default-class: "true"` is used when a PVC doesn't specify a `storageClassName`.

```bash
kubectl get sc standard -o jsonpath='{.metadata.annotations}'
```

### 3. Create a custom StorageClass (local hostPath provisioner)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: slow-hdd
provisioner: docker.io/hostpath         # Minikube built-in provisioner
reclaimPolicy: Delete
volumeBindingMode: Immediate
EOF

kubectl get storageclass
```

### 4. Use the custom StorageClass in a PVC

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: sc-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
  storageClassName: standard    # use Minikube's standard class
EOF

kubectl get pvc sc-pvc
kubectl get pv    # auto-provisioned PV
```

### 5. Prevent dynamic provisioning (explicit empty storageClass)

```bash
cat <<'EOF' | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: static-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Mi
  storageClassName: ""    # empty = no StorageClass, no dynamic provisioning
EOF

kubectl get pvc static-pvc    # STATUS: Pending (no matching static PV)
```

### 6. Set a new default StorageClass

```bash
# Remove default annotation from current default
kubectl patch storageclass standard \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'

# Set our custom class as default (just for illustration)
kubectl patch storageclass slow-hdd \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'

kubectl get sc    # slow-hdd should show (default)

# Restore
kubectl patch storageclass slow-hdd \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"false"}}}'
kubectl patch storageclass standard \
  -p '{"metadata":{"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
```

### Cleanup

```bash
kubectl delete pvc sc-pvc static-pvc 2>/dev/null; true
kubectl delete storageclass slow-hdd 2>/dev/null; true
```

---

## Next

Storage section complete. Move on to Lesson 40 — Networking Prerequisites.
