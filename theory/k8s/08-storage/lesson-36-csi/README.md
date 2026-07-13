# Lesson 36 — Container Storage Interface (CSI)

## Theory

The **Container Storage Interface (CSI)** is a standard API specification that allows storage vendors to write a single plugin (driver) that works with any container orchestrator (Kubernetes, Mesos, Cloud Foundry, etc.).

Before CSI, storage drivers were compiled directly into the Kubernetes codebase ("in-tree" plugins). This meant:

- Adding a new storage provider required a Kubernetes core change
- Bugs in a storage driver could crash the whole kubelet
- Vendors had to coordinate with the Kubernetes release cycle

CSI solved all this by moving storage drivers **out-of-tree** — each driver runs as a separate set of Pods in the cluster.

### CSI Architecture

```
Kubernetes → CSI Driver Pods (DaemonSet + StatefulSet)
                    ↓
            Storage backend (AWS EBS, GCE PD, NFS, Ceph, etc.)
```

CSI driver components:

- **Node plugin** (DaemonSet): mounts/unmounts volumes on each Node
- **Controller plugin** (StatefulSet/Deployment): creates/deletes/attaches volumes with the storage API

### Common CSI Drivers

| Driver                  | Storage backend         |
| ----------------------- | ----------------------- |
| `ebs.csi.aws.com`       | AWS Elastic Block Store |
| `pd.csi.storage.gke.io` | GCE Persistent Disk     |
| `file.csi.azure.com`    | Azure Files             |
| `disk.csi.azure.com`    | Azure Disk              |
| `nfs.csi.k8s.io`        | NFS (community)         |
| `rbd.csi.ceph.com`      | Ceph RBD                |
| `driver.longhorn.io`    | Longhorn (open source)  |

### In-tree to CSI Migration

Old in-tree plugins (e.g. `kubernetes.io/aws-ebs`) are being replaced by CSI equivalents. In K8s 1.23+ most in-tree plugins are deprecated; CSI drivers are the standard going forward.

---

## Lab

### 1. Check available storage on Minikube

Minikube ships with a built-in provisioner (`standard` StorageClass backed by hostPath):

```bash
kubectl get storageclass
kubectl describe storageclass standard
```

### 2. Install a simple CSI driver — NFS (optional, for practice)

```bash
# Install the NFS CSI driver via Helm (optional — requires Helm)
# helm repo add csi-driver-nfs https://raw.githubusercontent.com/kubernetes-csi/csi-driver-nfs/master/charts
# helm install csi-driver-nfs csi-driver-nfs/csi-driver-nfs --namespace kube-system

# Check CSI driver pods
kubectl get pods -n kube-system | grep csi
```

### 3. Observe the CSI driver architecture in Minikube

```bash
# Minikube's storage provisioner is a simplified in-tree provisioner
kubectl get pods -n kube-system | grep storage
kubectl describe pod -n kube-system -l app=storage-provisioner

# StorageClass uses the provisioner plugin name
kubectl get storageclass standard -o yaml | grep provisioner
```

### 4. Verify CSI drivers registered in the cluster

```bash
kubectl get csidrivers
kubectl get csinodes
kubectl get csinodeinfos 2>/dev/null; true    # older API
```

### 5. CSI volume lifecycle

When a PVC is created with a CSI-backed StorageClass:

```
1. PVC created → dynamic provisioning triggered
2. CSI controller plugin called: CreateVolume()
3. PV created, bound to PVC
4. Pod scheduled to a Node
5. CSI node plugin called: NodeStageVolume() + NodePublishVolume()
6. Volume appears in container
7. Pod deleted → NodeUnpublishVolume() + NodeUnstageVolume()
8. PV/PVC deleted → DeleteVolume()
```

### 6. Check CSI capabilities

```bash
# See what capabilities a driver supports (snapshots, resizing, etc.)
kubectl get csidrivers -o yaml
```

---

## Next

Move on to Lesson 37 — Persistent Volumes and Access Modes.
