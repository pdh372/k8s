# Lesson 25 — Kubernetes Cluster Upgrade

## Theory

Kubernetes follows a strict versioning and upgrade process. Understanding it is required for the CKA exam.

### Version Skew Policy

Kubernetes components must be within a supported version range of each other:

```
kube-apiserver: N
kube-controller-manager, kube-scheduler: N or N-1
kubelet, kube-proxy: N, N-1, or N-2
kubectl: N-1, N, or N+1
```

**You must upgrade one minor version at a time.** You cannot skip from 1.27 directly to 1.29.

### Upgrade Order

1. **Control plane first** (API server, controller-manager, scheduler)
2. **Worker nodes after** (kubelet, kube-proxy on each Node)

Worker nodes can be upgraded:

- All at once (downtime)
- One at a time (drain → upgrade → uncordon)
- Rolling node addition (add new version node, remove old node)

### `kubeadm upgrade` Workflow

```
kubeadm upgrade plan         # shows available versions and what will be upgraded
kubeadm upgrade apply v1.X.Y # upgrades control plane components
```

Then on each node:

```
apt-get install kubeadm=1.X.Y-*    # upgrade kubeadm on the node
kubeadm upgrade node               # upgrade node config
apt-get install kubelet=1.X.Y-* kubectl=1.X.Y-*
systemctl daemon-reload
systemctl restart kubelet
```

### Component Version Check

```bash
kubectl version                          # client and server version
kubectl get nodes                        # kubelet version per node
kubeadm version                          # kubeadm version
```

---

## Lab (on Minikube — illustrative, not a real multi-version upgrade)

> Minikube manages its own Kubernetes version via `--kubernetes-version`. A real upgrade uses `kubeadm`. This lab focuses on understanding the commands and process.

### 1. Check current versions

```bash
kubectl version --short 2>/dev/null || kubectl version
kubectl get nodes    # shows Kubernetes VERSION (kubelet) for each node
kubeadm version
```

### 2. Check what kubeadm can upgrade to (on a real kubeadm cluster)

```bash
# On a kubeadm cluster (not Minikube):
kubeadm upgrade plan
```

Example output:

```
COMPONENT            CURRENT   AVAILABLE
kube-apiserver       v1.28.0   v1.29.0
kube-controller-manager v1.28.0   v1.29.0
kube-scheduler       v1.28.0   v1.29.0
kube-proxy           v1.28.0   v1.29.0
CoreDNS              v1.10.1   v1.11.1
etcd                 3.5.9-0   3.5.12-0
```

### 3. Simulate a kubeadm control plane upgrade

```bash
# Step 1: Upgrade kubeadm itself first
# sudo apt-get update
# sudo apt-get install -y kubeadm=1.29.0-*

# Step 2: Check the plan
# sudo kubeadm upgrade plan v1.29.0

# Step 3: Apply the upgrade
# sudo kubeadm upgrade apply v1.29.0

# Step 4: Upgrade kubelet and kubectl on control plane node
# sudo apt-get install -y kubelet=1.29.0-* kubectl=1.29.0-*
# sudo systemctl daemon-reload
# sudo systemctl restart kubelet
```

### 4. Worker node upgrade procedure

```bash
# On control plane: drain the worker node
kubectl drain worker-node-1 --ignore-daemonsets --delete-emptydir-data

# SSH to worker-node-1:
# sudo apt-get update
# sudo apt-get install -y kubeadm=1.29.0-*
# sudo kubeadm upgrade node
# sudo apt-get install -y kubelet=1.29.0-* kubectl=1.29.0-*
# sudo systemctl daemon-reload
# sudo systemctl restart kubelet

# Back on control plane: uncordon
kubectl uncordon worker-node-1

# Verify
kubectl get nodes    # worker-node-1 should show new version
```

### 5. Minikube — upgrade Kubernetes version

```bash
minikube stop
minikube delete
minikube start --kubernetes-version=v1.30.0
kubectl version
```

### 6. Key exam reminders

- Never skip minor versions: 1.27 → 1.28 → 1.29 (not 1.27 → 1.29)
- Upgrade kubeadm first, then control plane, then worker kubelets
- Drain worker nodes before upgrading kubelet on them
- Check `kubeadm upgrade plan` to see available versions

---

## Next

Move on to Lesson 26 — Backup and Restore (etcd).
